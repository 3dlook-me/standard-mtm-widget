import { h, Component } from 'preact';
import { route } from 'preact-router';
import API from '@3dlook/saia-sdk/lib/api';
import { connect } from 'react-redux';
import classNames from 'classnames';

import Camera from '@3dlook/camera';
import '@3dlook/camera/dist/style.css';

import './Upload.scss';

import {
  Preloader,
  Stepper,
  UploadBlock,
} from '../../components';

import {
  send, transformRecomendations, wait, activeFlowInMobile, mobileFlowStatusUpdate,
} from '../../helpers/utils';
import {
  gaUploadOnContinue,
  gaOpenCameraFrontPhoto,
  gaOpenCameraSidePhoto,
} from '../../helpers/ga';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { store } from '../../store';

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
    };

    const { setPageReloadStatus } = props;

    this.reloadListener = () => {
      setPageReloadStatus(true);
    };

    window.addEventListener('unload', this.reloadListener);
  }

  componentWillReceiveProps(nextProps) {
    this.init(nextProps);
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
    clearInterval(this.timer);
    window.removeEventListener('unload', this.reloadListener);
  }

  componentDidMount() {
    const { camera } = this.props;

    // if camera is active when page refreshed
    if (camera) {
      const { setCamera } = this.props;

      setCamera(null);
    }
  }

  init(props) {
    const {
      token,
      flowId,
      pageReloadStatus,
      isFromDesktopToMobile,
    } = props;

    if (token && flowId && !this.api && !this.flow) {
      this.api = new API({
        host: `${API_HOST}/api/v2/`,
        key: token,
      });

      this.flow = new FlowService(token);
      this.flow.setFlowId(flowId);

      // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
      if (pageReloadStatus && isFromDesktopToMobile) {
        const { flowState, setPageReloadStatus } = this.props;

        setPageReloadStatus(false);

        mobileFlowStatusUpdate(this.flow, flowState);
      }
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
    } = this.props;

    setHeaderIconsStyle('default');
    addFrontImage(file);
    setCamera(null);
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
    } = this.props;
    setHeaderIconsStyle('default');

    setCamera(null);

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
      brand,
      bodyPart,
      isFromDesktopToMobile,
      phoneNumber,
    } = props;

    let {
      personId,
    } = props;

    const {
      setRecommendations,
      setHardValidation,
      addFrontImage,
      addSideImage,
      setPersonId,
      setMeasurements,
      setBodyType,
      origin,
      email,
      weight,
      setProcessingStatus,
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

      this.setState({
        isFrontImageValid: !!frontImage,
        isSideImageValid: !!sideImage,
        isPending: true,
      });

      let taskSetId;

      // use only real images
      // ignore booleans for mobile flow
      const images = {};

      if (frontImage !== true) {
        images.frontImage = frontImage;
      }

      if (sideImage !== true) {
        images.sideImage = sideImage;
      }

      if (!personId) {
        setProcessingStatus('Initiating Profile Creation');

        const createdPersonId = await this.api.person.create({
          gender,
          height,
          email,
          ...(weight && { weight }),
          measurementsType: 'all',
        });

        setPersonId(createdPersonId);
        personId = createdPersonId;

        await wait(1000);

        setProcessingStatus('Profile Creation Completed!');
        await wait(1000);

        setProcessingStatus('Photo Uploading');

        taskSetId = await this.api.person.updateAndCalculate(createdPersonId, {
          ...images,
          measurementsType: 'all',
        });

        await wait(1000);

        setProcessingStatus('Photo Upload Completed!');
        await wait(1000);
      } else {
        setProcessingStatus('Photo Uploading');

        await this.api.person.update(personId, images);
        await wait(1000);

        taskSetId = await this.api.person.calculate(personId);

        setProcessingStatus('Photo Upload Completed!');
        await wait(1000);
      }

      setProcessingStatus('Calculating your Measurements');

      const person = await this.api.queue.getResults(taskSetId, 4000);

      await wait(1000);

      setProcessingStatus('Sending Your Results');
      await wait(1000);

      const measurements = {
        hips: person.volume_params.high_hips,
        chest: person.volume_params.chest,
        waist: person.volume_params.waist,
        thigh: person.volume_params.thigh,
        low_hips: person.volume_params.low_hips,
        inseam: person.front_params.inseam,
        gender,
        height,
      };

      setBodyType(person.volume_params.body_type);
      setMeasurements(measurements);

      await this.flow.updateState({
        measurements,
        bodyType: person.volume_params.body_type,
      });

      if (isFromDesktopToMobile) {
        localStorage.setItem('saia-pf-widget-data', JSON.stringify(measurements));
      }

      let recommendations;

      const originalRecommendations = await this.api.sizechart.getSize({
        gender,
        hips: person.volume_params.high_hips,
        chest: person.volume_params.chest,
        waist: person.volume_params.waist,
        thigh: person.volume_params.thigh,
        low_hips: person.volume_params.low_hips,
        inseam: person.front_params.inseam,
        brand,
        body_part: bodyPart,
      });

      if (originalRecommendations) {
        const { normal } = originalRecommendations;

        if (normal && normal.size === '23') {
          normal.size = '24';
        }

        recommendations = transformRecomendations(originalRecommendations);

        setRecommendations(recommendations);
      }

      send('recommendations', recommendations, origin);

      gaUploadOnContinue();

      if (!recommendations || (!recommendations.normal
        && !recommendations.tight
        && !recommendations.loose)) {
        route('/not-found', true);
      // ok, show just recommendations
      } else {
        const {
          id,
        } = person;

        const customerData = {};

        if (phoneNumber) {
          customerData.phone = phoneNumber;
        }

        send('data', {
          ...measurements,
          personId,
        }, origin);

        await this.flow.updateState({
          saiaPersonId: id,
        }).then(() => {
          route('/results', true);
        });
      }
    } catch (error) {
      this.setState({
        isPending: false,
      });

      // hard validation part
      if (error && error.response && error.response.data && error.response.data.sub_tasks) {
        const subTasks = error.response.data.sub_tasks;

        const frontTask = subTasks.filter((item) => item.name.indexOf('front_') !== -1)[0];
        const sideTask = subTasks.filter((item) => item.name.indexOf('side_') !== -1)[0];

        setHardValidation({
          front: frontTask.message,
          side: sideTask.message,
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

        route('/hard-validation', true);
      } else if (error && error.response && error.response.status === 400) {
        route('/not-found', true);
      } else if (error && error.response && error.response.data) {
        const { detail, brand: brandError, body_part: bodyPartError } = error.response.data;
        alert(detail || brandError || bodyPartError);
        route('/not-found', true);
      } else {
        alert(error);
        route('/not-found', true);
      }
    }
  }

  triggerFrontImage = () => {
    const { setHeaderIconsStyle, setCamera } = this.props;

    gaOpenCameraFrontPhoto();

    setCamera('front');
    setHeaderIconsStyle('white');
  }

  triggerSideImage = () => {
    const { setHeaderIconsStyle, setCamera } = this.props;

    gaOpenCameraSidePhoto();

    setCamera('side');
    setHeaderIconsStyle('white');
  }

  render() {
    const {
      isPending,
      isFrontImageValid,
      isSideImageValid,
      frontImagePose,
      frontImageBody,
      sideImagePose,
      sideImageBody,
    } = this.state;

    const {
      frontImage,
      sideImage,
      gender,
      camera,
      sendDataStatus,
      isMobile,
    } = this.props;

    let title;

    if ((!frontImage && !sideImage) || (!frontImage && sideImage)) {
      title = 'Take Front photo';
    } else if (frontImage && !sideImage) {
      title = 'Take Side photo';
    }

    return (
      <div className="screen active">
        <div className="screen__content upload">
          <Stepper steps="5" current={((!frontImage && !sideImage) || (!frontImage && sideImage)) ? 3 : 4} />

          <h3 className="screen__title upload__title">{title}</h3>

          <div className="upload__block">
            <div className="upload__files">
              <UploadBlock
                className={classNames({
                  active: (!frontImage && !sideImage) || (!frontImage && sideImage),
                })}
                gender={gender}
                type="front"
                validation={{ pose: frontImagePose, body: frontImageBody }}
                change={this.saveFrontFile}
                isValid={isFrontImageValid}
                value={frontImage}
              />
              <UploadBlock
                className={classNames({
                  active: frontImage && !sideImage,
                })}
                gender={gender}
                type="side"
                validation={{ pose: sideImagePose, body: sideImageBody }}
                change={this.saveSideFile}
                isValid={isSideImageValid}
                value={sideImage}
              />

              {(camera === 'front') ? <Camera type={camera} gender={gender} change={this.saveFrontFile} /> : null}
              {(camera === 'side') ? <Camera type={camera} gender={gender} change={this.saveSideFile} /> : null}
            </div>
          </div>

        </div>
        <div className="screen__footer">
          <button
            className={classNames('button', 'upload__front-image-btn', {
              active: (!frontImage && !sideImage) || (!frontImage && sideImage),
            })}
            onClick={this.triggerFrontImage}
            type="button"
          >
            Open camera
          </button>

          <button
            className={classNames('button', 'upload__side-image-btn', {
              active: frontImage && !sideImage,
            })}
            onClick={this.triggerSideImage}
            type="button"
          >
            Open camera
          </button>
        </div>

        <Preloader isActive={isPending} status={sendDataStatus} isMobile={isMobile} />
      </div>

    );
  }
}

export default connect((state) => state, actions)(Upload);
