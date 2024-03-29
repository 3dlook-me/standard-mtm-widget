// eslint-disable-next-line no-unused-vars
import { h } from 'preact';
import { connect } from 'react-redux';
import { route } from 'preact-router';
import { detect } from 'detect-browser';

import actions from '../../store/actions';
import {
  browserValidation, isMobileDevice,
} from '../../helpers/utils';
import analyticsService, {
  MOBILE_FLOW_START,
} from '../../services/analyticsService';
import { BaseMobileFlow, Loader } from '../../components';
import { flowStatuses } from '../../configs/flowStatuses';

/**
 * Mobile flow page component
 */
class MobileFlow extends BaseMobileFlow {
  state = {
    hasActiveSubscription: true,
  };

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();

    window.removeEventListener('online', this.pageReload);
  }

  componentDidMount = async () => {
    const { matches } = this.props;

    analyticsService({
      uuid: matches.id,
      event: MOBILE_FLOW_START,
      data: {
        device: isMobileDevice() ? 'mobile' : 'web browser',
        browser: detect().name === 'ios' ? 'safari' : detect().name,
      },
    });

    try {
      const { flowState, setFlowState } = this.props;

      window.addEventListener('online', this.pageReload);

      if (!isMobileDevice()) {
        route('/camera-mode-selection', true);

        return Promise.resolve();
      }

      await super.componentDidMount();

      if (!browserValidation()) {
        route('/browser', true);

        return Promise.resolve();
      }

      const flowStateData = await this.flow.get();

      if (flowStateData.state.status !== flowStatuses.FINISHED) {
        await this.flow.update({
          widget_flow_status: flowStatuses.OPENED_ON_MOBILE,
          state: {
            ...flowStateData.state,
            status: flowStatuses.OPENED_ON_MOBILE,
            processStatus: '',
          },
        });

        // FOR PAGE RELOAD
        if (!flowState) {
          setFlowState({
            ...flowStateData.state,
            status: flowStatuses.OPENED_ON_MOBILE,
          });
        }

        setInterval(() => {
          this.flow.updateState({
            lastActiveDate: Date.now(),
          });
        }, 3000);

        route('/camera-mode-selection');

        return Promise.resolve();
      }

      route('/results');

      return Promise.resolve();
    } catch (err) {
      if (err.response.status === 401
        && err.response.data.detail === 'Widget is inactive.') {
        const {
          setIsWidgetDeactivated,
          setIsFromDesktopToMobile,
        } = this.props;

        await setIsWidgetDeactivated(true);

        await super.componentDidMount();

        setIsFromDesktopToMobile(false);

        route('/results', true);

        return Promise.resolve();
      }

      if (err && err.response && err.response.data) {
        // eslint-disable-next-line no-console
        console.error(err.response.data.detail);
      } else {
        // eslint-disable-next-line no-console
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

    if (!hasActiveSubscription) {
      return (
        <div className="screen active">
          <div className="tutorial__desktop-msg">
            <h2>
              Sorry! Your measuring process cannot be completed right now.
              Please contact your brand representative.
            </h2>
          </div>
        </div>
      );
    }

    return (
      <Loader />
    );
  }
}

export default connect((state) => state, actions)(MobileFlow);
