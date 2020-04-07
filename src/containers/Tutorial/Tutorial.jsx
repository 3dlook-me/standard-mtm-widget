import { h } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import actions from '../../store/actions';
import { gaTutorialMobile } from '../../helpers/ga';
import { isMobileDevice } from '../../helpers/utils';
import { Stepper, BaseMobileFlow } from '../../components';

import './Tutorial.scss';

/**
 * Tutorial video page component
 */
class Tutorial extends BaseMobileFlow {
  constructor(props) {
    super(props);

    const { setPageReloadStatus } = props;

    this.reloadListener = () => {
      setPageReloadStatus(true);
    };

    window.addEventListener('unload', this.reloadListener);
  }

  componentWillUnmount() {
    window.removeEventListener('unload', this.reloadListener);
  }

  async componentDidMount() {
    const isDesktop = !isMobileDevice();

    if (isDesktop) {
      document.querySelector('.header__close').classList.add('header__close--hide');
    }

    await super.componentDidMount();

    const {
      isFromDesktopToMobile, pageReloadStatus,
    } = this.props;

    // PAGE RELOAD: update flowState
    if (pageReloadStatus && isFromDesktopToMobile) {
      const { setPageReloadStatus, flowState } = this.props;

      setPageReloadStatus(false);

      await this.flow.updateState(flowState);
    }
  }

  back = () => {
    gaTutorialMobile();

    route('/upload', true);
  }

  render() {
    const isDesktop = !isMobileDevice();

    return (
      <div className="screen active">

        {isDesktop ? (
          <div className="tutorial__desktop-msg">
            <h2>Please open this link on your mobile device</h2>
          </div>
        ) : (
          <div className="screen__content tutorial">
            <Stepper steps="5" current="2" />

            <div className="tutorial__video-wrapper">
              <iframe
                className="tutorial__video"
                type="text/html"
                width="640"
                height="360"
                title="tutorial video"
                src={`https://www.youtube.com/embed/j4hYBfykfQo?autoplay=1&origin=${window.location.origin}&enablejsapi=1&rel=0&showinfo=0&autohide=1`}
                frameBorder="0"
                allowFullScreen
              />
            </div>

            <p className="tutorial__text">We take your privacy very seriously and do not store photos.</p>
          </div>
        )}

        {isDesktop ? true : (
          <div className="screen__footer">
            <button className="button" onClick={this.back} type="button">Got it</button>
          </div>
        )}
      </div>
    );
  }
}

export default connect((state) => state, actions)(Tutorial);
