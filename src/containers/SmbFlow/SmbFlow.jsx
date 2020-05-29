import { h } from 'preact';
import { connect } from 'react-redux';
import { route } from 'preact-router';

import actions from '../../store/actions';
import {
  browserValidation,
} from '../../helpers/utils';
import { BaseMobileFlow, Loader } from '../../components';

/**
 * SMB flow page component
 */
class SmbFlow extends BaseMobileFlow {
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
    } = this.props;

    window.addEventListener('online', this.pageReload);

    await super.componentDidMount();

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

      setInterval(() => {
        this.flow.updateState({
          lastActiveDate: Date.now(),
        });
      }, 3000);

      route('/', true);
    }

    return Promise.resolve();
  }

  pageReload = () => {
    window.location.reload();
  }

  render() {
    return (
      <Loader />
    );
  }
}

export default connect((state) => state, actions)(SmbFlow);
