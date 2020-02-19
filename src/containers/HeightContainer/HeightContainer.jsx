import { h, Component } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import classNames from 'classnames';
import { gaOnHeightNext } from '../../helpers/ga';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';

import './HeightContainer.scss';

import {
  Height,
  Stepper,
} from '../../components';

/**
 * HeightContainer page component
 */
class HeightContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isHeightValid: true,
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
   * On next screen event handler
   */
  onNextScreen = async () => {
    gaOnHeightNext();

    const {
      gender,
      height,
      bodyType,
      isMobile,
      email,
      units,
    } = this.props;

    await this.flow.updateState({
      status: 'set metadata',
      gender,
      bodyType,
      height,
      email,
      units,
    });

    if (isMobile) {
      route('/tutorial', false);
    } else {
      route('/qrcode', false);
    }
  };

  /**
   * Change argee checkbox state handler
   */
  changeAgree = (e) => {
    const { addAgree } = this.props;

    addAgree(e.target.checked);

    this.setState({
      isAgreeValid: e.target.checked,
    });
  };

  /**
   * Set Next button disabled state
   */
  checkButtonState() {
    const { height, agree } = this.props;
    const {
      isAgreeValid,
      buttonDisabled,
      isHeightValid,
    } = this.state;

    const isButtonDisabled = !agree || !height || !isAgreeValid || !isHeightValid;

    if (isButtonDisabled !== buttonDisabled) {
      this.setState({
        buttonDisabled: isButtonDisabled,
      });
    }
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

  onChangeUnits = (units) => {
    const { setUnits } = this.props;

    setUnits(units);
  }

  render() {
    const {
      isAgreeValid,
      isHeightValid,
      buttonDisabled,
    } = this.state;

    const {
      agree,
    } = this.props;

    return (
      <div className="screen active">
        <div className="screen__content how-tall-are-you">
          <Stepper steps="5" current="1" />

          <div className="how-tall-are-you__control screen__control">
            <h3 className="screen__label">How tall are you?</h3>
            <Height className="how-tall-are-you__height" change={this.changeHeight} isValid={isHeightValid} changeUnits={this.onChangeUnits} />
          </div>

        </div>
        <div className="screen__footer">
          <div className={classNames('email__check', 'checkbox', { checked: agree, 'checkbox--invalid': !isAgreeValid })}>
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

export default connect(state => state, actions)(HeightContainer);
