// eslint-disable-next-line no-unused-vars
import { h, Component } from 'preact';
import { route, Link } from 'preact-router';
import API from '@3dlook/saia-sdk/lib/api';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Clipboard from 'clipboard';
import IntlTelInput from 'react-intl-tel-input';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import SMSService from '../../services/smsService';
import { validatePhoneNumberLetters } from '../../helpers/utils';
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
      setMeasurements,
      setSoftValidation,
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
      setFlowIsPending,
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
              // eslint-disable-next-line max-len
              if (flowState.state.status === flowStatuses.OPENED_ON_MOBILE && flowState.state.lastActiveDate) {
                this.setState({
                  isPending: true,
                });

                const { processStatus } = flowState.state;

                if (processStatus || processStatus === '') {
                  setProcessingStatus(processStatus);
                }

                const currentTime = this.lastActiveDate.getTime();
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

              if (flowState.state.status === flowStatuses.FINISHED) {
                const {
                  measurements,
                  softValidation,
                } = flowState.state;
                setSoftValidation(softValidation);
                setMeasurements(measurements);
                setFlowIsPending(false);

                route('/results', true);
              }
            })
            .catch((err) => console.log(err));
        }, 3000);
      }
    }
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
          {!isPending ? <Stepper steps="5" current="2" /> : null}

          <h3 className="screen__title scan-qrcode__title">
            SCAN THIS QR CODE
          </h3>
          <p>and proceed on your mobile device</p>

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
            {(!isCopied) ? 'Copy link' : 'Link copied'}
            <svg width="11px" height="14px" viewBox="0 0 11 14" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g className="qrcode__btn-svg" transform="translate(-325.000000, -341.000000)" stroke="#396EC5" strokeWidth="1.3">
                  <g transform="translate(326.000000, 342.000000)">
                    <path d="M1.27272727,10 C0.569819409,10 0,9.36040679 0,8.57142857 L0,1.42857143 C0,0.639593215 0.569819409,0 1.27272727,0 L1.27272727,0 L5.72727273,0 C6.43018059,0 7,0.639593215 7,1.42857143 L7,1.42857143" id="Path" />
                    <rect id="Rectangle" x="2.65" y="2.65" width="6.7" height="9.7" rx="2" />
                  </g>
                </g>
              </g>
            </svg>
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

            <p>and get a link via text message</p>
          </div>
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
