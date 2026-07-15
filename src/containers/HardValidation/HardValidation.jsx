// eslint-disable-next-line no-unused-vars
import { h, Component } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { mobileFlowStatusUpdate } from '../../helpers/utils';
import { ImageExample } from '../../components';
import analyticsService, {
  RETAKE_PHOTO,
} from '../../services/analyticsService';

import './HardValidation.scss';
import errorIcon from '../../images/error.png';

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
    const {
      pageReloadStatus,
      isFromDesktopToMobile,
      setTaskId,
      isDemoWidget,
      token,
    } = this.props;

    setTaskId(null);
    localStorage.removeItem(`taskId_${token}`);

    // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
    if ((pageReloadStatus && isFromDesktopToMobile) || (pageReloadStatus && isDemoWidget)) {
      const { setPageReloadStatus, flowState } = this.props;

      setPageReloadStatus(false);

      mobileFlowStatusUpdate(this.flow, flowState);
    }
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps = async (nextProps) => {
    const { hardValidation } = nextProps;
    const { front, side } = hardValidation;

    if (front && side) {
      // both invalid → full retake
      await this.flow.updateState({
        frontImage: null,
        sideImage: null,
      });
    } else {
      await this.flow.updateState({
        frontImage: !front,
        sideImage: !side,
      });
    }
  }

  back = () => {
    const {
      token,
      setIsRetakeFlow,
    } = this.props;

    analyticsService({
      uuid: token,
      event: RETAKE_PHOTO,
    });

    setIsRetakeFlow(true);

    route('/upload', true);
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
        topMessageFront = 'It looks like you took the side photo instead of the front one';
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
        topMessageSide = 'It looks like you took the front photo instead of the side one';
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

    let retakeButtonText = 'Retake photos';

    if (front && !side) {
      retakeButtonText = 'Retake front photo';
    } else if (side && !front) {
      retakeButtonText = 'Retake side photo';
    }

    const isSingleError = (front && !side) || (side && !front);

    return (
      <div className="screen active hard-validation-screen">
        <div className="screen__content hard-validation">

          <div className="hard-validation__eyebrow">ERROR</div>

          <img
            className="hard-validation__image"
            src={errorIcon}
            alt="hard validation errors"
          />

          <h3 className="screen__title hard-validation__title">Oops...</h3>

          {measurementError && !front && !side ? (
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

          <div className={`hard-validation__card ${isSingleError ? 'hard-validation__card--single-error' : ''}`}>
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
                Retake both photos.
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

        </div>
        <div className="screen__footer hard-validation__footer">
          <button className="button" onClick={this.back} type="button">
<svg className="button__button-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="19" viewBox="0 0 15 19" fill="none">
  <path d="M7.5 3.69231V0L2.8125 4.61538L7.5 9.23077V5.53846C10.6031 5.53846 13.125 8.02154 13.125 11.0769C13.125 14.1323 10.6031 16.6154 7.5 16.6154C4.39687 16.6154 1.875 14.1323 1.875 11.0769H0C0 15.1569 3.35625 18.4615 7.5 18.4615C11.6438 18.4615 15 15.1569 15 11.0769C15 6.99692 11.6438 3.69231 7.5 3.69231Z" fill="white"/>
</svg>
            <span>{retakeButtonText}</span>
          </button>
        </div>
      </div>
    );
  }
}

export default connect((state) => state, actions)(HardValidation);
