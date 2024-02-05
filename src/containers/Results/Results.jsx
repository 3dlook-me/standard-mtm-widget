/* eslint class-methods-use-this: off */
// eslint-disable-next-line no-unused-vars
import { Component, h } from 'preact';
import { connect } from 'react-redux';
import { route } from 'preact-router';
import classNames from 'classnames';
import axios from 'axios';

import {
  RESULT_SCREEN_ENTER,
  analyticsServiceAsync,
} from '../../services/analyticsService';
import {
  send,
  objectToUrlParams,
} from '../../helpers/utils';
import {
  Measurements,
  Guide,
  SoftValidation,
} from '../../components';
import FlowService from '../../services/flowService';
import { flowStatuses } from '../../configs/flowStatuses';
import actions from '../../store/actions';

import './Result.scss';
import successIcon from '../../images/ic_done.svg';

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

    this.axios = axios.create();
    this.axios.defaults.headers = {
      Authorization: `UUID ${token}`,
    };
    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);

    // the problem is that if we have soft validation screen
    // then at results screen we have size recommendations in componentDidMount
    // but if we don't have soft validation errors, then in componentDidMount
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
      isRetakeFlow,
    } = this.props;

    setIsHeaderTranslucent(true);

    this.removeGuideFromUrl();

    if (isMobile) {
      await analyticsServiceAsync({
        uuid: token,
        event: RESULT_SCREEN_ENTER,
        data: {
          retake: !!isRetakeFlow,
        },
      });
    }

    setIsWidgetDeactivated(false);

    send('data', measurements, origin);

    if (!isMobile) {
      this.timer = setInterval(() => {
        this.flow.get()
          .then((flowState) => {
            if (flowState.state.status === flowStatuses.FINISHED) {
              return;
            }

            setFlowIsPending(true);
            setProcessingStatus('');

            route('/qrcode', true);
          })
          // eslint-disable-next-line no-console
          .catch((err) => console.log(err));
      }, 3000);
    }
  }

  // eslint-disable-next-line react/no-deprecated,no-unused-vars
  componentWillReceiveProps = async (nextProps) => {
    const { measurements, origin } = nextProps;

    send('data', measurements, origin);
  };

  componentWillUnmount() {
    const { setIsHeaderTranslucent } = this.props;

    setIsHeaderTranslucent(false);
    clearInterval(this.timer);
  }

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
    } = this.props;

    await this.flow.update({
      widget_flow_status: flowStatuses.OPENED_ON_MOBILE,
      state: {
        status: flowStatuses.OPENED_ON_MOBILE,
        processStatus: '',
      },
    });

    if (!softValidation.looseTop && !softValidation.looseBottom
      && !softValidation.looseTopAndBottom) {
      addFrontImage(null);
    } else {
      addFrontImage(null);
      addSideImage(null);
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
      customSettings,
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

    // eslint-disable-next-line max-len
    const customizeScreen = customSettings.final_screen_customization_data.allowFinalScreenCustomization;
    const customizationData = customSettings.final_screen_customization_data;

    // eslint-disable-next-line max-len
    const customRedirect = customizeScreen && !!customizationData.final_screen_is_custom_redirect && !!customizationData.final_screen_custom_redirect_link ? customizationData.final_screen_custom_redirect_link : returnUrl;

    if (isFromDesktopToMobile) {
      // pass measurements via hash get params to the destination page
      window.location = `${customRedirect}${objectToUrlParams({
        ...measurements,
        personId,
      }, customRedirect)}`;
    }

    if (isMobile) {
      try {
        await this.flow.widgetDeactivate();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }

      if (measurements && !isSmbFlow && !isDemoWidget) {
        window.location = `${customRedirect}${objectToUrlParams({
          ...measurements,
          personId,
        }, customRedirect)}`;
      } else {
        window.location = customRedirect;
      }
    } else if (isOpenReturnUrlDesktop) {
      window.parent.location = customRedirect;
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
      // eslint-disable-next-line camelcase
    } = this.state;

    const finalScreen = customSettings.final_screen_customization_data.final_screen || customSettings.final_screen || 'thanks';
    // eslint-disable-next-line max-len
    const customizeScreen = customSettings.final_screen_customization_data.allowFinalScreenCustomization;
    const customizationData = customSettings.final_screen_customization_data;
    const buttonStyle = {
      backgroundColor: customizeScreen && !!customizationData.final_screen_button_color ? customizationData.final_screen_button_color : '#343239',
      color: customizeScreen && !!customizationData.final_screen_button_text_color ? customizationData.final_screen_button_text_color : '#fff',
    };

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
              <h3 className="screen__title result__title">
                your Measurements
              </h3>
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
            ) : null}

            {finalScreen === 'measurements' ? (
              <div>
                {customizeScreen && customSettings.final_screen_logo
                  ? (
                    <img
                      className="result__measurements-logo"
                      src={customSettings.final_screen_logo}
                      alt="logo"
                    />
                  ) : null}

                {customizeScreen && customizationData.final_screen_text
                  ? (
                    <p className="result__measurements-text">
                      {customizeScreen && customizationData.final_screen_text}
                    </p>
                  ) : null}

                <Measurements
                  measurements={measurements}
                  units={units}
                  openGuide={this.openGuide}
                  helpBtnToggle={this.helpBtnToggle}
                  gender={gender}
                  isSoftValidation={isSoftValidationPresent}
                  isCustomMeasurements={customSettings.is_custom_output_measurements}
                  isOpenGuide={openGuide}
                />
              </div>
            ) : null}

            {finalScreen === 'thanks' ? (

              <div className="result__thanks">
                {customizeScreen && customSettings.final_screen_logo
                  ? (<img className="result__thanks-logo" src={customSettings.final_screen_logo} alt="logo" />) : null}
                <figure className="result__thanks-icon">
                  <img src={successIcon} alt="success" />
                </figure>
                <h3 className="result__thanks-title">
                  {customizeScreen && customizationData.final_screen_title ? customizationData.final_screen_title : 'CONGRATS!'}
                </h3>
                <p className="result__thanks-text">
                  {customizeScreen && customizationData.final_screen_text
                    ? customizationData.final_screen_text
                    : 'Your AI scan was a success and your measurements have been captured!'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="screen__footer">
          <button style={buttonStyle} className="button" type="button" onClick={this.onClick}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {openGuide ? 'BACK TO RESULTS'
              : customizeScreen && customizationData.final_screen_button_text
                ? customizationData.final_screen_button_text
                : 'CLOSE'}
          </button>
        </div>
      </div>
    );
  }
}

export default connect((state) => state, actions)(Results);
