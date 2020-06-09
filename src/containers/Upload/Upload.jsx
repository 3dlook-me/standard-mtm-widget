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
  Tabs,
  Loader,
} from '../../components';

import './Upload.scss';
import frontExample from '../../images/friend_front.png';
import sideExample from '../../images/friend_side.png';

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

      activeTab: props.frontImage && !props.sideImage ? 'side' : 'front',
      isImageExampleLoaded: false,
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
    } = this.props;

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
      if (pageReloadStatus && isFromDesktopToMobile) {
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
    } = this.props;

    setHeaderIconsStyle('default');
    addFrontImage(file);

    if (isTableFlow) {
      if (camera) {
        if (hardValidation.front && !hardValidation.side) {
          setCamera(null);
        } else {
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
      // to show info icon after camera
      document.body.classList.remove('camera-table-flow');

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
          // condition for bug in safari on page reload
          if (error.message === 'Network Error') {
            return;
          }

          if (error.message.includes('is not specified')) {
            const { returnUrl } = this.props;

            alert('Oops...\nThe server lost connection...\nPlease restart widget flow on the desktop or start again on mobile');

            window.location.href = returnUrl;

            return;
          }

          alert(error);

          route('/not-found', true);
        }
      }
    }
  }

  triggerFrontImage = () => {
    const {
      setHeaderIconsStyle,
      setCamera,
      isTableFlow,
    } = this.props;

    gaOpenCameraFrontPhoto();

    setCamera('front');

    if (isTableFlow) {
      document.body.classList.add('camera-table-flow');
    } else {
      setHeaderIconsStyle('white');
    }
  }

  triggerSideImage = () => {
    const {
      setHeaderIconsStyle,
      setCamera,
      isTableFlow,
    } = this.props;

    gaOpenCameraSidePhoto();

    setCamera('side');

    if (isTableFlow) {
      document.body.classList.add('camera-table-flow');
    } else {
      setHeaderIconsStyle('white');
    }
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
    } else if (frontImage && !sideImage) {
      title = 'Take Side photo';
      photoBg = sideExample;
      sideActive = true;
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
              <Stepper steps="5" current={frontActive ? 3 : 4} />

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

              <div className="upload__block">
                <div className="upload__files">
                  {camera ? (
                    <Camera
                      type={camera}
                      gender={gender}
                      saveFront={this.saveFrontFile}
                      saveSide={this.saveSideFile}
                      isTableFlow={isTableFlow}
                      hardValidation={hardValidation}
                    />
                  ) : null}
                </div>
              </div>

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
      </div>

    );
  }
}

export default connect((state) => state, actions)(Upload);
