/* eslint class-methods-use-this: off */
import { h, Component } from 'preact';
import { connect } from 'react-redux';

import {
  send, objectToUrlParams,
} from '../../helpers/utils';
import { gaResultsOnContinue, gaSuccess } from '../../helpers/ga';
import { BaseMobileFlow, Measurements, Guide } from '../../components';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';

import './Result.scss';
import emoji from '../../images/emoji-heart-eyes.png';

/**
 * Results page component.
 * Displays results of the flow.
 */
class Results extends BaseMobileFlow {
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
    await super.componentDidMount();

    const { measurements, mtmClientId } = this.props;

    this.sendMeasurements(measurements, mtmClientId);

    gaSuccess();
  }

  componentWillReceiveProps = async (nextProps) => {
    const {
      measurements,
      mtmClientId,
    } = nextProps;

    this.sendMeasurements(measurements, mtmClientId);
  }

  /**
   * Send size recommendations to flow api
   *
   * @param {Object} measurements - measurements object
   * @param {number} mtmClientId - mtm client id
   */
  sendMeasurements = async (measurements, mtmClientId) => {
    await this.flow.updateState({
      status: 'finished',
      measurements,
      mtmClientId,
    });
  }

  openGuide = (index, type) => {
    this.setState({
      openGuide: true,
      measurementsType: type,
      measurement: index,
    });
  }

  helpBtnToggle = (status) => {
    const { setHelpBtnStatus } = this.props;

    setHelpBtnStatus(status);
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
    } = this.props;

    const { openGuide } = this.state;

    if (openGuide) {
      setHelpBtnStatus(true);

      this.setState({
        openGuide: false,
      });

      return;
    }

    gaResultsOnContinue();

    if (isFromDesktopToMobile) {
      // pass measurements via hash get params to the destination page
      window.location = `${returnUrl}#/?${objectToUrlParams({
        ...measurements,
        personId,
      })}`;
    }

    if (isMobile) {
      if (measurements) {
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
  }

  render() {
    const {
      measurements,
      settings,
      units,
      gender,
    } = this.props;

    const { openGuide, measurementsType, measurement } = this.state;

    const results = settings.results_screen;

    return (
      <div className="screen screen--result active">
        <div className="screen__content result">

          {openGuide ? (
            <Guide gender={gender} measurementsType={measurementsType} measurement={measurement} />
          ) : null}

          <h2 className="screen__subtitle">
            <span className="success">
              Complete
            </span>
          </h2>

          {(results === 'measurements') ? (
            <h3 className="screen__title result__title">your Measurements</h3>
          ) : null}

          {(results === 'measurements') ? (
            <Measurements
              measurements={measurements}
              units={units}
              openGuide={this.openGuide}
              helpBtnToggle={this.helpBtnToggle}
            />
          ) : null}

          {(results === 'thanks') ? (
            <div className="result__thanks">
              <img src={emoji} alt="emoji" />
              <h3 className="result__thanks-title">Thank you!</h3>
              <p className="result__thanks-text">
                We got your measurements and
                <br />
                we’ll contact you soon.
              </p>
            </div>
          ) : null}
        </div>
        <div className="screen__footer">
          <button className="button" type="button" onClick={this.onClick}>
            {openGuide ? 'BACK TO RESULTS' : 'ok'}
          </button>
        </div>
      </div>
    );
  }
}

export default connect((state) => state, actions)(Results);
