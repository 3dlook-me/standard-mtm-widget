import {
  h,
  Component,
  Fragment,
} from 'preact';
import { route } from 'preact-router';
import API from '@3dlook/saia-sdk/lib/api';
import { connect } from 'react-redux';
import axios from 'axios';

import NoSleep from 'nosleep.js';

import { CameraWrapper } from '../../components/CameraWrapper/CameraWrapper';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { store } from '../../store';
import {
  send,
  wait,
  mobileFlowStatusUpdate,
  isMobileDevice,
  filterCustomMeasurements,
  getFileSize,
  getNetworkInfo,
  isSlowNetwork,
  getDynamicUploadTimeout,
  base64ToBlob,
} from '../../helpers/utils';
import { savePhoto, deletePhoto, getPhoto } from '../../helpers/photoStorage';

import analyticsService, {
  FRONT_PHOTO_PAGE_OPEN_CAMERA,
  SIDE_PHOTO_PAGE_OPEN_CAMERA,
  FRONT_PHOTO_PAGE_PHOTO_TAKEN,
  SIDE_PHOTO_PAGE_PHOTO_TAKEN,
  MAGIC_SCREEN_PAGE_ENTER,
  MAGIC_SCREEN_PAGE_LEAVE,
  MAGIC_SCREEN_PAGE_SUCCESS,
  MAGIC_SCREEN_PAGE_FAILED,
  MAGIC_SCREEN_PHOTO_UPLOAD_START,
  MAGIC_SCREEN_PHOTO_UPLOAD_FINISH,
} from '../../services/analyticsService';
import {
  Preloader
} from '../../components';
import { flowStatuses } from '../../configs/flowStatuses';
import howToStandFront from '../../images/how_to_stand_front.jpg';
import howToStandFrontMen from '../../images/how_to_stand_front_men.jpg';
import howToStandSide from '../../images/how_to_stand_side.jpg';
import howToStandSideMen from '../../images/how_to_stand_side_men.jpg';

import './Upload.scss';

const howToStandImages = {
  female: {
    front: howToStandFront,
    side: howToStandSide,
  },
  male: {
    front: howToStandFrontMen,
    side: howToStandSideMen,
  },
};

let isPhoneLocked = false;
let isRefreshed = false;

const noSleep = new NoSleep();

/**
 * Upload page component.
 */
class Upload extends Component {
  constructor(props) {
    super(props);

    this.init(props);

    this.state = {
      isFrontImageValid: true,
      isSideImageValid: true,

      frontJustCaptured: false,

      isPending: false,

      isSlowNetworkDetected: false,

      standInstructionStep: null,
      pendingCamera: null,
      seenStandInstructions: {
        front: false,
        side: false,
      },
    };

    this.axios = axios.create();
    this.axios.defaults.headers = {
      Authorization: `UUID ${this.props.token}`,
    };

    const { setPageReloadStatus } = props;

    this.reloadListener = () => {
      isRefreshed = true;
      setPageReloadStatus(true);
      noSleep.disable();
    };

    window.addEventListener('unload', this.reloadListener);
  }

  componentWillReceiveProps(nextProps) {
    this.init(nextProps);
  }

  componentWillUnmount() {
    const { setCamera } = this.props;

    setCamera(null);

    if (this.unsubscribe) this.unsubscribe();

    clearInterval(this.timer);

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('webkitvisibilitychange', this.handleVisibilityChange);
    window.removeEventListener('unload', this.reloadListener);
    window.removeEventListener('offline', this.setOfflineStatus);

    if (noSleep._wakeLock) {
      noSleep.disable();
    }
  }

  componentDidMount() {
    const {
      camera,
      setIsNetwork,
      isNetwork,
      flowId,
      pageReloadStatus,
      isFromDesktopToMobile,
      isDemoWidget,
      token,
      isRetakeFlow,
      frontImage,
      sideImage,
      personId,
      setPersonId,
      taskId,
      setTaskId,
    } = this.props;

    window.addEventListener('offline', this.setOfflineStatus);
    document.addEventListener('click', this.disableDeviceScreenLock, { once: true });

    if (camera) {
      const { setCamera } = this.props;
      setCamera(null);
    }

    if (!isNetwork) {
      setIsNetwork(true);
    }

    if (token && flowId && !this.flow) {
      this.flow = new FlowService(token);
      this.flow.setFlowId(flowId);

      if ((pageReloadStatus && isFromDesktopToMobile) || (pageReloadStatus && isDemoWidget)) {
        const { flowState, setPageReloadStatus } = this.props;
        setPageReloadStatus(false);
        mobileFlowStatusUpdate(this.flow, flowState);
      }
    }

    // ----------------------------------------------------
    // Restore personId & taskId from localStorage
    // ----------------------------------------------------
    let savedPersonId = null;
    let savedTaskId = null;

    try {
      if (token) {
        savedPersonId = localStorage.getItem(`personId_${token}`);
        savedTaskId = localStorage.getItem(`taskId_${token}`);

        if (savedPersonId && !personId) {
          setPersonId(savedPersonId);
        }

        if (savedTaskId && !taskId) {
          setTaskId(savedTaskId);
        }
      }
    } catch (e) { }

    // ----------------------------------------------------
    // ALWAYS restore photos from IndexedDB
    // ----------------------------------------------------
    if (token && !frontImage && !sideImage) {
      this.restorePhotos();
    }

    // ----------------------------------------------------
    // BACKEND recovery ONLY if NOT retake
    // ----------------------------------------------------
    if (token && !isRetakeFlow) {
      // Case 1: we have person + task → resume calculation
      if (savedPersonId && savedTaskId) {
        this.setState({
          isFrontImageValid: true,
          isSideImageValid: true,
          isPending: true,
        });
        this.checkTaskSetStatus(savedTaskId, savedPersonId);
        return;
      }

      // Case 2: person exists but task missing → inspect person
      if (savedPersonId && !savedTaskId) {
        this.checkPersonForTaskSet(savedPersonId);
        return;
      }
    }

    // ----------------------------------------------------
    // Otherwise — normal UX flow continues
    // ----------------------------------------------------
    this.mayStartCamera();
  }


  componentDidUpdate(prevProps) {
    if (!prevProps.frontImage && this.props.frontImage) {
      this.setState({ photoStep: 'side' });
    }
  }

  restorePhotos = async () => {
    const { token, addFrontImage, addSideImage } = this.props;

    const frontBlob = await getPhoto(`frontImage_${token}`);
    const sideBlob = await getPhoto(`sideImage_${token}`);

    if (frontBlob) {
      addFrontImage(frontBlob);
      this.setState({ frontJustCaptured: true });
    }

    if (sideBlob) addSideImage(sideBlob);
  };

  // --------------------------------------------------------------
  // CHECK TASKSET STATUS AFTER PAGE RELOAD (WHEN BOTH IDS RESTORED)
  // --------------------------------------------------------------
  checkTaskSetStatus = async (taskSetId, personId) => {
    console.log('checkTaskSetStatus', taskSetId, personId);
    try {
      const person = await this.pollUntilReady(taskSetId, personId);

      await this.finalizeSuccessFlow(person, {
        source: 'recovery_taskset',
        skipUploadAnalytics: true,
      });
    } catch (err) {
      if (err?.response?.status === 404) {
        const { token, setTaskId } = this.props;
        localStorage.removeItem(`taskId_${token}`);
        setTaskId(null);
      }
    }
  };

  // --------------------------------------------------------------
  // NEW: CHECK PERSON IF personId EXISTS BUT taskId IS MISSING
  // --------------------------------------------------------------
  checkPersonForTaskSet = async (personId) => {
    console.log('checkPersonForTaskSet', personId);
    const {
      token,
      setTaskId,
      setProcessingStatus,
      deviceCoordinates,
      isTableFlow,
      isClothingFormFittingConfirmed,
      isRealTimePoseValidator,
    } = this.props;

    this.setState({ isPending: true });

    try {
      const person = await this.api.person.get(personId);

      // -------- CASE A: task_set already exists --------
      if (person.task_set) {
        console.log(' task_set already exists', person.task_set);
        const measurementTask = person.task_set.sub_tasks?.find(
          (t) => t.name.includes('measurement')
        );

        if (measurementTask?.task_id) {
          const taskSetId = measurementTask.task_id;

          setTaskId(taskSetId);
          localStorage.setItem(`taskId_${token}`, taskSetId);

          if (person.task_set.is_ready) {
            await this.finalizeSuccessFlow(person, { skipUploadAnalytics: true });
            return;
          }

          this.pollUntilReady(taskSetId, personId);
          return;
        }
      }
      console.log('no task_set → retry upload from IndexedDB');
      // -------- CASE B: no task_set → retry upload from IndexedDB --------
      const frontImage = await getPhoto(`frontImage_${token}`);
      const sideImage = await getPhoto(`sideImage_${token}`);

      if (!frontImage || !sideImage) {
        this.setState({ isPending: false });
        return;
      }

      setProcessingStatus('Photo Uploading');
      this.updateDesktopProcessStatus('Photo Uploading');

      const formData = new FormData();

      if (frontImage) {
        formData.append('front_image', frontImage, 'front.jpg');
      }

      if (sideImage) {
        formData.append('side_image', sideImage, 'side.jpg');
      }

      formData.append('photo_flow', isTableFlow ? 'hand' : 'friend');
      formData.append('is_clothing_form_fitting_confirmed', isClothingFormFittingConfirmed);
      formData.append(
        'phone_position',
        JSON.stringify(deviceCoordinates || {})
      );
      const validateImages =
        (!(isRealTimePoseValidator.front && isRealTimePoseValidator.side)).toString();

      const response = await this.axios(
        `${API_HOST}/api/v2/persons/${personId}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params: {
            measurements_type: 'all',
            validate_images: validateImages,
          },
          data: formData,
        }
      );
      const taskSetUrl = response.headers.location;
      const taskSetId = /\/queue\/(.*)\//g.exec(taskSetUrl)[1];

      setTaskId(taskSetId);
      localStorage.setItem(`taskId_${token}`, taskSetId);

      this.pollUntilReady(taskSetId, personId);
    } catch (err) {
      console.error(err);
      this.setState({ isPending: false });
    }
  };

  // --------------------------------------------------------------
  // POLLING UNTIL task_set is ready
  // --------------------------------------------------------------
  pollUntilReady = async (taskSetId, personId) => {
    console.log('pollUntilReady', taskSetId, personId);
    try {
      const person = await this.api.queue.getResults(taskSetId, 2000, personId);
      if (person) {
        await this.finalizeSuccessFlow(person, { skipUploadAnalytics: true });
        return;
      }
    } catch (e) {
      const handled = await this.handleHardValidationError(error);

      if (handled) return;

      if (error?.response?.status !== 422) {
        console.error(error);
        return;
      }
    }

    setTimeout(() => this.pollUntilReady(taskSetId, personId), 1000);
  };

  // --------------------------------------------------------------
  // HANDLE ALREADY FINISHED RESULTS (REUSE EXISTING LOGIC)
  // --------------------------------------------------------------

  mayStartCamera = () => {
    const { frontImage, sideImage, isRetakeFlow, hardValidation } = this.props;

    if (isRetakeFlow) {
      const { front, side } = hardValidation || {};

      if (!front && side) {
        this.prepareCameraStart('side');
        return;
      }

      if (front && !side) {
        this.prepareCameraStart('front');
        return;
      }

      this.prepareCameraStart('front');
      return;
    }

    if (frontImage && !sideImage) {
      this.prepareCameraStart('side');
      return;
    }

    if (!frontImage) {
      this.prepareCameraStart('front');
    }
  };

  getUseRtpvCamera = () => {
    const { settings } = this.props;

    return !(settings && settings.is_rtpv_disabled);
  }

  shouldShowStandInstructions = () => {
    return !this.getUseRtpvCamera();
  }

  prepareCameraStart = (camera) => {
    const { isTableFlow } = this.props;
    const { seenStandInstructions } = this.state;

    if (!this.shouldShowStandInstructions()) {
      this.startCamera(camera);
      return;
    }

    if (isTableFlow && camera === 'front' && !seenStandInstructions.front) {
      this.setState({
        standInstructionStep: 'front',
        pendingCamera: 'front',
      });
      return;
    }

    if (!isTableFlow && !seenStandInstructions[camera]) {
      this.setState({
        standInstructionStep: camera,
        pendingCamera: camera,
      });
      return;
    }

    this.startCamera(camera);
  }

  continueStandInstruction = () => {
    const { isTableFlow } = this.props;
    const {
      standInstructionStep,
      pendingCamera,
      seenStandInstructions,
    } = this.state;

    if (isTableFlow && standInstructionStep === 'front' && !seenStandInstructions.side) {
      this.setState({
        standInstructionStep: 'side',
        seenStandInstructions: {
          ...seenStandInstructions,
          front: true,
        },
      });
      return;
    }

    this.setState({
      standInstructionStep: null,
      pendingCamera: null,
      seenStandInstructions: {
        ...seenStandInstructions,
        [standInstructionStep]: true,
      },
    }, () => this.startCamera(pendingCamera));
  }

  startCamera = (camera) => {
    if (camera === 'front') {
      this.triggerFrontImage();
      return;
    }

    this.triggerSideImage();
  }

  handleExistingResults = (person) => {
    const {
      setMeasurements,
      setBodyType,
      setFlowState,
      customSettings,
      flowState,
    } = this.props;

    let measurements;
    if (!Object.keys(customSettings.outputMeasurements).length) {
      measurements = { ...person };
    } else {
      measurements = {
        ...person,
        ...(filterCustomMeasurements({ ...person }, customSettings)),
      };
    }

    if (person.volume_params) {
      setBodyType(person.volume_params.body_type);
    }

    setMeasurements(measurements);

    setFlowState({ ...flowState});

    this.finalizeSuccessFlow(person, { skipUploadAnalytics: true });
  };

  disableDeviceScreenLock = () => noSleep.enable();

  init(props) {
    const { token } = props;

    if (token && !this.api) {
      this.api = new API({
        host: `${API_HOST}/api/v2/`,
        key: token,
      });

      this.api.axios.defaults.headers = {
        Authorization: `UUID ${token}`,
      };
    }
  }

  /**
   * Save front image to state
   */
  saveFrontFile = async (file) => {
    this.setState({ frontJustCaptured: true });

    const {
      addFrontImage,
      setHeaderIconsStyle,
      isTableFlow,
      isRetakeFlow,
      hardValidation,
      token,
      isMobile,
    } = this.props;

  
    const blob = await base64ToBlob(file);

    savePhoto(`frontImage_${token}`, blob).catch((e) => {
      console.warn('Failed to save front photo to IndexedDB', e);
    });

    addFrontImage(blob);

    analyticsService({
      uuid: token,
      event: FRONT_PHOTO_PAGE_PHOTO_TAKEN,
      data: {
        flowType: isTableFlow ? 'by myself' : 'with a friend',
        retake: !!isRetakeFlow,
      },
    });

    setHeaderIconsStyle('default');
 

    const delay = isTableFlow ? 1500 : 0;

    setTimeout(() => {

      if (isRetakeFlow && hardValidation?.front && !hardValidation?.side && this.props.sideImage) {
        if (isMobile) {
          const state = store.getState();
          this.onNextButtonClick(null, state);
        }
        return;
      }
      if (!(hardValidation?.front && !hardValidation?.side)) {
          this.prepareCameraStart('side');
      }
    }, delay);
  };


  saveSideFile = async (file) => {
    const {
      addSideImage,
      isMobile,
      setHeaderIconsStyle,
      isTableFlow,
      isRetakeFlow,
      token,
    } = this.props;


    const blob = await base64ToBlob(file);

    try {
      await savePhoto(`sideImage_${token}`, blob);
    } catch (e) {
      console.warn('Failed to save side photo to IndexedDB', e);
    }



    analyticsService({
      uuid: token,
      event: SIDE_PHOTO_PAGE_PHOTO_TAKEN,
      data: {
        flowType: isTableFlow ? 'by myself' : 'with a friend',
        retake: !!isRetakeFlow,
      },
    });

    addSideImage(blob);

    setHeaderIconsStyle('default');

    if (isMobile) {
      const state = store.getState();
      this.onNextButtonClick(null, state);
    }

  }

  turnOffCamera = () => {
    const { setCamera } = this.props;
    setCamera(null);
  }

  updateDesktopProcessStatus = (status) => {
    const { isFromDesktopToMobile } = this.props;

    if (isFromDesktopToMobile && this.flow) {
      this.flow.updateLocalState({ processStatus: status });
    }
  };

  onNextButtonClick = async (e, props = this.props) => {
    if (e) {
      e.preventDefault();
    }

    const {
      frontImage,
      sideImage,
      height,
      gender,
      firstName,
      notes,
      mtmClientId,
      deviceCoordinates,
      isRealTimePoseValidator,
      isClothingFormFittingConfirmed,
      setIsHeaderTranslucent,
    } = props;

    let { personId } = props;

    const {
      setPersonId,
      email,
      weight,
      setProcessingStatus,
      setTaskId,
      setFlowState,
      token,
      isTableFlow,
      flowState,
      isRetakeFlow,
      customSettings,
    } = this.props;

    try {
      if (!frontImage) {
        this.setState({ isFrontImageValid: false });
      }
      if (!sideImage) {
        this.setState({ isSideImageValid: false });
      }
      if (!frontImage || !sideImage) {
        return;
      }

      // Detect lock event
      let hidden;
      let visibilityChange;
      if (typeof document.hidden !== 'undefined') {
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
      } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
      }

      if (!noSleep._wakeLock) {
        noSleep.enable();
      }

      this.handleVisibilityChange = async () => {
        if (document[hidden]) {
          isPhoneLocked = true;
          if (noSleep._wakeLock) noSleep.disable();
          await window.location.reload();
        }
      };

      document.addEventListener(visibilityChange, this.handleVisibilityChange);

      setProcessingStatus('Photo Uploading');
      this.updateDesktopProcessStatus('Photo Uploading');

      this.setState({
        isFrontImageValid: !!frontImage,
        isSideImageValid: !!sideImage,
        isPending: true,
      });

      if (setIsHeaderTranslucent) {
        setIsHeaderTranslucent(true);
      }

      analyticsService({
        uuid: token,
        event: MAGIC_SCREEN_PAGE_ENTER,
        data: {
          retake: !!isRetakeFlow,
        },
      });


      const frontSize = getFileSize(frontImage);
      const sideSize = getFileSize(sideImage);
      const totalSize = frontSize + sideSize;

      const dynamicTimeout = getDynamicUploadTimeout(totalSize);

      this.uploadStartedAt = performance.now();
      this.totalUploadBytes = totalSize;

      this.slowNetworkTimer = setTimeout(() => {
        this.setState({ isSlowNetworkDetected: true });

        analyticsService({
          uuid: token,
          event: 'MAGIC_SCREEN_SLOW_NETWORK_TRIGGERED',
          data: {
            totalPhotosSizeBytes: totalSize,
            timeoutMs: dynamicTimeout,
            flowType: isTableFlow ? 'by myself' : 'with a friend',
            retake: !!isRetakeFlow,
          },
        });
      }, dynamicTimeout);


      const networkInfo = getNetworkInfo();

      analyticsService({
        uuid: token,
        event: MAGIC_SCREEN_PHOTO_UPLOAD_START,
        data: {
          step: 'before_upload',
          totalPhotosSize: totalSize,
          frontImageSizeBytes: frontSize,
          sideImageSizeBytes: sideSize,
          network: networkInfo,
          isSlowNetwork: isSlowNetwork(networkInfo),
          retake: !!isRetakeFlow,
          flowType: isTableFlow ? 'by myself' : 'with a friend',
        },
      });


      let taskSetId;

      const images = {
        ...(frontImage && { frontImage }),
        ...(sideImage && { sideImage }),
      };

      const photoFlowType = isTableFlow ? 'hand' : 'friend';

      const mtmClientParams = {
        ...(firstName && { firstName }),
      };

      await this.api.mtmClient.update(mtmClientId, mtmClientParams);

      // ----------------------------------------------------------
      // CREATE PERSON OR REUSE EXISTING ONE
      // ----------------------------------------------------------
      if (!personId) {
        setProcessingStatus('Initiating Profile Creation');
        this.updateDesktopProcessStatus('Initiating Profile Creation');

        let savedPersonId = localStorage.getItem(`personId_${token}`);
        if (!savedPersonId) {
          const createdPersonId = await this.api.mtmClient.createPerson(mtmClientId, {
            gender,
            height,
            email,
            ...(weight && { weight }),
          });
          savedPersonId = createdPersonId;
          setPersonId(savedPersonId);
          localStorage.setItem(`personId_${token}`, savedPersonId);
        }

        personId = savedPersonId;

        await this.flow.update({
          ...(notes && { notes }),
          person: personId,
          state: { personId },
        });

        setFlowState({ ...flowState, personId });

        await wait(1000);
        setProcessingStatus('Photo Uploading');
        this.updateDesktopProcessStatus('Photo Uploading');

        const formData = new FormData();

        if (images.frontImage) {
          formData.append('front_image', images.frontImage, 'front.jpg');
        }

        if (images.sideImage) {
          formData.append('side_image', images.sideImage, 'side.jpg');
        }

        formData.append('photo_flow', photoFlowType);
        formData.append('is_clothing_form_fitting_confirmed', isClothingFormFittingConfirmed);
        formData.append(
          'phone_position',
          JSON.stringify(deviceCoordinates || {})
        );
        const validateImages =
          (!(isRealTimePoseValidator.front && isRealTimePoseValidator.side)).toString();


        const response = await this.axios(
          `${API_HOST}/api/v2/persons/${personId}/`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            params: {
              measurements_type: 'all',
              validate_images: validateImages,
            },
            data: formData,
          }
        );

        const taskSetUrl = response.headers.location;
        taskSetId = /\/queue\/(.*)\//g.exec(taskSetUrl)[1];

        setTaskId(taskSetId);
        localStorage.setItem(`taskId_${token}`, taskSetId);

        await wait(1000);
      } else {

        // EXISTING PERSON → create new taskSet - upload photos and trigger calculation
        console.log('create new taskSet for existing person - upload photos and trigger calculation', personId);
        setProcessingStatus('Photo Uploading');
        this.updateDesktopProcessStatus('Photo Uploading');

        const validateImages =
          (!(isRealTimePoseValidator.front && isRealTimePoseValidator.side)).toString();

        const formData = new FormData();

        if (images.frontImage) {
          formData.append('front_image', images.frontImage, 'front.jpg');
        }
        if (images.sideImage) {
          formData.append('side_image', images.sideImage, 'side.jpg');
        }

        formData.append('gender', gender);
        formData.append('height', height);
        if (weight != null) {
          formData.append('weight', weight);
        }

        formData.append('photo_flow', photoFlowType);
        formData.append('is_clothing_form_fitting_confirmed', isClothingFormFittingConfirmed);

        if (deviceCoordinates) {
          formData.append('phone_position', JSON.stringify(deviceCoordinates));
        }

 
        // 1 upload photos
        await this.axios(
          `${API_HOST}/api/v2/persons/${personId}/`,
     {
            method: 'PATCH',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            params: {
              validate_images: validateImages,
            },
            data: formData,
          }
        );

        // 2 start calculation
        const calcResponse = await this.axios(
          `${API_HOST}/api/v2/persons/${personId}/calculate/`,
          {
            method: 'GET',
            params: {
              validate_images: validateImages,
              measurements_type: 'all',
            },
          }
        );

        const taskSetUrl = calcResponse.headers.location;
        taskSetId = /\/queue\/(.*)\//g.exec(taskSetUrl)[1];

        setTaskId(taskSetId);
        localStorage.setItem(`taskId_${token}`, taskSetId);

        await wait(1000);
      }

      if (!noSleep._wakeLock) noSleep.enable();

      setProcessingStatus('Calculating your Measurements');
      this.updateDesktopProcessStatus('Calculating your Measurements');

      analyticsService({
        uuid: token,
        event: MAGIC_SCREEN_PHOTO_UPLOAD_FINISH,
        data: {
          step: 'upload_photo_success',
          totalFilesSizeBytes: totalSize,
          frontImageSizeBytes: frontSize,
          sideImageSizeBytes: sideSize,
          taskSetId,
          retake: !!isRetakeFlow,
        },
      });
      clearTimeout(this.slowNetworkTimer);

      const person = await this.api.queue.getResults(taskSetId, 4000, personId);

      await wait(1000);

      let measurements;
      if (!Object.keys(customSettings.outputMeasurements).length) {
        measurements = { ...person };
      } else {
        measurements = {
          ...person,
          ...(filterCustomMeasurements({ ...person }, customSettings)),
        };
      }

      await this.finalizeSuccessFlow(person);
    } catch (error) {
      clearTimeout(this.slowNetworkTimer);

      analyticsService({
        uuid: token,
        event: MAGIC_SCREEN_PAGE_FAILED,
        data: { error },
      });

      console.log(error);

      if (!isPhoneLocked) {
        if (await this.handleHardValidationError(error)) return;

        route('/not-found', true);
      }
    }
  }

  triggerFrontImage = () => {
    const { setCamera, token, isTableFlow, isRetakeFlow } = this.props;

    setCamera('front');

    analyticsService({
      uuid: token,
      event: FRONT_PHOTO_PAGE_OPEN_CAMERA,
      data: {
        flowType: isTableFlow ? 'by myself' : 'with a friend',
        retake: !!isRetakeFlow,
      },
    });
  }

  triggerSideImage = () => {
    const { setCamera, isTableFlow, isRetakeFlow, token } = this.props;

    setCamera('side');

    analyticsService({
      uuid: token,
      event: SIDE_PHOTO_PAGE_OPEN_CAMERA,
      data: {
        flowType: isTableFlow ? 'by myself' : 'with a friend',
        retake: !!isRetakeFlow,
      },
    });
  }

  handleHardValidationError = async (error) => {
    const {
      token,
      addFrontImage,
      addSideImage,
      setHardValidation,
      setIsFrontRealTimePoseValidator,
      setIsSideRealTimePoseValidator,
    } = this.props;

    if (!error?.response?.data?.sub_tasks) return false;

    const subTasks = error.response.data.sub_tasks;

    const frontTask = subTasks.find((i) => i.name.includes('front_'));
    const sideTask = subTasks.find((i) => i.name.includes('side_'));
    const measurementError = subTasks.find((i) => i.name.includes('measurement_'));

    setHardValidation({
      front: frontTask?.message || null,
      side: sideTask?.message || null,
      ...(measurementError && { measurementError: true }),
    });

    setIsFrontRealTimePoseValidator(false);
    setIsSideRealTimePoseValidator(false);

    if (frontTask?.message) {
      addFrontImage(null);
      await deletePhoto(`frontImage_${token}`);
    }

    if (sideTask?.message) {
      addSideImage(null);
      await deletePhoto(`sideImage_${token}`);
    }

    if (measurementError?.message) {
      addFrontImage(null);
      addSideImage(null);
      await deletePhoto(`frontImage_${token}`);
      await deletePhoto(`sideImage_${token}`);
    }

    route('/hard-validation', true);

    return true;
  };

  finalizeSuccessFlow = async (person, { source = 'normal', skipUploadAnalytics = false } = {}) => {
    console.log('finalizeSuccessFlow');
    const {
      origin,
      token,
      setMeasurements,
      setSoftValidation,
      setBodyType,
      setFlowState,
      flowState,
      mtmClientId,
      customSettings,
    } = this.props;

    this.setProcessingStatus?.('Calculating your Measurements');
    this.updateDesktopProcessStatus('Calculating your Measurements');

    let measurements;
    if (!Object.keys(customSettings.outputMeasurements).length) {
      measurements = { ...person };
    } else {
      measurements = {
        ...person,
        ...(filterCustomMeasurements({ ...person }, customSettings)),
      };
    }

    send('data', measurements, origin);

    if (person.volume_params) {
      setBodyType(person.volume_params.body_type);
    }

    setMeasurements(measurements);
    await this.flow?.update({
      widget_flow_status: flowStatuses.FINISHED,
      state: {
        status: flowStatuses.FINISHED,
        measurements,
        mtmClientId,
      },
    });

    this.setProcessingStatus?.('Sending Your Results');
    this.updateDesktopProcessStatus('Sending Your Results');

    await wait(500);

    setFlowState({ ...flowState });

    analyticsService({ uuid: token, event: MAGIC_SCREEN_PAGE_LEAVE });
    analyticsService({ uuid: token, event: MAGIC_SCREEN_PAGE_SUCCESS });

    await deletePhoto(`frontImage_${token}`);
    await deletePhoto(`sideImage_${token}`);

    route('/results', true);
  };



  openPhotoExample = (photoType) => {
    this.setState({
      isPhotoExample: true,
      photoType,
    });
  }

  setOfflineStatus = () => {
    const { setIsNetwork } = this.props;

    setIsNetwork(false);
    alert('Check your internet connection and try again');
    route('/not-found', true);
  }

  disableTableFlow = () => {
    const { setIsTableFlowDisabled, setIsTableFlow, setCamera } = this.props;

    setCamera(null);
    setIsTableFlowDisabled(true);
    setIsTableFlow(false);
  }

  setDeviceCoordinates = (coords) => {
    const {
      addFrontDeviceCoordinates,
      addSideDeviceCoordinates,
      camera,
    } = this.props;

    if (camera === 'front') {
      addFrontDeviceCoordinates(coords);
    } else {
      addSideDeviceCoordinates(coords);
    }
  };

  setFrontValidationStatus = (isFrontRealTimePoseValidation) => {
    const { setIsFrontRealTimePoseValidator } = this.props;
    setIsFrontRealTimePoseValidator(isFrontRealTimePoseValidation);
  }

  setSideValidationStatus = (isSideRealTimePoseValidation) => {
    const { setIsSideRealTimePoseValidator } = this.props;
    setIsSideRealTimePoseValidator(!!isSideRealTimePoseValidation);
  }

  render() {
    const isDesktop = !isMobileDevice();

    const {
      isPending,
      isSlowNetworkDetected,
      standInstructionStep,
    } = this.state;

    const {
      gender,
      camera,
      sendDataStatus,
      isMobile,
      isTableFlow,
      token,
      hardValidation,
    } = this.props;

    const useRtpv = this.getUseRtpvCamera();
    const standImages = howToStandImages[gender] || howToStandImages.female;

    return (
      <div className="screen active">
        {isDesktop ? (
          <div className="tutorial__desktop-msg">
            <h2>Please open this link on your mobile device</h2>
          </div>
        ) : null}
        {isMobile && isSlowNetworkDetected && (
          <div className="upload__slow-network-hint">
            Your connection seems slow. Please keep this page open — <strong>we’re still uploading your photos</strong>.
          </div>
        )}

        <Preloader
          isActive={isPending}
          status={sendDataStatus}
          isMobile={isMobile}
          gender={gender}
        />

        {standInstructionStep ? (
          <Fragment>
            <div
              className="screen__content upload-stand-instruction"
              style={{
                backgroundImage: `url(${standInstructionStep === 'front' ? standImages.front : standImages.side})`,
              }}
            >
              <h3 className="screen__label">How to stand</h3>
            </div>

            <div className="screen__footer upload-stand-instruction__footer">
              <button
                className="button"
                onClick={this.continueStandInstruction}
              >
                Continue
              </button>
            </div>
          </Fragment>
        ) : null}

        {camera && !standInstructionStep ? (
          <CameraWrapper
            key={!isTableFlow ? camera : undefined}
            useRtpvCamera={useRtpv}
            camera={camera}
            gender={gender}
            saveFront={this.saveFrontFile}
            saveSide={this.saveSideFile}
            isTableFlow={isTableFlow}
            hardValidation={hardValidation}
            disableTableFlow={this.disableTableFlow}
            turnOffCamera={this.turnOffCamera}
            setDeviceCoordinates={this.setDeviceCoordinates}
            setFrontValidationStatus={this.setFrontValidationStatus}
            setSideValidationStatus={this.setSideValidationStatus}
            token={token}
          />
        ) : null}


      </div>
    );
  }
}

export default connect((state) => state, actions)(Upload);
