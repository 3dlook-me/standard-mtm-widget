import { h } from 'preact';
import { connect } from 'react-redux';
import { route } from 'preact-router';

import { gaSwitchToMobileFlow } from '../../helpers/ga';
import actions from '../../store/actions';
import { BaseMobileFlow } from '../../components';
import { isMobileDevice } from '../../helpers/utils';

/**
 * Mobile flow page component
 */
class MobileFlow extends BaseMobileFlow {
  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  componentDidMount = async () => {
    const { matches, resetState } = this.props;

    if (!isMobileDevice()) {
      route(`/tutorial?id=${matches.id}`, true);

      return Promise.resolve();
    }

    await super.componentDidMount();

    gaSwitchToMobileFlow();

    resetState();

    this.flow.resetGlobalState();

    const flowState = await this.flow.get();

    if (flowState.state.status !== 'finished') {
      await this.flow.updateState({
        ...flowState.state,
        status: 'opened-on-mobile',
      });
    }

    if (flowState.state.status === 'finished') {
      route(`/results?id=${matches.id}`, true);
    } else {
      route(`/tutorial?id=${matches.id}`, true);
    }
  }

  render() {
    return (
      <div />
    );
  }
}

export default connect((state) => state, actions)(MobileFlow);
