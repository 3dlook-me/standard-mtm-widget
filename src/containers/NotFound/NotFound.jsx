// eslint-disable-next-line no-unused-vars
import { h, Component } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import actions from '../../store/actions';
import { mobileFlowStatusUpdate } from '../../helpers/utils';
import FlowService from '../../services/flowService';
import analyticsService, {
  NOT_FOUND_PAGE,
} from '../../services/analyticsService';

import './NotFound.scss';
import errorIcon from '../../images/error.png';

/**
 * Size not found page component
 */
class NotFound extends Component {
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

  componentDidMount = async () => {
    const {
      addFrontImage,
      addSideImage,
      token,
      flowId,
      pageReloadStatus,
      isFromDesktopToMobile,
      isNetwork,
      isDemoWidget,
    } = this.props;

    analyticsService({
      uuid: token,
      event: NOT_FOUND_PAGE,
    });

    if (isNetwork) {
      addFrontImage(null);
      addSideImage(null);
    }

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);
    this.flow.updateLocalState({ processStatus: '' });

    // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
    if ((pageReloadStatus && isFromDesktopToMobile) || (pageReloadStatus && isDemoWidget)) {
      const { flowState, setPageReloadStatus } = this.props;

      setPageReloadStatus(false);

      mobileFlowStatusUpdate(this.flow, flowState);
    }
  }

  close = () => {
    route('/upload');
  }

  render() {
    const { isNetwork } = this.props;
    const btnText = isNetwork ? 'Okay' : 'Try again';
    const text = isNetwork
      ? 'Something went wrong. Please try again in a minute.'
      : 'Please check your internet connection and try again.';

    return (
      <section className="screen active">
        <div className="screen__content not-found">
          <div className="not-found__eyebrow">ERROR</div>

          <img className="not-found__image" src={errorIcon} alt="error" />

          <h3 className="screen__title not-found__title">Oops...</h3>
          <p className="not-found__text">
            Something went wrong
          </p>

          <div className="not-found__card">
            <h4 className="not-found__title-2">
              Can&apos;t calculate
              <br />
              measurements
            </h4>
            <p className="not-found__text-2">{text}</p>
          </div>
        </div>
        <div className="screen__footer not-found__footer">
          <button className="button" onClick={this.close} type="button">{btnText}</button>
        </div>
      </section>
    );
  }
}

export default connect((state) => state, actions)(NotFound);
