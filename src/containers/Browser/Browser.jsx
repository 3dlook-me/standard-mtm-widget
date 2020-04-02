import { h, Component } from 'preact';
import Clipboard from 'clipboard';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { browserDetect } from '../../helpers/utils';

import actions from '../../store/actions';

import './Browser.scss';
import chrome from '../../images/chrome.svg';
import safari from '../../images/safari.svg';

class Browser extends Component {
  constructor() {
    super();

    this.neededBrowser = browserDetect();

    this.state = {
      isCopied: false,
      browser: this.neededBrowser === 'safari' ? ' Safari ' : ' Chrome ',
    };

    this.clipboard = new Clipboard('.browser__copy-btn');
  }

  copyWidgetUrl = () => {
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
    const { browser, isCopied } = this.state;
    const { widgetUrl } = this.props;
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
            data-clipboard-text={widgetUrl}
            onClick={this.copyWidgetUrl}
          >
            {(!isCopied) ? 'Copy link' : 'Link copied'}
          </button>
        </div>
      </section>
    );
  }
}

export default connect((state) => state, actions)(Browser);
