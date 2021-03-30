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
    isWidgetArchived: false,
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
        setIsSmbQRFlow,
        setIsFromDesktopToMobile,
        setReturnUrl,
        setSource,
      } = this.props;

      window.addEventListener('online', this.pageReload);

      await super.componentDidMount();

      setIsFromDesktopToMobile(false);

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

      const flowStateData = await this.flow.get();

      await this.checkSource(flowStateData);

      setReturnUrl(flowStateData.widget_settings.redirect_link || 'https://3dlook.me/mobile-tailor/');

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

          setSource('dashboard');
          setIsDemoWidget(true);

          setInterval(() => {
            this.flow.updateState({
              lastActiveDate: Date.now(),
            });
          }, 3000);
        }

        route('/', true);

        return Promise.resolve();
      }

      route('/results', true);

      return Promise.resolve();
    } catch (err) {
      const {
        setReturnUrl,
        setIsMobile,
        setIsSmbFlow,
      } = this.props;

      // for 401 widget not found to close widget
      setIsSmbFlow(true);
      setIsMobile(true);
      setReturnUrl('https://3dlook.me/mobile-tailor/');

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

      if (err.response.status === 401
        && err.response.data.detail === 'Widget is archived.') {
        this.setState({ isWidgetArchived: true });

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

  // TODO remove after back refactor and handle source from widget
  checkSource = async (widget) => {
    const { setIsSmbQRFlow } = this.props;

    await fetch(`${API_HOST}/api/v2/measurements/mtm-clients/${widget.mtm_client}`, {
      headers: {
        Authorization: `UUID ${widget.uuid}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.source === 'qr') {
          setIsSmbQRFlow(true);
        }
      });
  }

  render() {
    const { hasActiveSubscription, isWidgetArchived } = this.state;
    const isDesktop = !isMobileDevice();

    if (!hasActiveSubscription || isWidgetArchived) {
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
