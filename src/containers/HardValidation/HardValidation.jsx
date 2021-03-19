import { h, Component } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { gaHardValidationError, gaRetakePhotoError } from '../../helpers/ga';
import { mobileFlowStatusUpdate } from '../../helpers/utils';
import { ImageExample } from '../../components';

import './HardValidation.scss';
import cryingIcon1x from '../../images/crying.png';
import cryingIcon2x from '../../images/crying@2x.png';

/**
 * Hard validation page component
 */
class HardValidation extends Component {
  constructor(props) {
    super(props);

    const { flowId, token } = this.props;
    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);
    this.flow.updateLocalState({ processStatus: '' });

    const { setPageReloadStatus } = props;

    this.reloadListener = () => {
      setPageReloadStatus(true);
    };

    window.addEventListener('unload', this.reloadListener);
  }

  componentWillUnmount() {
    window.removeEventListener('unload', this.reloadListener);
  }

  componentDidMount() {
    gaHardValidationError(this.getFlowType());

    const {
      pageReloadStatus,
      isFromDesktopToMobile,
      setTaskId,
      isDemoWidget,
    } = this.props;

    setTaskId(null);

    // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
    if ((pageReloadStatus && isFromDesktopToMobile) || (pageReloadStatus && isDemoWidget)) {
      const { setPageReloadStatus, flowState } = this.props;

      setPageReloadStatus(false);

      mobileFlowStatusUpdate(this.flow, flowState);
    }
  }

  componentWillReceiveProps = async (nextProps) => {
    const { hardValidation } = nextProps;
    const { front, side } = hardValidation;

    await this.flow.updateState({
      frontImage: !front,
      sideImage: !side,
    });
  }

  getFlowType = () => (this.props.isTableFlow ? 'alone' : 'friend');

  back = () => {
    route('/upload', true);

    gaRetakePhotoError(this.getFlowType());
  }

  render() {
    const {
      hardValidation,
      isMobile,
      gender,
      isTableFlow,
    } = this.props;

    const {
      front,
      side,
      measurementError,
    } = hardValidation;

    // front error handling
    let sideInTheFront = false;
    let cannotDetectBodyFront = false;
    let bodyIsNotFullFront = false;
    let wrongFrontPose = false;
    let wrongPartsFront;
    let tipMessageFront;
    let topMessageFront;

    if (front) {
      if (front === 'Side photo in the front') {
        sideInTheFront = true;
        topMessageFront = 'Oops! It looks like you took the side photo instead of the front one';
        tipMessageFront = 'Please retake the front photo! ';
      } else if (front === 'Can\'t detect the human body') {
        cannotDetectBodyFront = true;
        topMessageFront = 'We don\'t seem to be able to detect your body on the front photo';
        tipMessageFront = 'Please retake the front photo and ensure your whole body can be seen in the photo! ';
      } else if (front === 'The body is not full') {
        bodyIsNotFullFront = true;
        topMessageFront = 'Sorry! We need to be able to detect your entire body on the front photo!';
        tipMessageFront = 'Please retake the front photo and ensure your entire body can be seen in the photo, and follow the pose! ';
      } else if (front.indexOf('The pose is wrong, check: ') !== -1) {
        wrongFrontPose = true;

        wrongPartsFront = front.replace('The pose is wrong, check: ', '');
        wrongPartsFront = wrongPartsFront.replace(/_/g, ' ');
        topMessageFront = `Oh no! We were not able to detect your ${wrongPartsFront} on the side photo`;
        tipMessageFront = `Remember, your ${wrongPartsFront} must be seen in the photo! `;
      }
    }

    // front error handling
    let sideInTheSide = false;
    let cannotDetectBodySide = false;
    let bodyIsNotFullSide = false;
    let wrongSidePose = false;
    let wrongPartsSide;
    let tipMessageSide;
    let topMessageSide;

    if (side) {
      if (side === 'Front photo in the side') {
        sideInTheSide = true;
        topMessageSide = 'Oops! It looks like you took the front photo instead of the side one';
        tipMessageSide = 'Please retake the side photo! ';
      } else if (side === 'Can\'t detect the human body') {
        cannotDetectBodySide = true;
        topMessageSide = 'We don\'t seem to be able to detect your body on the side photo';
        tipMessageSide = 'Please retake the side photo and ensure your whole body can be seen in the photo! ';
      } else if (side === 'The body is not full') {
        bodyIsNotFullSide = true;
        topMessageSide = 'Sorry! We need to be able to detect your entire body on the side photo!';
        tipMessageSide = 'Please retake the side photo and ensure your entire body can be seen in the photo, and follow the pose! ';
      } else if (side.indexOf('The pose is wrong, check: ') !== -1) {
        wrongSidePose = true;

        wrongPartsSide = side.replace('The pose is wrong, check: ', '');
        wrongPartsSide = wrongPartsSide.replace(/_/g, ' ');
        topMessageSide = `Oh no! We were not able to detect your ${wrongPartsSide} on the side photo`;
        tipMessageSide = `Remember, your ${wrongPartsSide} must be seen in the photo! `;
      }
    }

    return (
      <div className="screen active">
        <div className="screen__content hard-validation">
          <h2 className="screen__subtitle">
            <span className="failure">Error</span>
          </h2>

          <h3 className="screen__title hard-validation__title">Oops!</h3>

          {measurementError ? (
            <p className="hard-validation__text">
              Something went wrong.
              <br />
              <br />
              Restart widget flow on the desktop or start again on mobile.
            </p>
          ) : null}

          {topMessageFront ? (
            <p className="hard-validation__text">{topMessageFront}</p>
          ) : null }

          {topMessageSide ? (
            <p className="hard-validation__text">{topMessageSide}</p>
          ) : null }

          <img
            className="hard-validation__image"
            src={cryingIcon1x}
            srcSet={`${cryingIcon1x} 1x, ${cryingIcon2x} 2x`}
            alt="hard validation errors"
          />

          {front && !side ? (
            <h4 className="hard-validation__title-2">
              Retake the front photo.
              <br />
              Here are some tips:
            </h4>
          ) : null }

          {side && !front ? (
            <h4 className="hard-validation__title-2">
              Retake the side photo.
              <br />
              Here are some tips:
            </h4>
          ) : null }

          {side && front ? (
            <h4 className="hard-validation__title-2">
              Retake the front and the side photos.
              <br />
              Here are some tips:
            </h4>
          ) : null }

          <ol className="hard-validation__recommendations">
            {front ? (
              <li>
                {tipMessageFront}
                {(sideInTheFront
                    || cannotDetectBodyFront
                    || bodyIsNotFullFront
                    || wrongFrontPose) ? (
                      <ImageExample
                        type="front"
                        isMobile={isMobile}
                        gender={gender}
                        isTableFlow={isTableFlow}
                      />
                  ) : null}
              </li>
            ) : null}

            {side ? (
              <li>
                {tipMessageSide}
                {(sideInTheSide
                    || cannotDetectBodySide
                    || bodyIsNotFullSide
                    || wrongSidePose) ? (
                      <ImageExample
                        type="side"
                        isMobile={isMobile}
                        gender={gender}
                        isTableFlow={isTableFlow}
                      />
                  ) : null}
              </li>
            ) : null}
          </ol>

        </div>
        <div className="screen__footer hard-validation__footer">
          <button className="button" onClick={this.back} type="button">
            <span>Retake photo</span>
          </button>
        </div>
      </div>
    );
  }
}

export default connect((state) => state, actions)(HardValidation);
