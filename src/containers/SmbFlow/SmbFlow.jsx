/* eslint class-methods-use-this: off */
// eslint-disable-next-line no-unused-vars
import { h } from 'preact';
import { connect } from 'react-redux';
import { route } from 'preact-router';
import classNames from 'classnames';

import actions from '../../store/actions';
import {
  browserValidation,
  isMobileDevice,
} from '../../helpers/utils';
import { BaseMobileFlow, Loader } from '../../components';
import { flowStatuses } from '../../configs/flowStatuses';

import './SmbFlow.scss';

/**
 * SMB flow page component
 */
class SmbFlow extends BaseMobileFlow {
  state = {
    hasActiveSubscription: true,
    isWidgetArchived: false,
    isLimitReached: false,
    max_calculations: null,
    sender_email: null,
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

      if (matches.source === 'qr') {
        setIsSmbQRFlow(true);
      }

      // await this.checkSource(flowStateData);

      setReturnUrl(flowStateData.widget_settings.redirect_link || 'https://3dlook.me/mobile-tailor/');

      if (flowStateData.state.status !== flowStatuses.FINISHED) {
        await this.flow.update({
          widget_flow_status: flowStatuses.OPENED_ON_MOBILE,
          state: {
            ...flowStateData.state,
            status: flowStatuses.OPENED_ON_MOBILE,
            processStatus: '',
          },
        });

        if (!flowState) {
          setFlowState({
            ...flowStateData.state,
            status: flowStatuses.OPENED_ON_MOBILE,
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

      if (err.response.status === 403 && err.response.data.detail === 'User does not have available calculations.') {
        const {
          detail,
          max_calculations_according_to_active_subscription,
          email
        } = err.response.data;

        //if (detail === 'User does not have available calculations.') {
        this.setLimitMsg(max_calculations_according_to_active_subscription, email);
        return Promise.resolve();
        //}
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

    if (!widget.mtm_client) return;

    await fetch(`${API_HOST}/api/v2/measurements/mtm-clients/${widget.mtm_client}/`, {
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

  setLimitMsg = (max_calculations, email) => {
    this.setState({
      isLimitReached: true,
      max_calculations,
      sender_email: email,
    });
  }


  render() {
    const {
      hasActiveSubscription,
      isWidgetArchived,
      isLimitReached,
      max_calculations,
      sender_email,
    } = this.state;
    const isDesktop = !isMobileDevice();

    if (isLimitReached) {
      return (
        <div className="screen active">
          <div className={classNames('limit-reached', 'active')}>
            <figure className="limit-reached__wrap">
              <div className="limit-reached__wrap--calculations"><span>{max_calculations}</span>/{max_calculations}</div>
              <div className="limit-reached__wrap--title">Oops! The limit has been reached</div>
              <p>The measurements can not be calculated.</p>
              <p>Please reach out the scan link sender to unlock the action</p>

              <a className="button" href={`mailto:${sender_email}`}>Contact sender</a>
            </figure>
          </div>
        </div>
      )
    }
    if (!hasActiveSubscription || isWidgetArchived) {
      return (
        <div className="screen active">
          <div className="tutorial__desktop-msg">
            {/* eslint-disable-next-line max-len */}
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
