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
    try {
      const {
        matches,
        flowState,
        setFlowState,
        setIsSmbFlow,
        setIsFromDesktopToMobile,
        setSource,
        setReturnUrl,
      } = this.props;

      window.addEventListener('online', this.pageReload);

      await super.componentDidMount();

      setIsFromDesktopToMobile(false);
      setSource('dashboard');

      if (!isMobileDevice()) {
        return Promise.resolve();
      }

      if (!browserValidation()) {
        route('/browser', true);

        return Promise.resolve();
      }

      if (matches.source !== 'demo') {
        setIsSmbFlow(true);
      }

      setReturnUrl('https://mtm.3dlook.me/');

      const flowStateData = await this.flow.get();

      if (flowStateData.state.status !== 'finished') {
        await this.flow.updateState({
          ...flowStateData.state,
          status: 'opened-on-mobile',
          processStatus: '',
        });

        if (!flowState) {
          setFlowState({
            ...flowStateData.state,
            status: 'opened-on-mobile',
          });
        }

        if (matches.source === 'demo') {
          const { setIsDemoWidget } = this.props;

          setIsDemoWidget(true);

          setInterval(() => {
            this.flow.updateState({
              lastActiveDate: Date.now(),
            });
          }, 3000);
        }

        route('/', true);
      }

      return Promise.resolve();
    } catch (err) {
      if (err.response.status === 401
        && err.response.data.detail === 'Widget is inactive.') {
        const {
          setIsWidgetDeactivated,
          setReturnUrl,
          setIsFromDesktopToMobile,
        } = this.props;

        await setIsWidgetDeactivated(true);

        await super.componentDidMount();

        setIsFromDesktopToMobile(false);
        setReturnUrl('https://mtm.3dlook.me/');

        route('/results', true);

        return Promise.resolve();
      }

      if (err && err.response && err.response.data) {
        console.error(err.response.data.detail);
      } else {
        console.error(err.message);
      }

      this.setState({
        hasActiveSubscription: false,
      });

      return Promise.resolve();
    }
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
            <h2>Sorry! Your measuring process cannot be completed right now. Please contact your brand representative.</h2>
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
