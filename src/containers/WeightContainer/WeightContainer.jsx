import { h, Component } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import classNames from 'classnames';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { getWeightKg } from '../../helpers/utils';

import { Stepper } from '../../components';
import './WeightContainer.scss';

/**
 * Size not found page component
 */
class WeightContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      buttonDisabled: true,
      isWeightValid: true,
    };

    const { flowId, token } = this.props;

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);
  }

  /**
   * Check button state on component update
   */
  componentDidUpdate() {
    this.checkButtonState();
  }

  /**
   * Set Next button disabled state
   */
  checkButtonState() {
    const {
      weight,
    } = this.props;

    const {
      buttonDisabled,
      isWeightValid,
    } = this.state;

    const isButtonDisabled = !weight;

    if (isButtonDisabled !== buttonDisabled && isWeightValid) {
      this.setState({
        buttonDisabled: isButtonDisabled,
      });
    }
  }

  handleClick = (e) => {
    if (e.keyCode === 69) {
      e.returnValue = false;
    }
  }

  changeWeight = (e) => {
    const { setWeight, units } = this.props;
    const { value } = e.target;

    if (value.trim().length > 1 && value.trim().length < 4) {
      if (units !== 'cm') {
        setWeight(getWeightKg(+value));
      } else {
        setWeight(value);
      }

      this.setState({
        isWeightValid: true,
      });
    } else {
      setWeight(null);

      this.setState({
        isWeightValid: false,
        buttonDisabled: true,
      });
    }
  }

  nextButtonClick = async () => {
    const {
      gender,
      height,
      weight,
      bodyType,
      isMobile,
      units,
    } = this.props;

    await this.flow.updateState({
      status: 'set metadata',
      gender,
      bodyType,
      height,
      weight,
      units,
    });

    if (isMobile) {
      route('/tutorial', false);
    } else {
      route('/qrcode', false);
    }
  }

  render() {
    const { units } = this.props;
    const { buttonDisabled, isWeightValid } = this.state;
    const placeholder = units === 'cm' ? 'KG' : 'LB';

    return (
      <section className="screen active">
        <div className="screen__content weight-container">
          <Stepper steps="6" current={2} />

          <div className="weight-container__control screen__control">
            <h3 className="screen__label">What’s your weight?</h3>
            <div className="weight-container__input-wrap">
              <input className="input" type="number" placeholder="0" onBlur={this.changeWeight} onKeyDown={this.handleClick} />
              <div className="weight-container__placeholder">{placeholder}</div>
              <p className={classNames('screen__control-error', { active: !isWeightValid })}>
                Invalid weight
              </p>
            </div>
            <p className="weight-container__txt">
              We use weight data, so your measurements will be more accurate,
              but if you want you can
              <button className="weight-container__skip-btn" type="button">skip</button>
              this step.
            </p>
          </div>
        </div>
        <div className="screen__footer">
          <button className="button" onClick={this.nextButtonClick} disabled={buttonDisabled} type="button">Next</button>
        </div>
      </section>
    );
  }
}

export default connect((state) => state, actions)(WeightContainer);
