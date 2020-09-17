import { h, Component, Fragment } from 'preact';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Link } from 'preact-router';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { isMobileDevice, mobileFlowStatusUpdate } from '../../helpers/utils';
import analyticsService, {
  CAMERA_MODE_PAGE_ENTER,
  CAMERA_MODE_PAGE_LEAVE,
  CAMERA_MODE_PAGE_WITH_FRIEND,
  CAMERA_MODE_PAGE_HANDS_FREE,
} from '../../services/analyticsService';
import {
  Stepper,
  PrivacyBanner,
  Loader,
} from '../../components';

import './CameraModeSelection.scss';
import maleFriend from '../../images/male_friend.png';
import maleAlone from '../../images/male_alone.png';
import femaleFriend from '../../images/female_friend.png';
import femaleAlone from '../../images/female_alone.png';

/**
 * CameraModeSelection component
 */
class CameraModeSelection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isBackModeImageLoaded: false,
      isFrontModeImageLoaded: false,
    };

    const { setPageReloadStatus } = props;

    this.reloadListener = () => {
      setPageReloadStatus(true);
    };

    window.addEventListener('unload', this.reloadListener);
  }

  componentWillUnmount() {
    const { token } = this.props;

    window.removeEventListener('unload', this.reloadListener);

    analyticsService({
      uuid: token,
      event: CAMERA_MODE_PAGE_LEAVE,
    });
  }

  componentDidMount() {
    const isDesktop = !isMobileDevice();

    if (isDesktop) {
      document.querySelector('.header__close').classList.add('header__close--hide');
    }

    const {
      isFromDesktopToMobile,
      pageReloadStatus,
      token,
      flowId,
      isDemoWidget,
    } = this.props;

    analyticsService({
      uuid: token,
      event: CAMERA_MODE_PAGE_ENTER,
    });

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);

    // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
    if ((pageReloadStatus && isFromDesktopToMobile) || (pageReloadStatus && isDemoWidget)) {
      const { setPageReloadStatus, flowState } = this.props;

      setPageReloadStatus(false);

      mobileFlowStatusUpdate(this.flow, flowState);
    }
  }

  handleClick = (e) => {
    const { setIsTableFlow } = this.props;
    const value = e.target.value === 'table-flow';

    setIsTableFlow(value);
  }

  onBackImageLoad = () => {
    this.setState({
      isBackModeImageLoaded: true,
    });
  }

  onFrontImageLoad = () => {
    this.setState({
      isFrontModeImageLoaded: true,
    });
  }

  onClickNextPage = () => {
    const { isTableFlow, token } = this.props;

    analyticsService({
      uuid: token,
      event: isTableFlow ? CAMERA_MODE_PAGE_HANDS_FREE : CAMERA_MODE_PAGE_WITH_FRIEND,
    });
  }

  render() {
    const isDesktop = !isMobileDevice();
    const { isBackModeImageLoaded, isFrontModeImageLoaded } = this.state;
    const {
      isTableFlow,
      isTableFlowDisabled,
      gender,
    } = this.props;

    const frontCameraMode = gender === 'male' ? maleAlone : femaleAlone;
    const backCameraMode = gender === 'male' ? maleFriend : femaleFriend;

    return (

      <div className="screen active">

        {isDesktop ? (
          <div className="desktop-msg">
            <h2>Please open this link on your mobile device</h2>
          </div>
        ) : (
          <Fragment>
            <div className="screen__content camera-mode-selection">
              <Stepper steps="9" current="5" />

              <h3 className="screen__title">LET&apos;S TAKE 2 PHOTOS</h3>

              <PrivacyBanner />

              <p className="camera-mode-selection__text">
                You have two options: ask someone to help you, or
                {' '}
                <br />
                {' '}
                take photos by yourself in the hands-free mode
                {' '}
                <br />
                {' '}
                using a voice assistant.
                <br />
                <b> How would you like to proceed? </b>
              </p>

              <div className="camera-mode-selection__buttons-wrap">
                <label
                  className={classNames('camera-mode-selection__button camera-mode-selection__button--back', {
                    'camera-mode-selection__button--active': !isTableFlow || isTableFlowDisabled,
                  })}
                  htmlFor="back-mode-radio"
                >
                  <input
                    type="radio"
                    value
                    name="flow-mode"
                    id="back-mode-radio"
                    onChange={this.handleClick}
                  />

                  <div
                    className="camera-mode-selection__img-wrap"
                    style={{ backgroundImage: `url(${backCameraMode})` }}
                  >
                    {!isBackModeImageLoaded ? (
                      <Fragment>
                        <Loader />

                        <img
                          className="camera-mode-selection__img-onload-detect"
                          src={frontCameraMode}
                          onLoad={this.onBackImageLoad}
                          alt="back"
                        />
                      </Fragment>
                    ) : null}
                  </div>
                  <div className="camera-mode-selection__icon-wrap">
                    <h4 className="camera-mode-selection__title">
                      With a friend
                    </h4>
                  </div>
                </label>

                <label
                  className={classNames('camera-mode-selection__button camera-mode-selection__button--front', {
                    'camera-mode-selection__button--active': isTableFlow && !isTableFlowDisabled,
                    'camera-mode-selection__button--inactive': isTableFlowDisabled,
                  })}
                  htmlFor="front-mode-radio"
                >
                  <input
                    type="radio"
                    name="flow-mode"
                    id="front-mode-radio"
                    onChange={this.handleClick}
                    value="table-flow"
                  />

                  <div
                    className="camera-mode-selection__img-wrap"
                    style={{ backgroundImage: `url(${frontCameraMode})` }}
                  >
                    {!isFrontModeImageLoaded ? (
                      <Fragment>
                        <Loader />

                        <img
                          className="camera-mode-selection__img-onload-detect"
                          src={frontCameraMode}
                          onLoad={this.onFrontImageLoad}
                          alt="back"
                        />
                      </Fragment>
                    ) : null}
                  </div>
                  <div className="camera-mode-selection__icon-wrap">
                    <h4 className="camera-mode-selection__title">
                      Hands-free
                    </h4>
                  </div>
                </label>
              </div>
            </div>
            <div className="screen__footer">
              <Link
                className="button"
                href="/how-to-take-photos"
                onClick={this.onClickNextPage}
              >
                NEXT
              </Link>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}

export default connect((state) => state, actions)(CameraModeSelection);
