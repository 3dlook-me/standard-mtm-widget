import { h, Component } from 'preact';
import { route } from 'preact-router';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { Stepper } from '../../components';

import { gaOnEmailNext } from '../../helpers/ga';
import { validateEmail } from '../../helpers/utils';
import actions from '../../store/actions';

import './Email.scss';

/**
 * Email page component
 */
class Email extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEmail: false,
      isEmailValid: true,
      isAgreeValid: true,
      buttonDisabled: true,
      email: null,
    };
  }

  componentDidMount() {
    const { email, agree } = this.props;

    if (email && agree) {
      this.setState({
        email,
        buttonDisabled: false,
        isEmailValid: true,
        isEmail: true,
      });

      return;
    }

    if (email) {
      this.setState({
        email,
        isEmailValid: true,
        isEmail: true,
      });
    }
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
    const isEmail = value.trim().length > 0;

    this.setState({
      isEmailValid: (isValid || !value),
      isEmail,
      email: value,
    });

    if (isValid) {
      setEmail(value);
    } else if (!isEmail || !isValid) {
      setEmail(null);
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
  }

  /**
   * On next screen event handler
   */
  onNextScreen = async () => {
    gaOnEmailNext();

    route('/gender', false);
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
      isEmail,
    } = this.state;

    const isButtonDisabled = !agree || !isAgreeValid || !isEmailValid || !isEmail;

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
      email,
    } = this.state;

    const { agree, isMobile } = this.props;

    return (
      <div className="screen active">
        <div className="screen__content email">
          <Stepper steps="5" current="0" />

          <div className="email__control screen__control">
            <h3 className="screen__label">Enter your email</h3>
            <input
              className={classNames('input', { 'input--invalid': !isEmailValid })}
              onBlur={!isMobile ? this.changeEmail : false}
              onChange={isMobile ? this.changeEmail : false}
              type="email"
              placeholder="email@address.com"
              value={email}
            />
            <p className={classNames('screen__control-error', { active: !isEmailValid })}>Invalid email address</p>
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

export default connect((state) => state, actions)(Email);
