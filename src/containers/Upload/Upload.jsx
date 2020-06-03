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
  transformRecomendations,
  wait,
  mobileFlowStatusUpdate, isMobileDevice,
} from '../../helpers/utils';
import {
  gaUploadOnContinue,
  gaOpenCameraFrontPhoto,
  gaOpenCameraSidePhoto,
} from '../../helpers/ga';
import {
  Preloader,
  Stepper,
  UploadBlock,
  PhotoExample,
} from '../../components';

import './Upload.scss';
import frontExample from '../../images/img_front-example.png';
import sideExample from '../../images/img_side-example.png';

let isPhoneLocked = false;

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

      activeTab: 'front',
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

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('webkitvisibilitychange', this.handleVisibilityChange);
  }

  componentDidMount() {
    const { camera, setIsNetwork, isNetwork } = this.props;

    // if camera is active when page refreshed
    if (camera) {
      const { setCamera } = this.props;

      setCamera(null);
    }

    if (!isNetwork) {
      // after not found page, if was network error
      setIsNetwork(true);
    }

    this.tabTimer = setTimeout(() => {
      this.setState({
        activeTab: 'side',
      });
    }, 4000);
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
    // setCamera(null);

    this.triggerSideImage();
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
      productUrl,
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
        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({ processStatus: 'Initiating Profile Creation' });
        }

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
          measurementsType: 'all',
        });

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

        await this.api.person.update(personId, images);
        await wait(1000);

        taskSetId = await this.api.person.calculate(personId);

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

      const person = await this.api.queue.getResults(taskSetId, 4000);

      await wait(1000);

      if (isFromDesktopToMobile) {
        this.flow.updateLocalState({ processStatus: 'Sending Your Results' });
      }

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
      let originalRecommendations;

      if (brand && bodyPart) {
        originalRecommendations = await this.api.sizechart.getSize({
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
      } else {
        originalRecommendations = await this.api.product.getRecommendations({
          gender,
          hips: person.volume_params.high_hips,
          chest: person.volume_params.chest,
          waist: person.volume_params.waist,
          thigh: person.volume_params.thigh,
          low_hips: person.volume_params.low_hips,
          inseam: person.front_params.inseam,
          url: productUrl,
        });
      }

      if (originalRecommendations) {
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

      if (!isPhoneLocked) {
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
          if (error.message === 'Network Error') {
            const { setIsNetwork } = this.props;

            alert('Check your internet connection and try again');

            setIsNetwork(false);

            route('/not-found', true);

            return;
          }

          alert(error);

          route('/not-found', true);
        }
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

  openPhotoExample =(photoType) => {
    this.setState({
      isPhotoExample: true,
      photoType,
    });
  }

  closePhotoExample = () => {
    this.setState({
      isPhotoExample: false,
    });
  }

  changeTab = (e) => {
    this.setState({
      activeTab: e.target.name,
    });

    clearTimeout(this.tabTimer);
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
    } = this.state;

    const {
      frontImage,
      sideImage,
      gender,
      camera,
      sendDataStatus,
      isMobile,
      isPhotosFromGallery,
      cameraMode,
    } = this.props;

    let title;

    if ((!frontImage && !sideImage) || (!frontImage && sideImage)) {
      title = 'Take Front photo';
    } else if (frontImage && !sideImage) {
      title = 'Take Side photo';
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
              <Stepper steps="5" current={((!frontImage && !sideImage) || (!frontImage && sideImage)) ? 3 : 4} />

              <h3 className="screen__title upload__title">
                {/* {title} */}

                Requirements
                <div className="upload__upload-file">
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
                    openPhotoExample={this.openPhotoExample}
                    photosFromGallery={isPhotosFromGallery}
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
                    openPhotoExample={this.openPhotoExample}
                    photosFromGallery={isPhotosFromGallery}
                  />
                </div>
              </h3>

              <div className="upload__tabs">
                <div className="upload__tabs-btn-wrap">
                  <button
                    className={classNames('upload__tabs-btn', {
                      'upload__tabs-btn--active': activeTab === 'front',
                    })}
                    type="button"
                    name="front"
                    onClick={this.changeTab}
                  >
                    front photo
                  </button>
                  <button
                    className={classNames('upload__tabs-btn', {
                      'upload__tabs-btn--active': activeTab === 'side',
                    })}
                    type="button"
                    name="side"
                    onClick={this.changeTab}
                  >
                    side photo
                  </button>
                </div>
                <div
                  className={classNames('upload__tabs-photo', {
                    'upload__tabs-photo--active': activeTab === 'front',
                  })}
                  style={{ backgroundImage: `url(${frontExample})` }}
                />
                <div
                  className={classNames('upload__tabs-photo', {
                    'upload__tabs-photo--active': activeTab === 'side',
                  })}
                  style={{ backgroundImage: `url(${sideExample})` }}
                />
              </div>


              {/* <CameraModeSelection /> */}

              <div className="upload__block">
                <div className="upload__files">
                  {camera ? (
                    <Camera
                      type={camera}
                      gender={gender}
                      saveFront={this.saveFrontFile}
                      saveSide={this.saveSideFile}
                      flowMode={cameraMode}
                    />
                  ) : null}
                  {/* {(camera === 'front') ? <Camera type={camera} gender={gender} change={this.saveFrontFile} flowMode={cameraMode} /> : null} */}
                  {/* {(camera === 'side') ? <Camera type={camera} gender={gender} change={this.saveSideFile} flowMode={cameraMode} /> : null} */}
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
                Let&apos;s start
              </button>

              <button
                className={classNames('button', 'upload__side-image-btn', {
                  active: frontImage && !sideImage,
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
      </div>

    );
  }
}

export default connect((state) => state, actions)(Upload);
