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
      phoneNumber,
      firstName,
      source,
      notes,
      mtmClientId: mtmClientIdFromState,
      widgetId,
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

      if (!personId) {
        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({ processStatus: 'Initiating Profile Creation' });
        }

        setProcessingStatus('Initiating Profile Creation');

        const mtmClientParams = {
          widgetId,
          unit: units,
          source,
          ...(email && { email }),
          ...(phoneNumber && { phone: phoneNumber }),
          ...(firstName && { firstName }),
          ...(notes && { notes }),
        };

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

      const measurements = { ...person };

      send('data', measurements, origin);

      setMeasurements(measurements);

      await this.flow.update({
        person: person.id,
      });

      gaUploadOnContinue();

      route('/results', true);
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
    } = this.state;

    const {
      frontImage,
      sideImage,
      gender,
      camera,
      sendDataStatus,
      isMobile,
      isPhotosFromGallery,
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

              <h3 className="screen__title upload__title">{title}</h3>
              <div className="upload__banner">
                <figure className="upload__banner-icon">
                  <svg width="24px" height="28px" viewBox="0 0 24 28" version="1.1">
                    <title>privacy</title>
                    <desc>Created with Sketch.</desc>
                    <g id="Mobile" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                      <g id="[M]-Step-6_1" transform="translate(-46.000000, -132.000000)" fill="#396EC5">
                        <g id="Group" transform="translate(30.000000, 120.000000)">
                          <g id="security-on" transform="translate(16.000000, 12.000000)">
                            <path d="M23.1972759,4.37435632 C18.4198966,4.37435632 14.7599425,3.00943678 11.6650575,0 C8.57049425,3.00943678 4.91070115,4.37435632 0.133724138,4.37435632 C0.133724138,12.2115402 -1.48794253,23.4382529 11.664977,27.9976667 C24.8188621,23.4383333 23.1972759,12.2116207 23.1972759,4.37435632 Z M10.7097586,18.1656437 L6.86788506,14.3232069 L8.58803448,12.6031379 L10.7097586,14.7253448 L14.7424828,10.6925402 L16.4625517,12.4126092 L10.7097586,18.1656437 Z" id="privacy" />
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg>
                </figure>
                <p className="upload__banner-txt">
                  We take your privacy very seriously and
                  <b> delete your photos after </b>
                  we process your measurements
                </p>
              </div>

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
          </Fragment>
        )}

        {isPhotoExample ? (
          <PhotoExample photoType={photoType} closePhotoExample={this.closePhotoExample} />
        ) : null}

        <Preloader isActive={isPending} status={sendDataStatus} isMobile={isMobile} />
      </div>

    );
  }
}

export default connect((state) => state, actions)(Upload);
