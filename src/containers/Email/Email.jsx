// eslint-disable-next-line no-unused-vars
import { h, Component } from 'preact';
import { route } from 'preact-router';
import classNames from 'classnames';
import { connect } from 'react-redux';

import actions from '../../store/actions';
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
      // eslint-disable-next-line react/no-unused-state
      isName: false,
      buttonDisabled: true,
      email: null,
      firstName: null,
    };
  }

  componentDidMount() {
    const {
      email,
      agree,
      token,
      firstName,
    } = this.props;

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

      // return;
    }

    if (email) {
      this.setState({
        email,
        isEmailValid: validateEmail(email),
        isEmail: true,
      });
    }

    if (firstName) {
      this.setState({
        firstName,
        // eslint-disable-next-line react/no-unused-state
        isName: true,
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
 * Change name
 */
  changeName = (e) => {
    const { setFirstName } = this.props;
    const { value } = e.target;
    const isName = value.trim().length > 0;

    this.setState({
      // eslint-disable-next-line react/no-unused-state
      isName,
      firstName: value,
    });

    if (isName) {
      setFirstName(value);
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
    const { token, customSettings } = this.props;
    const { gender } = customSettings;
    const { email, firstName } = this.state;

    analyticsService({
      uuid: token,
      event: EMAIL_PAGE_ENTER_EMAIL,
      data: {
        email,
        firstName,
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
      firstName,
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

          <div className="name__control screen__control">
            <h3 className="screen__label">Enter your full name</h3>
            <input
              className={classNames('input')}
              onBlur={!isMobile ? this.changeName : false}
              onChange={isMobile ? this.changeName : false}
              type="text"
              placeholder="Alex Smith"
              value={firstName}
            />
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

