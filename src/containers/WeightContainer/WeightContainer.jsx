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
import WheelPicker from '../../components/WheelPicker/WheelPicker';
import { flowStatuses } from '../../configs/flowStatuses';
import { isMobileDevice } from '../../helpers/utils';

import './WeightContainer.scss';

const SELECT_VALUE = WheelPicker.selectValue;

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
      defaultValue: SELECT_VALUE,
      skipWeight: false,
      minWeight,
      maxWeight,
      units,
    };

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);

    this.weightValues = [SELECT_VALUE, ...[...Array(maxWeight + 1).keys()].slice(minWeight)];

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

      this.weightValues = [SELECT_VALUE, ...[...Array(maxWeight + 1).keys()].slice(minWeight)];

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
  handleChange = (value) => {
    const { setWeight, setWeightLb, units } = this.props;

    if (value === SELECT_VALUE) {
      setWeight(null);
      setWeightLb(null);

      this.setState({
        weightValue: null,
        buttonDisabled: true,
        isWeightValid: true,
        minWeight: units === 'cm' ? 30 : 66,
        maxWeight: units === 'cm' ? 200 : 441,
      });

      return;
    }

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
  changeWeight = (value) => {
    const { minWeight, maxWeight } = this.state;
    this.weightValidation(value, minWeight, maxWeight);
  };

  toNextScreen = async () => {
    const {
      gender,
      height,
      weight,
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

    if (isMobileDevice()) {
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

  nextButtonClick = async () => {
    this.toNextScreen();
  };

  render() {
    const { units, weightLb, weight } = this.props;
    const {
      buttonDisabled,
      defaultValue,
    } = this.state;
    const value = (units === 'cm' ? Math.round(weight) : weightLb) || defaultValue;
    return (
      <section className="screen active">
        <div className="screen__content weight-container">
          <Stepper steps="5" current="4" />

          <div className="weight-container__control screen__control">
            <h3 className="screen__label">What’s your weight?</h3>
            <div className="weight-container__input-wrap">
              <div className="picker-wrapper">
                <WheelPicker
                  values={this.weightValues}
                  value={value}
                  onChange={(v) => this.handleChange(v)}
                  unit={units}
                  type='weight'
                />
              </div>
            </div>

            <div className={classNames('height__switcher', { 'height__switcher--cm': units === 'cm', 'height__switcher--in': units === 'in' })}>
              <label className={classNames('height__switcher-item', 'height__switcher-item--cm', { checked: units === 'cm' })} htmlFor="measure-cm" tabIndex="-1">
                <input type="radio" name="measure" id="measure-cm" value="cm" onChange={this.onUnitsChange} checked={units === 'cm'} />
                <div className="height__switcher-info">
                  <p>Metric system</p>
                  <p>KG</p>
                </div>
              </label>

              <label className={classNames('height__switcher-item', 'height__switcher-item--in', { checked: units === 'in' })} htmlFor="measure-in" tabIndex="-1">
                <input type="radio" name="measure" id="measure-in" value="in" onChange={this.onUnitsChange} checked={units === 'in'} />
                <div className="height__switcher-info">
                  <p>Imperial system</p>
                  <p>LB</p>
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
            Continue
          </button>
        </div>
      </section>
    );
  }
}

export default connect((state) => state, actions)(WeightContainer);
