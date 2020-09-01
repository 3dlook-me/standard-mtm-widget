import { h, Component } from 'preact';
import { route } from 'preact-router';
import classNames from 'classnames';
import { connect } from 'react-redux';

import actions from '../../store/actions';
import { gaOnEmailNext } from '../../helpers/ga';
import { parseGetParams, validateEmail } from '../../helpers/utils';
import { Stepper } from '../../components';
import analyticsService, {
  EMAIL_PAGE_ENTER, EMAIL_PAGE_LEAVE,
  EMAIL_PAGE_TERMS_CHECK, EMAIL_PAGE_ENTER_EMAIL,
} from '../../services/analyticsService';

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
    const { email, agree, matches } = this.props;
    const token = matches.key || API_KEY || parseGetParams().key;

    analyticsService({
      uuid: matches.key || API_KEY || parseGetParams().key,
      event: EMAIL_PAGE_ENTER,
      token,
    });

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
    const { setEmail, matches } = this.props;
    const { value } = e.target;
    const isValid = validateEmail(value);
    const isEmail = value.trim().length > 0;

    analyticsService({
      uuid: matches.key || API_KEY || parseGetParams().key,
      event: EMAIL_PAGE_ENTER_EMAIL,
      token: matches.key || API_KEY || parseGetParams().key,
      data: {
        value,
      },
    });

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
   * Change agree checkbox state handler
   */
  changeAgree = (e) => {
    const { addAgree, matches } = this.props;

    if (e.target.checked) {
      analyticsService({
        uuid: matches.key || API_KEY || parseGetParams().key,
        event: EMAIL_PAGE_TERMS_CHECK,
        token: matches.key || API_KEY || parseGetParams().key,
        data: {
          value: e.target.checked,
        },
      });
    }

    addAgree(e.target.checked);

    this.setState({
      isAgreeValid: e.target.checked,
    });
  }

  /**
   * On next screen event handler
   */
  onNextScreen = async () => {
    const { matches } = this.props;
    gaOnEmailNext();

    analyticsService({
      uuid: matches.key || API_KEY || parseGetParams().key,
      event: EMAIL_PAGE_LEAVE,
      token: matches.key || API_KEY || parseGetParams().key,
    });
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
          <Stepper steps="9" current="1" />

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
              { ' and ' }
              <a href="https://3dlook.me/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </label>
          </div>
          <button className="button" onClick={this.onNextScreen} type="button" disabled={buttonDisabled}>Next</button>
        </div>
      </div>
    );
  }
}

export default connect((state) => state, actions)(Email);
