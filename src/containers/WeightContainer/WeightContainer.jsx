// eslint-disable-next-line no-unused-vars
import { h, Component, createRef } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';
import API from '@3dlook/saia-sdk/lib/api';
import classNames from 'classnames';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import analyticsService, {
  WEIGHT_PAGE_ENTER,
  WEIGHT_PAGE_LEAVE,
  WEIGHT_PAGE_WEIGHT_SELECTED,
  WEIGHT_PAGE_IMPERIAL_SELECTED,
  WEIGHT_PAGE_METRIC_SELECTED,
} from '../../services/analyticsService';
import {
  getWeightKg,
  getWeightLb,
  closeSelectsOnResize,
  mobileFlowStatusUpdate,
} from '../../helpers/utils';
import { Stepper } from '../../components';
import { flowStatuses } from '../../configs/flowStatuses';

import './WeightContainer.scss';

/**
 * Size not found page component
 */
class WeightContainer extends Component {
  $weightEl = createRef();

  $nextBtn = createRef();

  constructor(props) {
    super(props);
    this.init(props);
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
      units,
    };

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);

    this.weightValues = [...Array(maxWeight + 1).keys()].slice(minWeight);

    const { setPageReloadStatus, isDemoWidget } = props;

    if (isDemoWidget) {
      this.reloadListener = () => {
        setPageReloadStatus(true);
      };

      window.addEventListener('unload', this.reloadListener);
    }
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
    const {
      weight,
      weightLb,
      units,
      isMobile,
      pageReloadStatus,
      isDemoWidget,
      token,
    } = this.props;

    analyticsService({
      uuid: token,
      event: WEIGHT_PAGE_ENTER,
    });

    // for close select drop on landscape view
    if (isMobile) window.addEventListener('resize', closeSelectsOnResize);

    // for set default select value to input after first click
    if (this.$weightEl.current) this.$weightEl.current.addEventListener('click', this.handleChange, { once: true });

    if (weight) {
      this.setState({
        weightValue: units !== 'cm' ? weightLb : Math.round(weight),
      });
    }

    // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
    if (pageReloadStatus && isDemoWidget) {
      const { setPageReloadStatus, flowState } = this.props;

      setPageReloadStatus(false);

      mobileFlowStatusUpdate(this.flow, flowState);
    }

    this.setState({
      units,
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', closeSelectsOnResize);
    window.removeEventListener('unload', this.reloadListener);
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    this.init(nextProps);
  }

  init(props) {
    const { token } = props;

    if (token && !this.api) {
      this.api = new API({
        host: `${API_HOST}/api/v2/`,
        key: token,
      });

      this.api.axios.defaults.headers = {
        Authorization: `UUID ${token}`,
      };
    }
  }

  /**
   * Set Next button disabled state
   */
  checkButtonState() {
    const { weight } = this.props;

    const { buttonDisabled, isWeightValid } = this.state;

    const isButtonDisabled = !weight;

    if (isButtonDisabled !== buttonDisabled && isWeightValid) {
      setTimeout(() => {
        this.setState({
          buttonDisabled: isButtonDisabled,
        });
      }, 100);
    }
  }

  /**
 * Units change handler
 */
  onUnitsChange = (e) => {
    const units = e.target.value;

    this.setState({
      units,
    });
  }

  /**
 * Switch element click handler
 */
  onSwitchClick = () => {
    const {
      setUnits,
      weight,
      weightLb,
      token,
    } = this.props;
    let units;

    this.setState((prevState) => {
      units = (prevState.units === 'cm') ? 'in' : 'cm';

      return {
        units,
      };
    }, () => {
      setUnits(units);

      const minWeight = units === 'cm' ? 30 : 66;
      const maxWeight = units === 'cm' ? 200 : 441;

      this.setState({
        placeholder: units === 'cm' ? 'kg' : 'lb',
        minWeight,
        maxWeight,
      });

      this.weightValues = [...Array(maxWeight + 1).keys()].slice(minWeight);

      if (weight) {
        this.setState({
          weightValue: units !== 'cm' ? weightLb : Math.round(weight),
        });
      }

      analyticsService({
        uuid: token,
        event: units === 'cm'
          ? WEIGHT_PAGE_METRIC_SELECTED
          : WEIGHT_PAGE_IMPERIAL_SELECTED,
      });
    });
  }

  handleClick = (e) => {
    if (e.keyCode === 69) {
      e.returnValue = false;
    }
  };

  /**
   * Set weight from select component
   */
  handleChange = (e) => {
    const { value } = e.target;
    const { setWeight, setWeightLb, units } = this.props;

    if (units !== 'cm') {
      setWeight(getWeightKg(+value));
      setWeightLb(+value);
    } else {
      setWeight(+value);
      setWeightLb(getWeightLb(+value));
    }

    this.setState({
      weightValue: value,
      minWeight: units === 'cm' ? 30 : 66,
      maxWeight: units === 'cm' ? 200 : 441,
    });
  };

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
        setWeightLb(+val);
      } else {
        setWeight(+val);
        setWeightLb(getWeightLb(+val));
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
  };

  toNextScreen = async () => {
    const {
      gender,
      height,
      weight,
      isMobile,
      units,
      email,
      firstName,
      settings,
      token,
      phoneNumber,
    } = this.props;
    const { weightValue } = this.state;

    if (weightValue) {
      analyticsService({
        uuid: token,
        event: WEIGHT_PAGE_WEIGHT_SELECTED,
        data: {
          value: weightValue,
        },
      });
    }

    analyticsService({
      uuid: token,
      event: WEIGHT_PAGE_LEAVE,
    });

    if (isMobile) {
      const { mtmClientId } = this.props;

      this.$nextBtn.current.classList.add('button--blocked');

      await this.flow.update({
        unit: units,
        ...(phoneNumber && { phone: phoneNumber }),
        ...(email && { email }),
        ...(firstName && { firstName }),
        state: {
          status: flowStatuses.SET_METADATA,
          processStatus: '',
          gender,
          height,
          units,
          email,
          settings,
          ...(weight && { weight }),
        },
      });
      await this.api.mtmClient.update(mtmClientId, {
        ...(firstName && { first_name: firstName }),
      })
        .finally(() => {
          this.$nextBtn.current.classList.remove('button--blocked');
        });

      route('/camera-mode-selection', false);
    } else {
      route('/qrcode', false);
    }
  };

  // skipAndNextHandler = () => {
  //  const { setWeight, token } = this.props;

  //  gaOnWeightSkip();

  //  analyticsService({
  //    uuid: token,
  //    event: WEIGHT_PAGE_WEIGHT_SKIP,
  //  });

  //  this.setState(
  //    {
  //      weightValue: null,
  //      skipWeight: true,
  //    },
  //    async () => {
  //      await setWeight(null);

  //      this.toNextScreen();
  //    },
  //  );
  // }

  nextButtonClick = async () => {
    this.toNextScreen();
  };

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
          <Stepper steps="9" current="4" />

          <div className="weight-container__control screen__control">
            <h3 className="screen__label">What’s your weight?</h3>
            <div className="weight-container__input-wrap">
              {isMobile ? (
                <div className="weight-container__input-wrap">
                  <input
                    className="input"
                    type="text"
                    placeholder="Select"
                    value={weightValue}
                    disabled
                  />
                  <select
                    className="select"
                    onChange={this.handleChange}
                    ref={this.$weightEl}
                  >
                    {this.weightValues.map((value) => (
                      <option value={value} selected={value === defaultValue}>
                        {value}
                        {' '}
                        {placeholder}
                      </option>
                    ))}
                  </select>
                  <div className="weight-container__placeholder">
                    {placeholder}
                  </div>
                </div>
              ) : (
                  <div className="weight-container__input-wrap">
                    <input
                      className={classNames('input', {
                        'input--invalid': !isWeightValid && !skipWeight,
                      })}
                      type="number"
                      placeholder="0"
                      onBlur={this.changeWeight}
                      onKeyDown={this.handleClick}
                      value={weightValue}
                    />
                    <div className="weight-container__placeholder">
                      {placeholder}
                    </div>
                    <p
                      className={classNames('screen__control-error', {
                        active: !isWeightValid && !skipWeight,
                      })}
                    >
                      {units === 'cm'
                        ? 'Your weight should be between 30-200 KG'
                        : 'Your weight should be between 66 and 441 LB'}
                    </p>
                  </div>
                )}
            </div>

            <div className={classNames('height__switcher', { 'height__switcher--cm': units === 'cm', 'height__switcher--in': units === 'in' })}>
              <label className={classNames('height__switcher-item', 'height__switcher-item--cm', { checked: units === 'cm' })} htmlFor="measure-cm" tabIndex="-1">
                <input type="radio" name="measure" id="measure-cm" value="cm" onChange={this.onUnitsChange} checked={units === 'cm'} />
                <div className="height__switcher-info">
                  <p>Metric system</p>
                  <p>CM/KG</p>
                </div>
              </label>

              <label className={classNames('height__switcher-item', 'height__switcher-item--in', { checked: units === 'in' })} htmlFor="measure-in" tabIndex="-1">
                <input type="radio" name="measure" id="measure-in" value="in" onChange={this.onUnitsChange} checked={units === 'in'} />
                <div className="height__switcher-info">
                  <p>Imperial system</p>
                  <p>IN/LB</p>
                </div>
              </label>

              <button className="height__switcher-switch" onClick={this.onSwitchClick} type="button">
                <span>
                  {'Change units to '}
                  {(units === 'in') ? 'centimeters' : 'feet and inches'}
                </span>
              </button>
            </div>

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

