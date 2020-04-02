/* eslint class-methods-use-this: off */
import { h, Component } from 'preact';
import classNames from 'classnames';
import { connect } from 'react-redux';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { gaResultsOnContinue, gaSuccess } from '../../helpers/ga';
import {
  send, objectToUrlParams,
} from '../../helpers/utils';
import { BaseMobileFlow } from '../../components';

import './Result.scss';
import fakeSizeIcon from '../../images/results.svg';

/**
 * Results page component.
 * Displays results of the flow.
 */
class Results extends BaseMobileFlow {
  constructor(props) {
    super(props);

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

    const {
      recommendations,
    } = this.props;

    this.sendSizeRecommendations(recommendations);

    gaSuccess();
  }

  componentWillReceiveProps = async (nextProps) => {
    const {
      recommendations,
    } = nextProps;

    this.sendSizeRecommendations(recommendations);
  }

  /**
   * Send size recommendations to flow api
   *
   * @param {Object} recommendations - size recommendation object
   * @param {string} [recommendations.tight] - tight size
   * @param {string} [recommendations.normal] - normal size
   * @param {string} [recommendations.loose] - loose size
   */
  sendSizeRecommendations = async (recommendations) => {
    if (recommendations.tight
        || recommendations.normal
        || recommendations.loose) {
      this.isRecommendationsSent = true;

      await this.flow.updateState({
        status: 'finished',
        recommendations,
      });
    }
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
    } = this.props;

    gaResultsOnContinue();

    if (isFromDesktopToMobile) {
      // pass measurements via hash get params to the destination page
      window.location = `${returnUrl}?${objectToUrlParams({
        ...measurements,
        personId,
      })}`;
    }

    if (isMobile) {
      if (measurements) {
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

  render() {
    const {
      recommendations,
      fakeSize,
    } = this.props;

    return (
      <div className="screen screen--result active">
        <div className={classNames('screen__content', 'result', { 'result--fake': fakeSize })}>
          <h2 className="screen__subtitle">
            <span className="success">Complete</span>
          </h2>

          {(!fakeSize) ? <h3 className="screen__title result__title">your recommended size</h3> : null }
          {(fakeSize) ? (
            <h3 className="screen__title result__title result__title--complete">
              YOUR PERFECT FIT PROFILE
              <br />
              IS COMPLETED
            </h3>
          ) : null }

          {(fakeSize) ? <p className="result__text2">Check product pages for size recommendation</p> : null }

          {(fakeSize) ? <img src={fakeSizeIcon} alt="Size icon" /> : null }

          <div className="result__sizes">
            <div className={classNames('result__size', 'result__size--tight', { active: recommendations.tight })}>
              <h3 className="result__size-num">{recommendations.tight}</h3>
              <p className="result__size-desc">Snug</p>
            </div>

            <div className={classNames('result__size', 'result__size--normal', { active: recommendations.normal })}>
              <h3 className="result__size-num">{recommendations.normal}</h3>
              <p className="result__size-desc">Perfect</p>
            </div>

            <div className={classNames('result__size', 'result__size--loose', { active: recommendations.loose })}>
              <h3 className="result__size-num">{recommendations.loose}</h3>
              <p className="result__size-desc">Loose</p>
            </div>
          </div>

          {(!fakeSize) ? (
            <p className="result__text">
              {'Your '}
              <b>Perfect Fit Profile</b>
              {' is completed.'}
              <br />
              Size recommendations for other products are
              <br />
              now available.
            </p>
          ) : null }
        </div>
        <div className="screen__footer">
          <button className="button" type="button" onClick={this.onClick}>
            Go shopping
          </button>
        </div>
      </div>
    );
  }
}

export default connect((state) => state, actions)(Results);
