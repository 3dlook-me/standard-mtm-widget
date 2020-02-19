import { h, Component } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import { gaSizeNotFound } from '../../helpers/ga';
import { objectToUrlParams } from '../../helpers/utils';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';

import './NotFound.scss';

import confusedIcon1x from '../../images/confused.png';
import confusedIcon2x from '../../images/confused@2x.png';

/**
 * Size not found page component
 */
class NotFound extends Component {
  componentDidMount = async () => {
    gaSizeNotFound();

    const {
      addFrontImage,
      addSideImage,
      token,
      flowId,
    } = this.props;

    addFrontImage(null);
    addSideImage(null);

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);
  }

  close = async () => {
    await this.flow.updateState({
      status: 'created',
    });

    route('/tutorial');
  }

  render() {
    return (
      <section className="screen active">
        <div className="screen__content not-found">
          <h2 className="screen__subtitle">
            <span className="failure">Error</span>
          </h2>

          <h3 className="screen__title not-found__title">Oops!</h3>
          <p className="not-found__text">
            Something went wrong
          </p>

          <img className="not-found__image" src={confusedIcon1x} srcSet={`${confusedIcon1x} 1x, ${confusedIcon2x} 2x`} alt="not found" />

          <p className="not-found__text-2">
            {'We '}
            <span>can’t find your Perfect Fit</span>
            {' for this item. Please '}
            <br />
            try out other items.
          </p>
        </div>
        <div className="screen__footer">
          <button className="button" onClick={this.close} type="button">ok</button>
        </div>
      </section>
    );
  }
}

export default connect(state => state, actions)(NotFound);
