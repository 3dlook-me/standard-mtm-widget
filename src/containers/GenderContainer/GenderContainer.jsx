import { h, Component } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import { gaDataMale, gaDataFemale, gaOnWeightNext } from '../../helpers/ga';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';

import {
  Stepper,
  Gender,
} from '../../components';

import './GenderContainer.scss';

/**
 * Select your gender page component
 */
class GenderContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      buttonDisabled: true,
    };

    const { flowId, token } = this.props;
    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);
  }

  /**
   * Change gender handler
   */
  changeGender = (gender) => {
    const { addGender } = this.props;

    if (gender === 'male') {
      gaDataMale();
    } else {
      gaDataFemale();
    }

    addGender(gender);

    this.setState({
      buttonDisabled: !(gender === 'male' || gender === 'female'),
    });
  }

  /**
   * Go to the next screen
   */
  next = async () => {
    gaOnWeightNext();

    route('/height', false);
  }

  render() {
    const { buttonDisabled } = this.state;

    return (
      <section className="screen active">
        <div className="screen__content select-your-gender">
          <Stepper steps="6" current={1} />
          <div className="gender__control screen__control">
            <h3 className="screen__label">Select your gender</h3>
            <Gender className="select-your-gender__gender" change={this.changeGender} />
          </div>
        </div>
        <div className="screen__footer">
          <button className="button" onClick={this.next} type="button" disabled={buttonDisabled}>Next</button>
        </div>
      </section>
    );
  }
}

export default connect((state) => state, actions)(GenderContainer);
