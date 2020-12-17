/* eslint class-methods-use-this: off */
import { h, Component } from 'preact';
import { connect } from 'react-redux';

import {
  RESULT_SCREEN_ENTER,
  analyticsServiceAsync,
} from '../../services/analyticsService';
import { send, objectToUrlParams } from '../../helpers/utils';
import { gaResultsOnContinue, gaSuccess } from '../../helpers/ga';
import { BaseMobileFlow, Measurements, Guide } from '../../components';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';

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
      isWidgetDeactivated,
      setIsWidgetDeactivated,
      isMobile,
      isFromDesktopToMobile,
    } = this.props;

    setIsHeaderTranslucent(true);

    if (isMobile) {
      await analyticsServiceAsync({
        uuid: token,
        event: RESULT_SCREEN_ENTER,
      });
    }

    if (!isWidgetDeactivated) {
      // make request from desktop or mobile
      if ((isMobile && !isFromDesktopToMobile) || !isMobile) {
        await this.flow.widgetDeactivate();
      }
    }

    setIsWidgetDeactivated(false);

    send('data', measurements, origin);

    gaSuccess(this.getFlowPhoto());
  };

  componentWillReceiveProps = async (nextProps) => {
    const { measurements, origin } = nextProps;

    send('data', measurements, origin);
  };

  componentWillUnmount() {
    const { setIsHeaderTranslucent } = this.props;

    setIsHeaderTranslucent(false);
  }

  getFlowPhoto = () => (this.props.isTableFlow ? 'alone' : 'friend');

  openGuide = (index, type) => {
    this.setState({
      openGuide: true,
      measurementsType: type,
      measurement: index,
    });
  };

  helpBtnToggle = (status) => {
    const { setHelpBtnStatus } = this.props;

    setHelpBtnStatus(status);
  };

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
      token,
    } = this.props;

    const { openGuide } = this.state;

    if (openGuide) {
      setHelpBtnStatus(true);

      this.setState({
        openGuide: false,
      });

      return;
    }

    gaResultsOnContinue(this.getFlowPhoto());

    if (isFromDesktopToMobile) {
      // pass measurements via hash get params to the destination page
      window.location = `${returnUrl}#/?${objectToUrlParams({
        ...measurements,
        personId,
      })}`;
    }

    if (isMobile) {
      if (measurements && !isSmbFlow && !isDemoWidget) {
        window.location = `${returnUrl}#/?${objectToUrlParams({
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
  };

  render() {
    const {
      measurements,
      units,
      gender,
      customSettings,
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
          {openGuide ? (
            <Guide
              gender={gender}
              measurementsType={measurementsType}
              measurement={measurement}
            />
          ) : null}

          <h2 className="screen__subtitle">
            <span className="success">Complete</span>
          </h2>

          {finalScreen === 'measurements' ? (
            <h3 className="screen__title result__title">your Measurements</h3>
          ) : null}

          {finalScreen === 'measurements' ? (
            <Measurements
              measurements={measurements}
              units={units}
              openGuide={this.openGuide}
              helpBtnToggle={this.helpBtnToggle}
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
