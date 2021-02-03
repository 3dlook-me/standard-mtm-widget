import { h, Component } from 'preact';
import Clipboard from 'clipboard';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { browserDetect } from '../../helpers/utils';
import actions from '../../store/actions';
import { gaChangeBrowser, gaChangeBrowserCopyLink } from '../../helpers/ga';

import './Browser.scss';
import chrome from '../../images/chrome.svg';
import safari from '../../images/safari.svg';
import SMSService from '../../services/smsService';

class Browser extends Component {
  constructor() {
    super();

    this.neededBrowser = browserDetect();

    this.state = {
      url: null,
      buttonDisabled: true,
      isCopied: false,
      browser: this.neededBrowser === 'safari' ? ' Safari ' : ' Chrome ',
    };

    this.clipboard = new Clipboard('.browser__copy-btn');
  }

  componentDidMount() {
    const { browser } = this.state;
    const {
      isFromDesktopToMobile, token, widgetUrl,
    } = this.props;

    gaChangeBrowser(browser.toLowerCase());

    if (!isFromDesktopToMobile) {
      this.sms = new SMSService(token);
      this.sms.getShortLink(widgetUrl)
        .then((res) => {
          this.setState({
            url: res.short_link,
            buttonDisabled: false,
          });
        })
        .catch(() => {
          this.setState({
            url: widgetUrl,
            buttonDisabled: false,
          });
        });

      return;
    }

    this.setState({
      url: widgetUrl,
      buttonDisabled: false,
    });
  }

  copyWidgetUrl = () => {
    const { browser } = this.state;

    gaChangeBrowserCopyLink(browser.toLowerCase());

    this.setState({
      isCopied: true,
    }, () => {
      const copyTimer = setTimeout(() => {
        this.setState({
          isCopied: false,
        }, () => clearTimeout(copyTimer));
      }, 3000);
    });
  }

  render() {
    const {
      browser, isCopied, url, buttonDisabled,
    } = this.state;
    const browserIcon = this.neededBrowser === 'safari' ? safari : chrome;

    return (
      <section className="screen active">
        <div className="screen__content browser">
          <div className="browser__control screen__control">
            <figure className="browser__img">
              <img src={browserIcon} alt="browser" />
            </figure>
            <h2 className="browser__title">
              Please, continue in
              {browser}
            </h2>
            <p className="browser__txt">
              Use
              {browser}
              to finish the process.
              <br />
              Otherwise, the camera won’t work.
            </p>
          </div>
        </div>
        <div className="screen__footer">
          <button
            className={classNames('button browser__copy-btn', { 'browser__copy-btn--copied': isCopied })}
            type="button"
            data-clipboard-text={url}
            onClick={this.copyWidgetUrl}
            disabled={buttonDisabled}
          >
            {(!isCopied) ? 'Copy link' : 'Link copied'}
          </button>
        </div>
      </section>
    );
  }
}

export default connect((state) => state, actions)(Browser);
