import { h, Component } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { gaOnHeightNext } from '../../helpers/ga';
import {
  Height,
  Stepper,
} from '../../components';

import './HeightContainer.scss';

/**
 * HeightContainer page component
 */
class HeightContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isHeightValid: true,
      buttonDisabled: true,
    };

    const { flowId, token } = this.props;

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);
  }

  componentDidMount() {
    const { height } = this.props;

    if (height && (height >= 150 && height <= 220)) {
      this.setState({
        buttonDisabled: false,
      });
    }
  }

  /**
   * Check button state on component update
   */
  componentDidUpdate() {
    this.checkButtonState();
  }

  /**
   * On next screen event handler
   */
  onNextScreen = async () => {
    gaOnHeightNext();

    route('/weight', false);
  };

  /**
   * Set Next button disabled state
   */
  checkButtonState() {
    const { height } = this.props;
    const {
      buttonDisabled,
      isHeightValid,
    } = this.state;

    const isButtonDisabled = !height || !isHeightValid;

    if (isButtonDisabled !== buttonDisabled) {
      this.setState({
        buttonDisabled: isButtonDisabled,
      });
    }
  }

  /**
   * Change height handler
   */
  changeHeight = (height) => {
    const { addHeight } = this.props;
    const numHeight = parseInt(height, 10);
    let isValueValid = false;

    if (numHeight >= 150 && numHeight <= 220) {
      isValueValid = true;
    }

    addHeight(numHeight);

    this.setState({
      isHeightValid: isValueValid,
    });
  }

  onChangeUnits = (units) => {
    const { setUnits } = this.props;

    setUnits(units);
  }

  render() {
    const {
      isHeightValid,
      buttonDisabled,
    } = this.state;

    const {
      isMobile,
      height,
      units,
    } = this.props;

    return (
      <div className="screen active">
        <div className="screen__content height-container">
          <Stepper steps="9" current={3} />

          <div className="height-container__control screen__control">
            <h3 className="screen__label">How tall are you?</h3>
            <Height
              className="height__height"
              change={this.changeHeight}
              isValid={isHeightValid}
              isMobile={isMobile}
              changeUnits={this.onChangeUnits}
              height={height}
              units={units}
            />
          </div>

        </div>
        <div className="screen__footer">
          <button className="button" onClick={this.onNextScreen} type="button" disabled={buttonDisabled}>Next</button>
        </div>
      </div>
    );
  }
}

export default connect((state) => state, actions)(HeightContainer);
