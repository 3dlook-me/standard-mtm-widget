import { h, Component, Fragment } from 'preact';
import { route } from 'preact-router';
import API from '@3dlook/saia-sdk/lib/api';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Camera from '@3dlook/camera/src/Camera';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { store } from '../../store';
import {
  send,
  wait,
  mobileFlowStatusUpdate,
  isMobileDevice, parseGetParams, getWeightKg,
} from '../../helpers/utils';
import {
  gaUploadOnContinue,
  gaOpenCameraFrontPhoto,
  gaOpenCameraSidePhoto,
} from '../../helpers/ga';
import analyticsService, {
  FRONT_PHOTO_PAGE_EXAMPLE_OPEN,
  FRONT_PHOTO_PAGE_OPEN_CAMERA, SIDE_PHOTO_PAGE_OPEN_CAMERA,
  FRONT_PHOTO_PAGE_PHOTO_TAKEN, SIDE_PHOTO_PAGE_PHOTO_TAKEN,
  MAGIC_SCREEN_PAGE_ENTER, MAGIC_SCREEN_PAGE_LEAVE,
  MAGIC_SCREEN_PAGE_SUCCESS, MAGIC_SCREEN_PAGE_FAILED,
} from '../../services/analyticsService';
import {
  Preloader,
  Stepper,
  UploadBlock,
  PhotoExample,
  Tabs,
  Loader,
} from '../../components';

import './Upload.scss';
import frontExample from '../../images/friend_front.png';
import sideExample from '../../images/friend_side.png';

let isPhoneLocked = false;
let isRefreshed = false;

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

      // image errors
      frontImagePose: null,
      sideImagePose: null,

      isPending: false,

      photoType: 'front',
      isPhotoExample: false,

      activeTab: props.frontImage && !props.sideImage ? 'side' : 'front',
      isImageExampleLoaded: false,
    };

    const { setPageReloadStatus } = props;

    this.reloadListener = () => {
      isRefreshed = true;
      setPageReloadStatus(true);
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
  }

  componentDidMount() {
    const {
      camera,
      setIsNetwork,
      isNetwork,
      token,
      flowId,
      pageReloadStatus,
      isFromDesktopToMobile,
      isDemoWidget,
      token,
    } = this.props;

    analyticsService({
      uuid: token,
      event: FRONT_PHOTO_PAGE_EXAMPLE_OPEN,
    });

    window.addEventListener('offline', this.setOfflineStatus);

    // if camera is active when page refreshed
    if (camera) {
      const { setCamera } = this.props;

      setCamera(null);
    }

    if (!isNetwork) {
      // after not found page, if was network error
      setIsNetwork(true);
    }

    if (token && flowId && !this.flow) {
      this.flow = new FlowService(token);
      this.flow.setFlowId(flowId);

      // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
      if ((pageReloadStatus && isFromDesktopToMobile) || (pageReloadStatus && isDemoWidget)) {
        const { flowState, setPageReloadStatus } = this.props;

        setPageReloadStatus(false);

        mobileFlowStatusUpdate(this.flow, flowState);
      }
    }
  }

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
  saveFrontFile = (file) => {
    const {
      addFrontImage,
      setHeaderIconsStyle,
      setCamera,
      camera,
      isTableFlow,
      hardValidation,
      token,
    } = this.props;

    analyticsService({
      uuid: token,
      event: FRONT_PHOTO_PAGE_PHOTO_TAKEN,
    });

    setHeaderIconsStyle('default');
    addFrontImage(file);

    if (isTableFlow) {
      if (camera) {
        if (!(hardValidation.front && !hardValidation.side)) {
          this.triggerSideImage();
        }
      }
    } else {
      this.setState({
        isImageExampleLoaded: false,
      });

      setCamera(null);
    }
  }

  /**
   * Save side image to state
   */
  saveSideFile = (file) => {
    const {
      addSideImage,
      isMobile,
      setHeaderIconsStyle,
      setCamera,
      isTableFlow,
      token,
    } = this.props;

    analyticsService({
      uuid: token,
      event: SIDE_PHOTO_PAGE_PHOTO_TAKEN,
    });

    setHeaderIconsStyle('default');

    if (!isTableFlow) {
      setCamera(null);
    }

    if (isMobile) {
      this.unsubscribe = store.subscribe(() => {
        const state = store.getState();

        if (state.frontImage && state.sideImage) {
          this.unsubscribe();
          this.onNextButtonClick(null, state);
        }
      });
    }

    addSideImage(file);
  }

  turnOffCamera = () => {
    const { setCamera } = this.props;

    setCamera(null);
  }

  /**
   * On next button click handler
   *
   * @async
   */
  onNextButtonClick = async (e, props = this.props) => {
    if (e) {
      e.preventDefault();
    }

    const {
      frontImage,
      sideImage,
      height,
      gender,
      phoneNumber,
      firstName,
      source,
      notes,
      mtmClientId: mtmClientIdFromState,
      widgetId,
      productUrl,
      deviceCoordinates,
    } = props;

    let {
      personId,
    } = props;

    const {
      setHardValidation,
      addFrontImage,
      addSideImage,
      setPersonId,
      setMeasurements,
      origin,
      email,
      weight,
      units,
      setProcessingStatus,
      setMtmClientId,
      isFromDesktopToMobile,
      taskId,
      setTaskId,
      token,
    } = this.props;

    try {
      if (!frontImage) {
        this.setState({
          isFrontImageValid: false,
        });
      }

      if (!sideImage) {
        this.setState({
          isSideImageValid: false,
        });
      }

      if (!frontImage || !sideImage) {
        return;
      }

      // is phone locked detect
      let hidden;
      let visibilityChange;

      if (typeof document.hidden !== 'undefined') {
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
      } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
      }

      this.handleVisibilityChange = async () => {
        if (document[hidden]) {
          isPhoneLocked = true;

          await window.location.reload();
        }
      };

      document.addEventListener(visibilityChange, this.handleVisibilityChange);

      this.setState({
        isFrontImageValid: !!frontImage,
        isSideImageValid: !!sideImage,
        isPending: true,
      });

      analyticsService({
        uuid: token,
        event: MAGIC_SCREEN_PAGE_ENTER,
      });

      let taskSetId;
      let mtmClientId;

      // use only real images
      // ignore booleans for mobile flow
      const images = {};

      if (frontImage !== true) {
        images.frontImage = frontImage;
      }

      if (sideImage !== true) {
        images.sideImage = sideImage;
      }

      const mtmClientParams = {
        widgetId,
        unit: units,
        source,
        ...(email && { email }),
        ...(phoneNumber && { phone: phoneNumber }),
        ...(firstName && { firstName }),
        ...(notes && { notes }),
      };

      if (!personId) {
        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({ processStatus: 'Initiating Profile Creation' });
        }

        setProcessingStatus('Initiating Profile Creation');

        if (!mtmClientIdFromState) {
          mtmClientId = await this.api.mtmClient.create(mtmClientParams);
          setMtmClientId(mtmClientId);
        } else {
          mtmClientId = mtmClientIdFromState;
          await this.api.mtmClient.update(mtmClientId, mtmClientParams);
        }

        const createdPersonId = await this.api.mtmClient.createPerson(mtmClientId, {
          gender,
          height,
          email,
          ...(weight && { weight }),
        });

        personId = createdPersonId;

        setPersonId(personId);

        await this.flow.updateState({
          personId,
        });

        await wait(1000);

        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({ processStatus: 'Profile Creation Completed!' });
        }

        setProcessingStatus('Profile Creation Completed!');
        await wait(1000);

        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({ processStatus: 'Photo Uploading' });
        }

        setProcessingStatus('Photo Uploading');

        taskSetId = await this.api.person.updateAndCalculate(createdPersonId, {
          ...images,
          deviceCoordinates: { ...deviceCoordinates },
          measurementsType: 'all',
        });

        setTaskId(taskSetId);

        await wait(1000);

        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({ processStatus: 'Photo Upload Completed!' });
        }

        setProcessingStatus('Photo Upload Completed!');
        await wait(1000);
      } else {
        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({ processStatus: 'Photo Uploading' });
        }

        setProcessingStatus('Photo Uploading');

        mtmClientId = mtmClientIdFromState;
        await this.api.mtmClient.update(mtmClientId, mtmClientParams);

        await this.api.person.update(personId, {
          gender,
          height,
          email,
          ...(weight && { weight }),
          deviceCoordinates: { ...deviceCoordinates },
          ...images,
        });
        await wait(1000);

        // do not calculate again id page reload
        if (!taskId) {
          taskSetId = await this.api.person.calculate(personId);

          setTaskId(taskSetId);
        } else {
          taskSetId = taskId;
        }

        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({ processStatus: 'Photo Upload Completed!' });
        }

        setProcessingStatus('Photo Upload Completed!');
        await wait(1000);
      }

      if (isFromDesktopToMobile) {
        this.flow.updateLocalState({ processStatus: 'Calculating your Measurements' });
      }

      setProcessingStatus('Calculating your Measurements');

      const person = await this.api.queue.getResults(taskSetId, 4000, personId);

      await wait(1000);

      const measurements = { ...person };

      send('data', measurements, origin);

      setMeasurements(measurements);

      if (isFromDesktopToMobile) {
        this.flow.updateLocalState({
          processStatus: 'Sending Your Results',
          status: 'finished',
          measurements,
          mtmClientId,
        });
      } else {
        await this.flow.updateState({
          status: 'finished',
          measurements,
          mtmClientId,
        });
      }

      setProcessingStatus('Sending Your Results');
      await wait(1000);

      await this.flow.update({
        person: person.id,
      });

      if (!isFromDesktopToMobile) {
        await this.flow.widgetDeactivate();
      }

      gaUploadOnContinue();

      analyticsService({
        uuid: token,
        event: MAGIC_SCREEN_PAGE_LEAVE,
      });
      analyticsService({
        uuid: token,
        event: MAGIC_SCREEN_PAGE_SUCCESS,
      });
      route('/results', true);
    } catch (error) {
      analyticsService({
        uuid: token,
        event: MAGIC_SCREEN_PAGE_FAILED,
      });
      if (!isPhoneLocked) {
        // hard validation part
        if (error && error.response && error.response.data && error.response.data.sub_tasks) {
          const subTasks = error.response.data.sub_tasks;

          const frontTask = subTasks.filter((item) => item.name.indexOf('front_') !== -1)[0];
          const sideTask = subTasks.filter((item) => item.name.indexOf('side_') !== -1)[0];
          const measurementError = subTasks.filter((item) => item.name.indexOf('measurement_') !== -1)[0];

          setHardValidation({
            front: frontTask.message,
            side: sideTask.message,
            ...(measurementError && { measurementError: true }),
          });

          // reset front image if there is hard validation error
          // in the front image
          if (frontTask.message) {
            addFrontImage(null);
          }

          // reset side image if there is hard validation error
          // in the side image
          if (sideTask.message) {
            addSideImage(null);
          }

          if (measurementError) {
            addFrontImage(null);
            addSideImage(null);
          }

          route('/hard-validation', true);
        } else if (error && error.response && error.response.status === 400) {
          route('/not-found', true);
        } else if (error && error.response && error.response.data) {
          const { detail, brand: brandError, body_part: bodyPartError } = error.response.data;
          alert(detail || brandError || bodyPartError);
          route('/not-found', true);
        } else {
          if (error.message.includes('is not specified')) {
            const { returnUrl } = this.props;

            alert('Oops...\nThe server lost connection...\nPlease restart widget flow on the desktop or start again on mobile');

            window.location.href = returnUrl;

            return;
          }

          // for iphone after page reload
          await wait(2000);

          if (isRefreshed) return;

          console.error(error);

          route('/not-found', true);
        }
      }
    }
  }

  triggerFrontImage = () => {
    const { setCamera, token } = this.props;

    gaOpenCameraFrontPhoto();

    setCamera('front');

    analyticsService({
      uuid: token,
      event: FRONT_PHOTO_PAGE_OPEN_CAMERA,
    });
  }

  triggerSideImage = () => {
    const { setCamera, token } = this.props;

    gaOpenCameraSidePhoto();

    setCamera('side');

    analyticsService({
      uuid: token,
      event: SIDE_PHOTO_PAGE_OPEN_CAMERA,
    });
  }

  openPhotoExample =(photoType) => {
    this.setState({
      isPhotoExample: true,
      photoType,
    });
  }

  onImgExampleLoaded = () => {
    this.setState({
      isImageExampleLoaded: true,
    });
  }

  closePhotoExample = () => {
    this.setState({
      isPhotoExample: false,
    });
  }

  setOfflineStatus = () => {
    const { setIsNetwork } = this.props;

    setIsNetwork(false);

    alert('Check your internet connection and try again');

    route('/not-found', true);
  }

  disableTableFlow = () => {
    const {
      setIsTableFlowDisabled,
      setIsTableFlow,
      setCamera,
    } = this.props;

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
  }

  render() {
    const isDesktop = !isMobileDevice();

    const {
      isPending,
      isFrontImageValid,
      isSideImageValid,
      frontImagePose,
      frontImageBody,
      sideImagePose,
      sideImageBody,
      photoType,
      isPhotoExample,
      activeTab,
      isImageExampleLoaded,
    } = this.state;

    const {
      frontImage,
      sideImage,
      gender,
      camera,
      sendDataStatus,
      isMobile,
      isPhotosFromGallery,
      isTableFlow,
      hardValidation,
    } = this.props;

    let title;
    let photoBg;
    let frontActive = false;
    let sideActive = false;

    if (isTableFlow) {
      title = 'requirements';
      frontActive = (!frontImage && !sideImage) || (!frontImage && sideImage);
      sideActive = frontImage && !sideImage;
    } else if ((!frontImage && !sideImage) || (!frontImage && sideImage)) {
      title = 'Take Front photo';
      photoBg = frontExample;
      frontActive = true;
      // analyticsService({
      //   uuid: API_KEY || parseGetParams().key,
      //   event: FRONT_PHOTO_PAGE_EXAMPLE_OPEN,
      //   token: API_KEY || parseGetParams().key,
      // });
    } else if (frontImage && !sideImage) {
      title = 'Take Side photo';
      photoBg = sideExample;
      sideActive = true;
      // analyticsService({
      //   uuid: API_KEY || parseGetParams().key,
      //   event: SIDE_PHOTO_PAGE_EXAMPLE_OPEN,
      //   token: API_KEY || parseGetParams().key,
      // });
    }

    return (
      <div className="screen active">

        {isDesktop ? (
          <div className="tutorial__desktop-msg">
            <h2>Please open this link on your mobile device</h2>
          </div>
        ) : (
          <Fragment>
            <div className="screen__content upload">
              <Stepper steps="9" current={frontActive ? 7 : 8} />

              <h3 className="screen__title upload__title">
                {title}

                <div className="upload__upload-file">
                  <UploadBlock
                    className={classNames({
                      active: frontActive,
                    })}
                    gender={gender}
                    type="front"
                    validation={{ pose: frontImagePose, body: frontImageBody }}
                    change={this.saveFrontFile}
                    isValid={isFrontImageValid}
                    value={frontImage}
                    openPhotoExample={this.openPhotoExample}
                    photosFromGallery={isPhotosFromGallery}
                  />
                  <UploadBlock
                    className={classNames({
                      active: sideActive,
                    })}
                    gender={gender}
                    type="side"
                    validation={{ pose: sideImagePose, body: sideImageBody }}
                    change={this.saveSideFile}
                    isValid={isSideImageValid}
                    value={sideImage}
                    openPhotoExample={this.openPhotoExample}
                    photosFromGallery={isPhotosFromGallery}
                  />
                </div>
              </h3>

              {isTableFlow ? (
                <Tabs activeTab={activeTab} />
              ) : (
                <div
                  className="upload__image-example"
                  style={{ backgroundImage: `url(${photoBg})` }}
                >
                  {!isImageExampleLoaded ? (
                    <Fragment>
                      <Loader />

                      <img
                        className="upload__image-example-onload-detect"
                        src={photoBg}
                        onLoad={this.onImgExampleLoaded}
                        alt="back"
                      />
                    </Fragment>
                  ) : null}
                </div>
              )}

            </div>
            <div className="screen__footer">
              <button
                className={classNames('button', 'upload__front-image-btn', {
                  active: frontActive,
                })}
                onClick={this.triggerFrontImage}
                type="button"
              >
                Let&apos;s start
              </button>

              <button
                className={classNames('button', 'upload__side-image-btn', {
                  active: sideActive,
                })}
                onClick={this.triggerSideImage}
                type="button"
              >
                Let&apos;s start
              </button>
            </div>
          </Fragment>
        )}

        {/* {isPhotoExample ? ( */}
        {/*  <PhotoExample photoType={photoType} closePhotoExample={this.closePhotoExample} /> */}
        {/* ) : null} */}

        <Preloader isActive={isPending} status={sendDataStatus} isMobile={isMobile} />

        {camera ? (
          <Camera
            type={camera}
            gender={gender}
            saveFront={this.saveFrontFile}
            saveSide={this.saveSideFile}
            isTableFlow={isTableFlow}
            hardValidation={hardValidation}
            disableTableFlow={this.disableTableFlow}
            turnOffCamera={this.turnOffCamera}
            setDeviceCoordinates={this.setDeviceCoordinates}
          />
        ) : null}
      </div>
    );
  }
}

export default connect((state) => state, actions)(Upload);
