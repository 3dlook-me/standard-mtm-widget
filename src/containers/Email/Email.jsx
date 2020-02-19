import { h, Component } from 'preact';
import { route } from 'preact-router';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { Stepper } from '../../components';

import { gaOnEmailNext } from '../../helpers/ga';
import { validateEmail } from '../../helpers/utils';
import actions from '../../store/actions';

import './Email.scss';

import discountLogo from '../../images/discount-img.png';


/**
 * Email page component
 */
class Email extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEmailValid: true,
      isAgreeValid: true,
      buttonDisabled: true,
    };
  }

  /**
   * Check button state on component update
   */
  componentDidUpdate() {
    this.checkButtonState();
  }

  /**
   * Change email address
   */
  changeEmail = (e) => {
    const { setEmail } = this.props;
    const { value } = e.target;
    const isValid = validateEmail(value);

    this.setState({
      isEmailValid: isValid || !value,
    });

    if (isValid) {
      setEmail(value);
    }
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
    gaOnEmailNext();

    route('/height', false);
  }

  /**
   * Set Next button disabled state
   */
  checkButtonState() {
    const { agree } = this.props;
    const {
      buttonDisabled,
      isAgreeValid,
      isEmailValid,
    } = this.state;

    const isButtonDisabled = !agree || !isAgreeValid || !isEmailValid;

    if (isButtonDisabled !== buttonDisabled) {
      this.setState({
        buttonDisabled: isButtonDisabled,
      });
    }
  }

  render() {
    const {
      isEmailValid,
      isAgreeValid,
      buttonDisabled,
    } = this.state;

    const {
      agree,
    } = this.props;

    return (
      <div className="screen active">
        <div className="screen__content email">
          <Stepper steps="5" current="0" />

          <div className="email__control screen__control">
            <h3 className="screen__label">Enter your email</h3>
            <input
              className={classNames('input', { 'input--invalid': !isEmailValid })}
              onBlur={this.changeEmail}
              type="email"
              placeholder="email@address.com"
            />
            <p className={classNames('screen__control-error', { active: !isEmailValid })}>Invalid email address</p>
          </div>

          <div className="email__discount-banner">
            <figure className="email__discount-logo">
              <img src={discountLogo} alt="discount-logo" />
            </figure>
            <div className="email__discount-info">
              <p>
                Enter your email for a
              </p>
              <p>
                10% discount
              </p>
            </div>
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

export default connect(state => state, actions)(Email);
