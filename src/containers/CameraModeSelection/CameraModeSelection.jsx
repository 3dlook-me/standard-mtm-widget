// eslint-disable-next-line no-unused-vars
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
import { Stepper } from '../../components';
import {
  preloadRtpvCamera,
  preloadDefaultCamera,
} from '../../components/CameraWrapper/cameraLoader';

import './CameraModeSelection.scss';
import selfMode from '../../images/hands_free_no_rtpv.png';
import selfModeRtpv from '../../images/hands_free.png';
import friendMode from '../../images/friend_mode.png';

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
    const useRtpvCamera = !(
      this.props.settings && this.props.settings.is_rtpv_disabled
    );
    const isDesktop = !isMobileDevice();

    if (isDesktop) {
      document
        .querySelector('.header__close')
        .classList.add('header__close--hide');
    } else {
      if (useRtpvCamera) {
        preloadRtpvCamera();
      } else {
        preloadDefaultCamera();
      }
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
    if (
      (pageReloadStatus && isFromDesktopToMobile) ||
      (pageReloadStatus && isDemoWidget)
    ) {
      const { setPageReloadStatus, flowState } = this.props;

      setPageReloadStatus(false);

      mobileFlowStatusUpdate(this.flow, flowState);
    }
  }

  getFlowType = () => {
    const { isTableFlow } = this.props;

    return isTableFlow ? 'alone' : 'friend';
  };

  handleClick = (e) => {
    const { setIsTableFlow } = this.props;
    const value = e.target.value === 'table-flow';

    setIsTableFlow(value);
  };

  onClickNextPage = () => {
    const { isTableFlow, token } = this.props;

    analyticsService({
      uuid: token,
      event: isTableFlow
        ? CAMERA_MODE_PAGE_HANDS_FREE
        : CAMERA_MODE_PAGE_WITH_FRIEND,
    });
  };

  render() {
    const isDesktop = !isMobileDevice();
    const { isTableFlow, isTableFlowDisabled, settings } = this.props;
    const useRtpvCamera = !(settings && settings.is_rtpv_disabled);

    return (
      <div className="screen active">
        {isDesktop ? (
          <div className="desktop-msg">
            <h2>Please open this link on your mobile device</h2>
          </div>
        ) : (
          <Fragment>
            <div className="screen__content camera-mode-selection">
              <Stepper steps="5" current="5" />

              <h3 className="screen__label">
                How would you like <br />
                to take your photos?
              </h3>


              <div className="camera-mode-selection__buttons-wrap">
                <label
                  className={classNames(
                    'camera-mode-selection__button camera-mode-selection__button--front',
                    {
                      'camera-mode-selection__button--active':
                        isTableFlow && !isTableFlowDisabled,
                      'camera-mode-selection__button--inactive':
                        isTableFlowDisabled,
                    },
                  )}
                  htmlFor="front-mode-radio"
                >
                  <div className="camera-mode-selection__self"></div>
                  <div
                    className="camera-mode-selection__self--bg"
                    style={{
                      backgroundImage: `url(${useRtpvCamera ? selfModeRtpv : selfMode})`,
                    }}
                  ></div>
                  <input
                    type="radio"
                    name="flow-mode"
                    id="front-mode-radio"
                    onChange={this.handleClick}
                    value="table-flow"
                  />
                  <h4 className="camera-mode-selection__title">Hands-free</h4>
                </label>
                <p
                  className={classNames('camera-mode-selection__mode-desc', {
                    'camera-mode-selection__mode-desc--active':
                      isTableFlow && !isTableFlowDisabled,
                  })}
                >
                  Take both photos by yourself with voice guidance.
                </p>

                <label
                  className={classNames(
                    'camera-mode-selection__button camera-mode-selection__button--back camera-mode-selection__friend--bg',
                    {
                      'camera-mode-selection__button--active':
                        !isTableFlow || isTableFlowDisabled,
                    },
                  )}
                  style={{ backgroundImage: `url(${friendMode})` }}
                  htmlFor="back-mode-radio"
                >
                  <input
                    type="radio"
                    value
                    name="flow-mode"
                    id="back-mode-radio"
                    onChange={this.handleClick}
                  />
                  <h4 className="camera-mode-selection__title">
                    With a friend
                  </h4>
                </label>
                <p
                  className={classNames('camera-mode-selection__mode-desc', {
                    'camera-mode-selection__mode-desc--active':
                      !isTableFlow || isTableFlowDisabled,
                  })}
                >
                  Have someone take both photos while <br /> you stand in place.
                </p>
              </div>
            </div>
            <div className="screen__footer">
              <Link className="button" href="/how-to-take-photos">
                Continue
              </Link>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}

export default connect((state) => state, actions)(CameraModeSelection);
