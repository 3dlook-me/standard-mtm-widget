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
      isKeyboardActive: false,
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

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.setEmailViewportHeight);
      window.visualViewport.addEventListener('scroll', this.setEmailViewportHeight);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.inputFocusTimeout);
    clearTimeout(this.inputBlurTimeout);

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.setEmailViewportHeight);
      window.visualViewport.removeEventListener('scroll', this.setEmailViewportHeight);
    }

    if (this.emailScreen) {
      this.emailScreen.style.removeProperty('--email-screen-height');
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

  handleInputFocus = (e) => {
    const { isMobile } = this.props;

    if (!isMobile) {
      return;
    }

    const { target } = e;

    clearTimeout(this.inputFocusTimeout);
    clearTimeout(this.inputBlurTimeout);

    this.setState({ isKeyboardActive: true }, () => {
      this.inputFocusTimeout = setTimeout(() => {
        this.setEmailViewportHeight();

        if (target && target.scrollIntoView) {
          try {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            });
          } catch (err) {
            target.scrollIntoView(false);
          }
        }
      }, 350);
    });
  }

  handleInputBlur = () => {
    const { isMobile } = this.props;

    if (!isMobile) {
      return;
    }

    clearTimeout(this.inputBlurTimeout);

    this.inputBlurTimeout = setTimeout(() => {
      const { activeElement } = document;
      const { tagName } = activeElement || {};
      const isEmailInputActive = this.emailScreen
        && activeElement
        && this.emailScreen.contains(activeElement)
        && /^(INPUT|TEXTAREA|SELECT)$/.test(tagName);

      if (!isEmailInputActive) {
        if (this.emailScreen) {
          this.emailScreen.style.removeProperty('--email-screen-height');
        }

        this.setState({ isKeyboardActive: false });
      }
    }, 200);
  }

  setEmailViewportHeight = () => {
    const { isMobile } = this.props;
    const { isKeyboardActive } = this.state;

    if (!isMobile || !this.emailScreen || !window.visualViewport) {
      return;
    }

    const isKeyboardOpen = window.innerHeight - window.visualViewport.height > 120;

    if (isKeyboardOpen) {
      this.emailScreen.style.setProperty('--email-screen-height', '100%');

      if (!isKeyboardActive) {
        this.setState({ isKeyboardActive: true });
      }

      return;
    }

    this.emailScreen.style.removeProperty('--email-screen-height');

    if (isKeyboardActive) {
      this.setState({ isKeyboardActive: false });
    }
  }

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
      setTimeout(() => {
        this.setState({
          buttonDisabled: isButtonDisabled,
        });
      }, 100);
    }
  }

  render() {
    const {
      isEmailValid,
      isAgreeValid,
      buttonDisabled,
      isKeyboardActive,
      email,
      firstName,
    } = this.state;

    const {
      agree,
      isMobile,
      token,
      isDisabledEmail,
      isDisabledFullName,
    } = this.props;

    return (
      <div
        className={classNames('screen active email-screen', {
          'email-screen--keyboard': isKeyboardActive,
        })}
        ref={(el) => { this.emailScreen = el; }}
      >
        <div className="email-screen__body">
          <div className="screen__content email">
            <Stepper steps="5" current="1" />

            <div className="email__control screen__control">
              <h3 className="email__label screen__label">Enter your email</h3>
              <input
                className={classNames('input', { 'input--invalid': !isEmailValid })}
                onFocus={this.handleInputFocus}
                onBlur={!isMobile ? this.changeEmail : this.handleInputBlur}
                onChange={isMobile ? this.changeEmail : false}
                type="email"
                placeholder="email@address.com"
                value={email}
                disabled={isDisabledEmail}
              />
              <p className={classNames('screen__control-error', { active: !isEmailValid })}>Invalid email address</p>
            </div>

            <div className="name__control screen__control">
              <h3 className="email__label screen__label">Enter your full name</h3>
              <input
                className={classNames('input')}
                onFocus={this.handleInputFocus}
                onBlur={!isMobile ? this.changeName : this.handleInputBlur}
                onChange={isMobile ? this.changeName : false}
                type="text"
                placeholder="Alex Smith"
                value={firstName}
                disabled={isDisabledFullName}
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
            <button className="button" onClick={this.onNextScreen} type="button" disabled={buttonDisabled}>Continue</button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => state, actions)(Email);
