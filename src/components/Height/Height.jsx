import {
  h,
  Component,
  createRef,
} from 'preact';
import classNames from 'classnames';

import {
  cmToFtIn,
  getHeightCm,
  closeSelectsOnResize,
} from '../../helpers/utils';
import analyticsService, {
  HEIGHT_PAGE_METRIC_SELECTED,
  HEIGHT_PAGE_IMPERIAL_SELECTED,
} from '../../services/analyticsService';

import './Height.scss';
import WheelPicker from '../WheelPicker/WheelPicker';

const SELECT_VALUE = WheelPicker.selectValue;

/**
 * Height component
 */
export default class Height extends Component {

  constructor(props) {
    super(props);

    this.minHeightCm = 150;
    this.maxHeightCm = 220;

    this.state = {
      units: 'in',
      cm: null,
      ft: null,
      in: null,
    };

    const {
      height,
      units,
    } = this.props;

    const generateFtInValues = () => {
      const result = [];

      for (let i = 4; i <= 7; i++) {
        if (i === 4) {
          result.push({ ft: i, in: 11 });
        }

        if (i === 5 || i === 6) {
          for (let a = 0; a <= 11; a++) {
            result.push({ ft: i, in: a });
          }
        }

        if (i === 7) {
          for (let b = 0; b <= 2; b++) {
            result.push({ ft: i, in: b });
          }
        }
      }

      return result;
    };

    this.heightCmValues = [SELECT_VALUE, ...[...Array(this.maxHeightCm + 1).keys()].slice(this.minHeightCm)];
    this.heightFtInValues = [SELECT_VALUE, ...generateFtInValues()];

    if (height && (height >= this.minHeightCm && height <= this.maxHeightCm)) {
      const ftIn = cmToFtIn(height);

      this.setState({
        units,
        cm: height || null,
        ft: ftIn.ft || null,
        in: this.setInches(ftIn),
      });

      return;
    }

    this.setState({
      units,
    });


  }

  /**
   * Add event
   */
  componentDidMount() {

  }

  componentWillUnmount() {
    window.removeEventListener('resize', closeSelectsOnResize);
  }

  setInches = (data) => {
    if (data.ft === 7 && data.in === 3) {
      return 2;
    }

    return data.in;
  };

  /**
   * Units change handler
   */
  onUnitsChange = (e) => {
    const { changeUnits } = this.props;
    const units = e.target.value;

    this.setState({
      units,
    }, () => changeUnits(units));
  }

  /**
   * Switch element click handler
   */
  onSwitchClick = () => {
    const { changeUnits, token } = this.props;
    let units;

    this.setState((prevState) => {
      units = (prevState.units === 'cm') ? 'in' : 'cm';

      return {
        units,
      };
    }, () => {
      changeUnits(units);
      analyticsService({
        uuid: token,
        event: units === 'cm'
          ? HEIGHT_PAGE_METRIC_SELECTED
          : HEIGHT_PAGE_IMPERIAL_SELECTED,
      });
    });
  }

  /**
   * Cm change handler
   */
  onCmInputChange = (value) => {
    const { change } = this.props;

    if (value === SELECT_VALUE) {
      this.setState({
        cm: null,
        ft: null,
        in: null,
      }, () => change(null));

      return;
    }

    // get ft and in
    const ftIn = cmToFtIn(value);

    this.setState({
      cm: value || null,
      ft: ftIn.ft || null,
      in: this.setInches(ftIn),
    }, () => {
      const { cm } = this.state;
      change(cm);
    });
  }

  /**
   * Ft change handler
   */
  onFtInputChange = (value) => {
    const { change } = this.props;

    if (value === SELECT_VALUE) {
      this.setState({
        cm: null,
        ft: null,
        in: null,
      }, () => change(null));

      return;
    }

    // convert value to cm
    let centimeters = getHeightCm(value.ft, value.in || 0);

    centimeters = Math.round(centimeters);

    this.setState({
      cm: centimeters || 0,
      ft: value.ft || 0,
      in: value.in || 0,
    }, () => {
      const { cm } = this.state;
      change(cm);
    });
  }

  render() {
    const {
      className,
      isValid,
    } = this.props;

    const {
      units,
      cm,
      ft,
    } = this.state;

    const value = units === "cm"
      ? (cm ?? SELECT_VALUE)
      : ft === null
        ? SELECT_VALUE
        : {
        ft: ft ?? 5,
        in: this.state.in ?? 5
      };

    return (
      <div>
        <div className="picker-wrapper">
          <WheelPicker
            values={units === 'cm' ? this.heightCmValues : this.heightFtInValues}
            value={value}
            onChange={(v) => units === 'cm' ? this.onCmInputChange(v) : this.onFtInputChange(v)}
            unit={units}
            type='height'
          />
        </div>
        <div className={classNames(className, 'height', { 'height--invalid': !isValid })} data-measure={units}>
          <div className={classNames('height__switcher', { 'height__switcher--cm': units === 'cm', 'height__switcher--in': units === 'in' })}>
            <label className={classNames('height__switcher-item', 'height__switcher-item--cm', { checked: units === 'cm' })} htmlFor="measure-cm" tabIndex="-1">
              <input type="radio" name="measure" id="measure-cm" value="cm" onChange={this.onUnitsChange} checked={units === 'cm'} />
              <div className="height__switcher-info">
                <p>Metric system</p>
                <p>CM</p>
              </div>
            </label>

            <label className={classNames('height__switcher-item', 'height__switcher-item--in', { checked: units === 'in' })} htmlFor="measure-in" tabIndex="-1">
              <input type="radio" name="measure" id="measure-in" value="in" onChange={this.onUnitsChange} checked={units === 'in'} />
              <div className="height__switcher-info">
                <p>Imperial system</p>
                <p>IN</p>
              </div>
            </label>

            <button className="height__switcher-switch" onClick={this.onSwitchClick} type="button">
              <span>
                {'Change units to '}
                {(units === 'in') ? 'centimeters' : 'feets and inches'}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
