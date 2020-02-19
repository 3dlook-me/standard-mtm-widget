import { h, Component } from 'preact';
import { route } from 'preact-router';
import classNames from 'classnames';
import { connect } from 'react-redux';

import './Data.scss';

import { gaDataOnContinue } from '../../helpers/ga';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';

import {
  BodyType,
  Height,
} from '../../components';

/**
 * Data page component
 */
class Data extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isHeightValid: true,
      isBodyTypeValid: true,
      isAgreeValid: true,
      buttonDisabled: true,
    };

    const { flowId, token } = this.props;
    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);
  }

  /**
   * Check button state on component update
   */
  componentDidUpdate() {
    this.checkButtonState();
  }

  /**
   * Change gender handler
   */
  changeBodyType = (bodyType) => {
    const { setBodyType } = this.props;

    setBodyType(bodyType);

    this.setState({
      isBodyTypeValid: true,
    });
  }

  /**
   * Change height handler
   */
  changeHeight = (height) => {
    const { addHeight } = this.props;

    let isValueValid = false;
    const numHeight = parseInt(height, 10);

    if (numHeight >= 150 && numHeight <= 220) {
      isValueValid = true;
    }

    addHeight(numHeight);

    this.setState({
      isHeightValid: isValueValid,
    });
  }

  /**
   * Change argee checkbox state handler
   */
  changeAgree = (e) => {
    const { addAgree } = this.props;

    addAgree(e.target.checked);

    this.setState({
      isAgreeValid: e.target.checked,
    });
  }

  /**
   * On next screen event handler
   */
  onNextScreen = async () => {
    gaDataOnContinue();

    const {
      gender,
      height,
      bodyType,
      isMobile,
    } = this.props;

    await this.flow.updateState({
      status: 'set metadata',
      gender,
      bodyType,
      height,
    });

    if (isMobile) {
      route('/tutorial', false);
    } else {
      route('/upload', false);
    }
  }

  /**
   * Set Next button disabled state
   */
  checkButtonState() {
    const { bodyType, height, agree } = this.props;
    const {
      buttonDisabled,
      isAgreeValid,
      isBodyTypeValid,
      isHeightValid,
    } = this.state;

    const isButtonDisabled = !bodyType || !height
      || !agree || !isAgreeValid
      || !isBodyTypeValid || !isHeightValid;

    if (isButtonDisabled !== buttonDisabled) {
      this.setState({
        buttonDisabled: isButtonDisabled,
      });
    }
  }

  render() {
    const {
      isBodyTypeValid,
      isHeightValid,
      isAgreeValid,
      buttonDisabled,
    } = this.state;

    const {
      agree,
    } = this.props;

    return (
      <div className="screen active">
        <div className="screen__content data">
          <h2 className="screen__subtitle">
            <span className="success">STEP 1</span>
            <span className="screen__subtitle-separ" />
            <span>STEP 2</span>
          </h2>

          <h3 className="screen__title data__title">SELECT YOUR BODY TYPE</h3>
          <BodyType className="data__body-type" change={this.changeBodyType} isValid={isBodyTypeValid} />
          <p className="data__body-type-text">
            Stay tuned for maternity and plus size
            <br />
            recommendations
          </p>

          <h3 className="screen__title data__title">How tall are you?</h3>
          <Height className="data__height" change={this.changeHeight} isValid={isHeightValid} />

        </div>
        <div className="screen__footer">
          <div className={classNames('data__check', 'checkbox', { checked: agree, 'checkbox--invalid': !isAgreeValid })}>
            <label htmlFor="agree">
              <input type="checkbox" name="agree" id="agree" onChange={this.changeAgree} checked={agree} />
              <span className="checkbox__icon" />
              { 'I accept ' }
              <a href="https://3dlook.me/terms-of-service/" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
            </label>
          </div>
          <button className="button" onClick={this.onNextScreen} type="button" disabled={buttonDisabled}>Next</button>
        </div>
      </div>
    );
  }
}

export default connect(state => state, actions)(Data);
