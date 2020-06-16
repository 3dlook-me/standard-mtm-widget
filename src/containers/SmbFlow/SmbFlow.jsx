import { h } from 'preact';
import { connect } from 'react-redux';
import { route } from 'preact-router';

import actions from '../../store/actions';
import {
  browserValidation,
  isMobileDevice,
} from '../../helpers/utils';
import { BaseMobileFlow, Loader } from '../../components';

/**
 * SMB flow page component
 */
class SmbFlow extends BaseMobileFlow {
  state = {
    hasActiveSubscription: true,
  };

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();

    window.removeEventListener('online', this.pageReload);
  }

  componentDidMount = async () => {
    const {
      matches,
      flowState,
      setFlowState,
      setIsSmbFlow,
      setIsFromDesktopToMobile,
      setSource,
    } = this.props;

    window.addEventListener('online', this.pageReload);

    await super.componentDidMount();

    const user = await this.user.get();

    if (!user.has_active_subscription) {
      this.setState({
        hasActiveSubscription: false,
      });

      return Promise.resolve();
    }

    setIsFromDesktopToMobile(false);
    setSource('dashboard');

    if (!isMobileDevice()) {
      return Promise.resolve();
    }

    if (!browserValidation()) {
      route('/browser', true);

      return Promise.resolve();
    }

    // gaSwitchToMobileFlow();

    setIsSmbFlow(true);

    const flowStateData = await this.flow.get();

    if (flowStateData.state.status !== 'finished') {
      await this.flow.updateState({
        ...flowStateData.state,
        status: 'opened-on-mobile',
        processStatus: '',
      });
    }

    if (flowStateData.state.status === 'finished') {
      route(`/results?id=${matches.id}`, true);
    } else {
      // FOR PAGE RELOAD
      if (!flowState) {
        setFlowState({
          ...flowStateData.state,
          status: 'opened-on-mobile',
        });
      }

      route('/', true);
    }

    return Promise.resolve();
  }

  pageReload = () => {
    window.location.reload();
  }

  render() {
    const { hasActiveSubscription } = this.state;
    const isDesktop = !isMobileDevice();

    if (!hasActiveSubscription) {
      return (
        <div className="screen active">
          <div className="tutorial__desktop-msg">
            <h2>Sorry! You can't complite widget flow right now. Please contact with your manager </h2>
          </div>
        </div>
      );
    }

    return (isDesktop) ? (
      <div className="screen active">
        <div className="tutorial__desktop-msg">
          <h2>Please open this link on your mobile device</h2>
        </div>
      </div>
    ) : (
      <Loader />
    );
  }
}

export default connect((state) => state, actions)(SmbFlow);
