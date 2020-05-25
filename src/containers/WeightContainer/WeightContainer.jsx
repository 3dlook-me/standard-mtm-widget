import { h, Component, createRef } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';
import classNames from 'classnames';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { getWeightKg } from '../../helpers/utils';
import { Stepper } from '../../components';
import { gaOnWeightNext } from '../../helpers/ga';

import './WeightContainer.scss';

/**
 * Size not found page component
 */
class WeightContainer extends Component {
  $weightEl = createRef();

  $nextBtn = createRef();

  constructor(props) {
    super(props);

    const { flowId, token, units } = this.props;
    const minWeight = units === 'cm' ? 30 : 66;
    const maxWeight = units === 'cm' ? 200 : 441;

    this.state = {
      buttonDisabled: true,
      isWeightValid: true,
      weightValue: null,
      placeholder: units === 'cm' ? 'kg' : 'lb',
      defaultValue: units === 'cm' ? 50 : 110,
      skipWeight: false,
      minWeight,
      maxWeight,
    };

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);

    this.weightValues = [...Array(maxWeight + 1).keys()].slice(minWeight);
  }

  /**
   * Check button state on component update
   */
  componentDidUpdate() {
    this.checkButtonState();
  }

  /**
   * Add event
   */
  componentDidMount() {
    const { weight, weightLb, units } = this.props;

    // for set default select value to input after first click
    if (this.$weightEl.current) this.$weightEl.current.addEventListener('click', this.handleChange, { once: true });

    if (weight) {
      this.setState({
        weightValue: units !== 'cm' ? weightLb : weight,
      });
    }
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

  /**
   * Set weight from select component
   */
  handleChange = (e) => {
    const { value } = e.target;
    const { setWeight, setWeightLb, units } = this.props;

    if (units !== 'cm') {
      setWeight(getWeightKg(+value));
      setWeightLb((+value));
    } else {
      setWeight(+value);
    }

    this.setState({
      weightValue: value,
    });
  }

  /**
   * Check is weight valid and set
   */
  weightValidation = (val, min, max) => {
    const { setWeight, setWeightLb, units } = this.props;

    this.setState({
      weightValue: val,
    });

    if (val.trim() >= min && val.trim() <= max) {
      if (units !== 'cm') {
        setWeight(getWeightKg(+val));
        setWeightLb((+val));
      } else {
        setWeight(+val);
      }

      this.setState({
        isWeightValid: true,
      });

      return;
    }

    if (val.trim().length === 0) {
      setWeight(null);

      this.setState({
        isWeightValid: true,
        buttonDisabled: true,
      });

      return;
    }

    setWeight(null);

    this.setState({
      isWeightValid: false,
      buttonDisabled: true,
    });
  };

  /**
   * Check is weight valid and set
   */
  changeWeight = (e) => {
    const { minWeight, maxWeight } = this.state;
    const { value } = e.target;

    this.weightValidation(value, minWeight, maxWeight);
  }

  toNextScreen = async () => {
    gaOnWeightNext();

    const {
      gender,
      height,
      weight,
      isMobile,
      units,
      email,
    } = this.props;

    if (isMobile) {
      this.$nextBtn.current.classList.add('button--blocked');

      await this.flow.updateState({
        status: 'set metadata',
        processStatus: '',
        gender,
        height,
        units,
        email,
        ...(weight && { weight }),
      })
        .finally(() => {
          this.$nextBtn.current.classList.remove('button--blocked');
        });

      route('/upload', false);
    } else {
      route('/qrcode', false);
    }
  }

  skipAndNextHandler = () => {
    const { setWeight } = this.props;

    this.setState({
      weightValue: null,
      skipWeight: true,
    }, async () => {
      await setWeight(null);

      this.toNextScreen();
    });
  }

  nextButtonClick = async () => {
    this.toNextScreen();
  }

  render() {
    const { units, isMobile } = this.props;
    const {
      buttonDisabled,
      isWeightValid,
      weightValue,
      defaultValue,
      placeholder,
      skipWeight,
    } = this.state;

    return (
      <section className="screen active">
        <div className="screen__content weight-container">
          <Stepper steps="6" current={2} />

          <div className="weight-container__control screen__control">
            <h3 className="screen__label">What’s your weight?</h3>
            <div className="weight-container__input-wrap">

              {isMobile ? (
                <div className="weight-container__input-wrap">
                  <input className="input" type="text" placeholder="Select" value={weightValue} disabled />
                  <select className="select" onChange={this.handleChange} ref={this.$weightEl}>
                    {this.weightValues.map((value) => (
                      <option value={value} selected={value === defaultValue}>
                        {value}
                        {' '}
                        {placeholder}
                      </option>
                    ))}
                  </select>
                  <div className="weight-container__placeholder">{placeholder}</div>
                </div>

              ) : (
                <div className="weight-container__input-wrap">
                  <input
                    className={classNames('input', { 'input--invalid': !isWeightValid && !skipWeight })}
                    type="number"
                    placeholder="0"
                    onBlur={this.changeWeight}
                    onKeyDown={this.handleClick}
                    value={weightValue}
                  />
                  <div className="weight-container__placeholder">{placeholder}</div>
                  <p className={classNames('screen__control-error', { active: !isWeightValid && !skipWeight })}>
                    {units === 'cm' ? 'Your weight should be between 30-200 KG' : 'Your weight should be between 66 and 441 LB'}
                  </p>
                </div>
              )}
            </div>
            <p className="weight-container__txt">
              We use weight data, so your measurements will be more accurate,
              but if you want you can
              <button className="weight-container__skip-btn" type="button" onMouseDown={this.skipAndNextHandler}>skip</button>
              this step.
            </p>
          </div>
        </div>
        <div className="screen__footer">
          <button
            className="button"
            onClick={this.nextButtonClick}
            disabled={buttonDisabled}
            type="button"
            ref={this.$nextBtn}
          >
            Next
          </button>
        </div>
      </section>
    );
  }
}

export default connect((state) => state, actions)(WeightContainer);
