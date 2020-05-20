import { h, Component, Fragment } from 'preact';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Link } from 'preact-router';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { isMobileDevice, mobileFlowStatusUpdate } from '../../helpers/utils';
import { Stepper, PrivacyBanner } from '../../components';

import './CameraModeSelection.scss';
import frontCameraMode from '../../images/front-camera-mode.png';
import sideCameraMode from '../../images/side-camera-mode.png';
import checkMark from '../../images/check-mark.svg';

/**
 * CameraModeSelection component
 */
class CameraModeSelection extends Component {
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
    } = this.props;

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);

    // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
    if (pageReloadStatus && isFromDesktopToMobile) {
      const { setPageReloadStatus, flowState } = this.props;

      setPageReloadStatus(false);

      mobileFlowStatusUpdate(this.flow, flowState);
    }
  }

  handleClick = (e) => {
    const { setCameraMode } = this.props;

    setCameraMode(e.target.value);
  }

  render() {
    // const {} = this.props;
    const isDesktop = !isMobileDevice();
    const { cameraMode } = this.props;

    return (

      <div className="screen active">

        {isDesktop ? (
          <div className="desktop-msg">
            <h2>Please open this link on your mobile device</h2>
          </div>
        ) : (
          <Fragment>
            <div className="screen__content camera-mode-selection">
              <Stepper steps="5" current="3" />

              <h3 className="screen__title">LET&apos;S TAKE two PHOTOS</h3>

              <PrivacyBanner />

              <p className="camera-mode-selection__text">
                You can either ask someone to help you or
                take photos with the guidance of our AI assistant.
                <br />
                <b>How do you want to proceed?</b>
              </p>

              <div className="camera-mode-selection__buttons-wrap">
                <label
                  className={classNames('camera-mode-selection__button camera-mode-selection__button--back', { 'camera-mode-selection__button--active': cameraMode === 'back-mode' })}
                  htmlFor="back-mode-radio"
                >
                  <input
                    type="radio"
                    value="back-mode"
                    name="camera-mode"
                    id="back-mode-radio"
                    onChange={this.handleClick}
                  />

                  <div className="camera-mode-selection__img-wrap">
                    <img src={frontCameraMode} alt="front" />
                  </div>
                  <div className="camera-mode-selection__icon-wrap">
                    <h4 className="camera-mode-selection__title">
                      With a friend
                    </h4>
                    <div className="camera-mode-selection__icon">
                      <img src={checkMark} alt="button-status" />
                    </div>
                  </div>
                </label>

                <label
                  className={classNames('camera-mode-selection__button camera-mode-selection__button--front', {
                    'camera-mode-selection__button--active': cameraMode === 'front-mode',
                  })}
                  htmlFor="front-mode-radio"
                >
                  <input
                    type="radio"
                    value="front-mode"
                    name="camera-mode"
                    id="front-mode-radio"
                    onChange={this.handleClick}
                  />

                  <div className="camera-mode-selection__img-wrap">
                    <img src={sideCameraMode} alt="side" />
                  </div>
                  <div className="camera-mode-selection__icon-wrap">
                    <h4 className="camera-mode-selection__title">
                      AI assistant
                    </h4>
                    <div className="camera-mode-selection__icon">
                      <img src={checkMark} alt="button-status" />
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <div className="screen__footer">
              <Link
                className="button"
                href="/how-to-take-photos"
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
