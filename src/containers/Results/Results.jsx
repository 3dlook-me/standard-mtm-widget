/* eslint class-methods-use-this: off */
import { h, Component } from 'preact';
import classNames from 'classnames';
import { connect } from 'react-redux';
import Clipboard from 'clipboard';

import {
  send, sendDataToSpreadsheet, objectToUrlParams,
} from '../../helpers/utils';
import { gaResultsOnContinue, gaSuccess } from '../../helpers/ga';
import { BaseMobileFlow } from '../../components';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import './Result.scss';

import fakeSizeIcon from '../../images/results.svg';
import promoBg from '../../images/promo-bg.png';

/**
 * Results page component.
 * Displays results of the flow.
 */
class Results extends BaseMobileFlow {
  constructor(props) {
    super(props);

    this.state = {
      isEmailValid: true,
      buttonDisabled: true,
      isCopied: false,
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

  /**
   * Check button state on component update
   */
  componentDidUpdate() {
    this.checkButtonState();
  }

  componentDidMount = async () => {
    await super.componentDidMount();

    // init clipboard
    this.clipboard = new Clipboard('.result__promo');

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
   * Copy promo-code to clipboard
   */
  copyPromo = () => {
    const { onCopy } = this.props;

    if (onCopy) {
      onCopy();
    }

    this.setState({
      isCopied: true,
    }, () => {
      const timer = setTimeout(() => {
        this.setState({
          isCopied: false,
        }, () => clearTimeout(timer));
      }, 3000);
    });
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
      email,
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

  /**
   * Set Next button disabled state
   */
  checkButtonState() {
    const {
      buttonDisabled,
      isEmailValid,
    } = this.state;

    const isButtonDisabled = !isEmailValid;

    if (isButtonDisabled !== buttonDisabled) {
      this.setState({
        buttonDisabled: isButtonDisabled,
      });
    }
  }

  render() {
    const {
      isCopied,
      buttonDisabled,
    } = this.state;

    const {
      recommendations,
      fakeSize,
    } = this.props;

    const promoCode = 'LoveMyFit';

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
          <button className="button" type="button" onClick={this.onClick} disabled={buttonDisabled}>
            Go shopping
          </button>
        </div>
      </div>
    );
  }
}

export default connect(state => state, actions)(Results);
