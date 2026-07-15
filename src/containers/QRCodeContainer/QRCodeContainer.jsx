// eslint-disable-next-line no-unused-vars
import { h, Component, Fragment } from 'preact';
import { route, Link } from 'preact-router';
import API from '@3dlook/saia-sdk/lib/api';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Clipboard from 'clipboard';
import IntlTelInput from 'react-intl-tel-input';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import SMSService from '../../services/smsService';
import {
  filterCustomMeasurements,
  validatePhoneNumberLetters,
} from '../../helpers/utils';
import analyticsService, {
  SCAN_QR_CODE_PAGE_ENTER,
  SCAN_QR_CODE_PAGE_LEAVE,
  SCAN_QR_CODE_PAGE_LINK_COPIED,
  SCAN_QR_CODE_PAGE_SMS_SENT,
} from '../../services/analyticsService';
import {
  Preloader,
  QRCodeBlock,
  Stepper,
  Loader,
} from '../../components';
import { flowStatuses } from '../../configs/flowStatuses';

import './QRCodeContainer.scss';
import smsSendingIcon from '../../images/sms-sending.svg';

const isFlowFinished = (flowState) => (
  flowState.widget_flow_status === flowStatuses.FINISHED
  || flowState.state.status === flowStatuses.FINISHED
);

/**
 * ScanQRCode page component.
 */
class QRCodeContainer extends Component {
  lastActiveDate = null;

  constructor(props) {
    super(props);

    const { flowIsPending } = props;

    this.init(props);

    this.state = {
      isPending: !!flowIsPending,
      isSMSPending: false,
      isSMSSuccess: false,

      qrCodeUrl: null,
      copyUrl: null,
      isShortUrlFetching: true,
      isCopied: false,

      isPhoneNumberValid: true,
      phoneNumber: null,

      resendTime: 60,
    };
  }

  componentDidMount() {
    const {
      flowId,
      token,
      phoneCountry,
      phoneUserPart,
      phoneNumber,
      flowIsPending,
    } = this.props;

    if (flowIsPending) {
      return;
    }

    const mobileFlowUrl = `${window.location.origin}${window.location.pathname}#/mobile/${flowId}`;

    analyticsService({
      uuid: token,
      event: SCAN_QR_CODE_PAGE_ENTER,
    });

    if (phoneCountry && phoneUserPart) {
      this.setState({
        isPhoneNumberValid: true,
        phoneNumber,
      });
    }

    window.addEventListener('online', this.pageReload);

    this.setState({
      qrCodeUrl: mobileFlowUrl,
    });

    // init clipboard
    this.clipboard = new Clipboard('.scan-qrcode__btn');

    this.sms = new SMSService(token);
    this.sms.getShortLink(mobileFlowUrl)
      .then((res) => {
        this.setState({
          copyUrl: res.short_link,
          isShortUrlFetching: false,
        });
      })
      .catch(() => { this.setState({ isShortUrlFetching: false }); })
      .finally(async () => {
        const { copyUrl, qrCodeUrl } = this.state;

        await this.flow.updateState({
          widgetUrl: copyUrl || qrCodeUrl,
        });
      });
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    this.init(nextProps);
  }

  componentDidUpdate(prevProps, prevState) {
    const { isPending } = this.state;
    const { token } = this.props;

    if (!prevState.isPending && isPending) {
      analyticsService({
        uuid: token,
        event: SCAN_QR_CODE_PAGE_LEAVE,
      });
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
    clearInterval(this.timer);

    window.removeEventListener('online', this.pageReload);
  }

  /**
   * Change phone number
   */
  changePhoneNumber = (isValid, number, country) => {
    const {
      setPhoneCountry,
      setPhoneUserPart,
      setPhoneNumber,
    } = this.props;

    const phoneNumber = `${country.dialCode}${number}`;
    const noLettersCheck = validatePhoneNumberLetters(phoneNumber);

    this.setState({
      isPhoneNumberValid: isValid && noLettersCheck,
      phoneNumber,
    });

    if (isValid && noLettersCheck) {
      setPhoneCountry(country.iso2);
      setPhoneUserPart(number);
      setPhoneNumber(phoneNumber);
    }
  }

  async init(props) {
    const {
      token,
      flowId,
      isMobile,
      setProcessingStatus,
      settings,
      gender,
      height,
      weight,
      units,
      email,
      productUrl,
      brand,
      bodyPart,
      returnUrl,
      productId,
      phoneNumber,
      mtmClientId,
      firstName,
    } = props;

    if (token && flowId && !this.api && !this.flow) {
      this.api = new API({
        host: `${API_HOST}/api/v2/`,
        key: token,
      });

      this.api.axios.defaults.headers = {
        Authorization: `UUID ${token}`,
      };

      this.flow = new FlowService(token);
      this.flow.setFlowId(flowId);

      const currentFlowState = await this.flow.get();

      if (!isMobile && isFlowFinished(currentFlowState)) {
        this.handleFinishedFlow(currentFlowState);

        return;
      }

      await this.flow.update({
        unit: units,
        ...(phoneNumber && { phone: phoneNumber }),
        ...(email && { email }),
        state: {
          status: flowStatuses.SET_METADATA,
          processStatus: '',
          fakeSize: false,
          gender,
          height,
          units,
          email,
          productUrl,
          brand,
          bodyPart,
          returnUrl,
          productId,
          settings,
          ...(weight && { weight }),
        },
      });

      await this.api.mtmClient.update(mtmClientId, {
        ...(firstName && {
          first_name: firstName,
        }),
      });

      if (!isMobile) {
        let loaderCounter = 0;

        this.timer = setInterval(() => {
          this.flow.get()
            .then((flowState) => {
              if (isFlowFinished(flowState)) {
                this.handleFinishedFlow(flowState);

                return;
              }

              // eslint-disable-next-line max-len
              if (flowState.state.status === flowStatuses.OPENED_ON_MOBILE && flowState.state.lastActiveDate) {
                this.setState({
                  isPending: true,
                });

                const { processStatus } = flowState.state;

                if (processStatus || processStatus === '') {
                  setProcessingStatus(processStatus);
                }

                const currentTime = this.lastActiveDate && this.lastActiveDate.getTime();
                const widgetWasAliveAt = new Date(flowState.updated).getTime();

                if (currentTime === widgetWasAliveAt) {
                  if (loaderCounter < 3) { loaderCounter += 1; }

                  if (loaderCounter === 3) {
                    this.setState({ isPending: false });
                  }

                  return;
                }

                if (loaderCounter !== 0) loaderCounter = 0;
              }

              this.lastActiveDate = new Date(flowState.updated);
            })
            .catch((err) => console.log(err));
        }, 3000);
      }
    }
  }

  handleFinishedFlow = (flowState) => {
    const {
      setMeasurements,
      setSoftValidation,
      setProcessingStatus,
      setFlowIsPending,
    } = this.props;
    const {
      measurements,
      softValidation,
    } = flowState.state;
    const { widget_settings } = flowState;
    const hasCustomOutputMeasurements = widget_settings && widget_settings.is_custom_output_measurements;
    const outputMeasurements = widget_settings && widget_settings.output_measurements;

    if (softValidation) {
      setSoftValidation(softValidation);
    }

    if (measurements) {
      if (!hasCustomOutputMeasurements) {
        setMeasurements(measurements);
      } else {
        setMeasurements({
          ...measurements,
          ...(filterCustomMeasurements(measurements, { outputMeasurements })),
        });
      }
    }

    setProcessingStatus('');
    setFlowIsPending(false);
    clearInterval(this.timer);
    this.timer = null;

    route('/results', true);
  }

  copyUrl = () => {
    const { onCopy, token } = this.props;

    analyticsService({
      uuid: token,
      event: SCAN_QR_CODE_PAGE_LINK_COPIED,
    });

    this.resendTimer();

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

  showQRCodeHelp = () => {
    route('/qrcode-help');
  }

  sendSMS = () => {
    const { phoneNumber, qrCodeUrl } = this.state;
    const { token } = this.props;

    if (!phoneNumber) {
      this.setState({
        isPhoneNumberValid: false,
      });
    } else {
      this.setState({
        isSMSPending: true,
      });

      analyticsService({
        uuid: token,
        event: SCAN_QR_CODE_PAGE_SMS_SENT,
        data: {
          value: phoneNumber,
        },
      });

      this.sms.send(phoneNumber, qrCodeUrl)
        .then(() => {
          this.resendTimer();

          this.setState({
            isSMSPending: false,
            isSMSSuccess: true,
          });

          return this.flow.update({
            phone: phoneNumber,
            state: {
              phoneNumber,
            },
          });
        })
        .catch((err) => {
          const retrySmsTime = err.response.headers['retry-after'];

          if (retrySmsTime && retrySmsTime >= 0) {
            this.setState({
              isSMSPending: false,
              resendTime: retrySmsTime,
              isSMSSuccess: true,
            });

            this.resendTimer();

            return;
          }

          this.setState({
            isSMSPending: false,
            isSMSSuccess: false,
          });
          alert(err.messaage);
        });
    }
  }

  resendTimer = () => {
    const { resendTime } = this.state;
    let time = resendTime;

    clearInterval(this.SmsTimer);

    this.SmsTimer = setInterval(() => {
      if (time === 0) {
        clearInterval(this.SmsTimer);

        this.setState({
          isSMSSuccess: false,
          resendTime: 60,
        });

        return;
      }

      this.setState({
        resendTime: time -= 1,
      });
    }, 1000);
  };

  pageReload = () => {
    const { isPending } = this.state;

    if (!isPending) {
      window.location.reload();
    }
  }

  render() {
    const {
      qrCodeUrl,
      isPending,
      isCopied,
      isPhoneNumberValid,
      phoneNumber,
      isSMSPending,
      isSMSSuccess,
      resendTime,
      copyUrl,
      isShortUrlFetching,
    } = this.state;

    const {
      sendDataStatus,
      phoneCountry,
      phoneUserPart,
      gender,
    } = this.props;

    const qrCopyUrl = copyUrl || qrCodeUrl;

    return (
      <div className="screen active">
        <div className={classNames('screen__content', 'scan-qrcode')}>
          {!isPending ? <Fragment><Stepper steps="5" current="5" />

          <h3 className="screen__title scan-qrcode__title">
            Scan This QR Code
          </h3>
          <p className="scan-qrcode__text">and proceed on your mobile device</p>

          <div className="scan-qrcode__help-btn">
            <Link href="/qrcode-help">How to use QR code</Link>
          </div>

          <div
            className={classNames('scan-qrcode__qrcode-wrap', {
              'scan-qrcode__qrcode-wrap--hidden': isShortUrlFetching,
            })}
          >
            <QRCodeBlock className="scan-qrcode__qrcode" data={qrCopyUrl} />

            {isShortUrlFetching ? <Loader /> : false}
          </div>

          <button className={classNames('scan-qrcode__btn', { 'scan-qrcode__btn--copied': isCopied })} disabled={isShortUrlFetching} type="button" data-clipboard-text={qrCopyUrl} onClick={() => this.copyUrl()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" viewBox="0 0 25 20" fill="none">
              <path d="M9.47977 15.3209L8.3745 16.7912C8.02607 17.2551 7.52146 17.533 6.95415 17.5735C6.3865 17.6145 5.82402 17.4137 5.36979 17.0081L5.12197 16.7866C4.18459 15.9493 4.00713 14.4895 4.72662 13.5328L9.6752 6.95066C10.3948 5.99369 11.7425 5.89689 12.6799 6.73377L12.9277 6.95529C13.382 7.36087 13.673 7.92274 13.7478 8.53723C13.8224 9.15178 13.6716 9.74554 13.3231 10.2092L12.8853 10.7916C12.6703 11.0775 12.723 11.5119 13.0032 11.7621C13.2835 12.0125 13.6845 11.984 13.8995 11.6974L14.3373 11.1151C15.486 9.5874 15.2029 7.25678 13.7062 5.9199L13.4582 5.69844C11.9618 4.3618 9.81002 4.51722 8.66098 6.04474L3.71239 12.6269C2.56377 14.1546 2.84676 16.4851 4.34353 17.8219L4.59135 18.0435C5.31634 18.691 6.21463 19.0116 7.12079 18.9462C7.42338 18.9242 7.71459 18.8603 7.98914 18.7572C8.53686 18.5515 9.01801 18.19 9.3887 17.6971L10.494 16.227C10.709 15.941 10.6562 15.5065 10.3762 15.2563C10.0962 15.0066 9.69539 15.0353 9.47977 15.3209Z" fill="#222222" />
              <path d="M20.4149 2.17952L20.1671 1.95801C19.4421 1.3105 18.5438 0.989854 17.6376 1.05528C16.7312 1.12098 15.926 1.56409 15.3697 2.30437L14.2644 3.77442C14.0494 4.06047 14.1022 4.49493 14.3822 4.74518C14.6624 4.99538 15.0637 4.96654 15.2787 4.68052L16.3839 3.21026C16.7327 2.74685 17.2377 2.46894 17.8043 2.42794C18.3719 2.38694 18.9344 2.58779 19.3886 2.99338L19.6365 3.21489C20.574 4.0521 20.7512 5.51176 20.0318 6.46867L15.0832 13.0508C14.3639 14.0075 13.0157 14.1046 12.0785 13.2677L11.8307 13.0462C11.3764 12.6406 11.0854 12.0787 11.0106 11.4642C10.936 10.8497 11.0868 10.2559 11.4353 9.79223L11.8731 9.20986C12.0881 8.92399 12.0353 8.48952 11.7551 8.23933C11.4754 7.98937 11.0743 8.01775 10.8589 8.30411L10.4211 8.88633C9.27243 10.4141 9.5555 12.7447 11.0522 14.0816L11.3002 14.303C12.3045 15.2001 13.6039 15.4252 14.6974 15.0145C15.2332 14.8132 15.7196 14.4591 16.0974 13.9567L21.046 7.37461C21.6025 6.63467 21.8433 5.6865 21.7241 4.70539C21.605 3.72409 21.1399 2.82703 20.4149 2.17952Z" fill="#222222" />
            </svg>
            <span>{(!isCopied) ? 'Copy link' : 'Link copied'}</span>
          </button>

          <h3 className="screen__title scan-qrcode__title-2">
            or enter your mobile number
          </h3>

          <div className="screen__control scan-qrcode__control">
            <IntlTelInput
              containerClassName="intl-tel-input"
              defaultCountry={phoneCountry || ''}
              defaultValue={phoneUserPart || ''}
              inputClassName={classNames('input', 'scan-qrcode__phone', {
                'input--invalid': !isPhoneNumberValid,
                'input--dirty': !!phoneNumber,
              })}
              separateDialCode="true"
              onPhoneNumberBlur={this.changePhoneNumber}
            />
            <p
              className={classNames('scan-qrcode__error', {
                active: !isPhoneNumberValid,
              })}
            >
              Invalid phone number
            </p>

            <p className="scan-qrcode__text">and get a link via text message</p>
          </div>
        <div className="screen__footer">
          <button
            className={classNames('button', {
              'button--sms-pending': isSMSPending,
              'button--sms-success': isSMSSuccess,
            })}
            onClick={this.sendSMS}
            type="button"
            disabled={
              isSMSPending
              || !isPhoneNumberValid
              || !phoneNumber
              || isSMSSuccess
            }
          >
            <img className="spin" src={smsSendingIcon} alt="sms sending" />

            {isSMSPending ? 'SENDING' : null}
            {isSMSSuccess ? `Try again in ${resendTime}` : null}
            {!isSMSSuccess && !isSMSPending ? 'Send' : null}
          </button>
        </div>
          </Fragment> : null}
        </div>

        <Preloader
          isActive={isPending}
          status={sendDataStatus}
          gender={gender}
        />
      </div>
    );
  }
}

export default connect((state) => state, actions)(QRCodeContainer);
