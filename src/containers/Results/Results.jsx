/* eslint class-methods-use-this: off */
import { Component, h } from 'preact';
import { connect } from 'react-redux';
import { route } from 'preact-router';
import classNames from 'classnames';

import {
  RESULT_SCREEN_ENTER,
  analyticsServiceAsync,
} from '../../services/analyticsService';
import {
  send,
  objectToUrlParams,
  getGaEventLabel,
} from '../../helpers/utils';
import {
  gaResultsOnContinue,
  gaSuccess,
  gaOnSoftRetakeBtn,
} from '../../helpers/ga';
import {
  Measurements,
  Guide,
  SoftValidation,
} from '../../components';
import FlowService from '../../services/flowService';

import './Result.scss';
import successIcon from '../../images/ic_done.svg';
import actions from '../../store/actions';

/**
 * Results page component.
 * Displays results of the flow.
 */
class Results extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openGuide: false,
      measurementsType: null,
      measurement: null,
    };

    const { flowId, token } = this.props;

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);

    // the problem is that if we have soft validation screen
    // then at results screen we have size recommendations in componentDidMount
    // but if we dont have soft validation errors, then in componentDidMount
    // size recommendations will be equal null
    // to fix this we need to send patch request
    // only once (in componentDidMount or componentWillReceiveProps)
    // and because of that we need this flag to prevent double patch request
    this.isRecommendationsSent = false;
  }

  componentDidMount = async () => {
    const {
      measurements,
      origin,
      setIsHeaderTranslucent,
      token,
      setFlowIsPending,
      setProcessingStatus,
      setIsWidgetDeactivated,
      isMobile,
    } = this.props;

    setIsHeaderTranslucent(true);

    this.removeGuideFromUrl();

    if (isMobile) {
      await analyticsServiceAsync({
        uuid: token,
        event: RESULT_SCREEN_ENTER,
      });
    }

    setIsWidgetDeactivated(false);

    send('data', measurements, origin);

    gaSuccess(this.getFlowPhoto());

    if (!isMobile) {
      this.timer = setInterval(() => {
        this.flow.get()
          .then((flowState) => {
            if (flowState.state.status === 'finished') {
              return;
            }

            setFlowIsPending(true);
            setProcessingStatus('');

            route('/qrcode', true);
          })
          .catch((err) => console.log(err));
      }, 3000);
    }
  }

  componentWillReceiveProps = async (nextProps) => {
    const { measurements, origin } = nextProps;

    send('data', measurements, origin);
  };

  componentWillUnmount() {
    const { setIsHeaderTranslucent } = this.props;

    setIsHeaderTranslucent(false);
    clearInterval(this.timer);
  }

  getFlowPhoto = () => (this.props.isTableFlow ? 'alone' : 'friend');

  openGuide = (index, type) => {
    this.setGuideToUrl();

    this.setState({
      openGuide: true,
      measurementsType: type,
      measurement: index,
    });
  }

  helpBtnToggle = (status) => {
    const { setHelpBtnStatus } = this.props;

    setHelpBtnStatus(status);
  };

  onRetake = async () => {
    const {
      addFrontImage,
      addSideImage,
      setTaskId,
      softValidation,
      isTableFlow,
    } = this.props;

    await this.flow.updateState({
      status: 'opened-on-mobile',
      processStatus: '',
    });

    if (!softValidation.looseTop && !softValidation.looseBottom
      && !softValidation.looseTopAndBottom) {
      addFrontImage(null);

      gaOnSoftRetakeBtn(getGaEventLabel(isTableFlow), 'front');
    } else {
      addFrontImage(null);
      addSideImage(null);

      gaOnSoftRetakeBtn(getGaEventLabel(isTableFlow), 'both');
    }

    setTaskId(null);
    route('/upload', true);
  }

  onClick = async () => {
    const {
      returnUrl,
      isFromDesktopToMobile,
      origin,
      personId,
      resetState,
      measurements,
      isMobile,
      isOpenReturnUrlDesktop,
      setHelpBtnStatus,
      isSmbFlow,
      isDemoWidget,
    } = this.props;

    const { openGuide } = this.state;

    if (openGuide) {
      setHelpBtnStatus(true);

      this.removeGuideFromUrl();

      this.setState({
        openGuide: false,
      });

      return;
    }

    gaResultsOnContinue(this.getFlowPhoto());

    if (isFromDesktopToMobile) {
      // pass measurements via hash get params to the destination page
      window.location = `${returnUrl}?${objectToUrlParams({
        ...measurements,
        personId,
      })}`;
    }

    if (isMobile) {
      try {
        await this.flow.widgetDeactivate();
      } catch (err) {
        console.log(err);
      }

      if (measurements && !isSmbFlow && !isDemoWidget) {
        window.location = `${returnUrl}?${objectToUrlParams({
          ...measurements,
          personId,
        })}`;
      } else {
        window.location = returnUrl;
      }
    } else if (isOpenReturnUrlDesktop) {
      window.parent.location = returnUrl;
    } else {
      resetState();
      send('close', {}, origin);
    }
  }

  setGuideToUrl = () => {
    window.location.hash = `${window.location.hash}?guide=true`;
  }

  removeGuideFromUrl = () => {
    window.location.hash = window.location.hash.replace('?guide=true', '');
  }

  render() {
    const {
      measurements,
      isSoftValidationPresent,
      softValidation,
      units,
      gender,
      isMobile,
      customSettings,
      softValidationRetryCounter,
    } = this.props;

    const {
      openGuide,
      measurementsType,
      measurement,
    } = this.state;

    const finalScreen = customSettings.final_screen || 'thanks';

    return (
      <div className="screen screen--result active">
        <div className="screen__content result">
          <div className={classNames('screen__content', 'result', {
            'result--with-soft-validation': isSoftValidationPresent,
          })}
          >
            {openGuide ? (
              <Guide
                gender={gender}
                measurementsType={measurementsType}
                measurement={measurement}
                close={this.onClick}
              />
            ) : null}

            <h2 className="screen__subtitle">
              <span className="success">Complete</span>
            </h2>

            {finalScreen === 'measurements' ? (
              <h3 className="screen__title result__title">your Measurements</h3>
            ) : null}

            {(isSoftValidationPresent && !openGuide) ? (
              <SoftValidation
                className="result__soft-validation"
                retake={this.onRetake}
                units={units}
                gender={gender}
                softValidation={softValidation}
                isDesktop={!isMobile}
                softValidationRetryCounter={softValidationRetryCounter}
              />
            ) : null }

            {finalScreen === 'measurements' ? (
              <Measurements
                measurements={measurements}
                units={units}
                openGuide={this.openGuide}
                helpBtnToggle={this.helpBtnToggle}
                isSoftValidation={isSoftValidationPresent}
                isCustomMeasurements={customSettings.is_custom_output_measurements}
                isOpenGuide={openGuide}
              />
            ) : null}

            {finalScreen === 'thanks' ? (
              <div className="result__thanks">
                <figure className="result__thanks-icon">
                  <img src={successIcon} alt="success" />
                </figure>
                <h3 className="result__thanks-title">Success! You're all set.</h3>
                <p className="result__thanks-text">
                  We've got your measurements to
                  <br />
                  create your customized wardrobe
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="screen__footer">
          <button className="button" type="button" onClick={this.onClick}>
            {openGuide ? 'BACK TO RESULTS' : 'CLOSE'}
          </button>
        </div>
      </div>
    );
  }
}

export default connect((state) => state, actions)(Results);
