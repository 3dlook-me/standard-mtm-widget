import { h, Component } from 'preact';
import { route } from 'preact-router';
import classNames from 'classnames';
import { connect } from 'react-redux';

import actions from '../../store/actions';
import { gaOnEmailNext } from '../../helpers/ga';
import { validateEmail } from '../../helpers/utils';
import { Stepper, PolicyAgreement } from '../../components';
import analyticsService, {
  EMAIL_PAGE_ENTER,
  EMAIL_PAGE_LEAVE,
  EMAIL_PAGE_ENTER_EMAIL,
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
    const { email, agree, token } = this.props;

    analyticsService({
      uuid: token,
      event: EMAIL_PAGE_ENTER,
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
        isEmailValid: validateEmail(email),
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

  changeAgree = (state) => {
    this.setState({
      isAgreeValid: state,
    });
  }

  /**
   * On next screen event handler
   */
  onNextScreen = async () => {
    const { token } = this.props;
    const { gender } = this.props.customSettings;
    const { email } = this.state;

    gaOnEmailNext();

    analyticsService({
      uuid: token,
      event: EMAIL_PAGE_ENTER_EMAIL,
      data: {
        value: email,
      },
    });

    analyticsService({
      uuid: token,
      event: EMAIL_PAGE_LEAVE,
    });

    if (gender !== 'all') {
      const { addGender } = this.props;

      addGender(gender);

      route('/height', false);

      return;
    }

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

    const {
      agree,
      isMobile,
      token,
      isDisabledEmail,
    } = this.props;

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
              disabled={isDisabledEmail}
            />
            <p className={classNames('screen__control-error', { active: !isEmailValid })}>Invalid email address</p>
          </div>
        </div>
        <div className="screen__footer">
          <PolicyAgreement
            agree={agree}
            isAgreeValid={isAgreeValid}
            token={token}
            changeAgreeState={this.changeAgree}
          />
          <button className="button" onClick={this.onNextScreen} type="button" disabled={buttonDisabled}>Next</button>
        </div>
      </div>
    );
  }
}

export default connect((state) => state, actions)(Email);
