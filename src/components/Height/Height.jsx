import { h, Component } from 'preact';
import classNames from 'classnames';
import { cmToFtIn, getHeightCm } from '../../helpers/utils';
import './Height.scss';

/**
 * Height component
 */
export default class Height extends Component {
  constructor(props) {
    super(props);

    this.state = {
      units: 'cm',
      cm: null,
      ft: null,
      inches: null,
    };
  }

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
    const { changeUnits } = this.props;
    let units;

    this.setState((prevState) => {
      units = (prevState.units === 'cm') ? 'in' : 'cm';

      return {
        units,
      };
    }, () => changeUnits(units));
  }

  /**
   * Cm change handler
   */
  onCmInputChange = (e) => {
    const { change } = this.props;

    // get height in cm
    const { value } = e.target;

    // get ft and in
    const ftIn = cmToFtIn(value);

    this.setState({
      cm: value,
      ft: ftIn.ft,
      inches: ftIn.in,
    }, () => {
      const { cm } = this.state;
      change(cm);
    });
  }

  /**
   * Ft change handler
   */
  onFtInputChange = (e) => {
    const { change } = this.props;
    const { inches } = this.state;

    // get ft
    const { value } = e.target;

    // convert value to cm
    let centimeters = getHeightCm(value, inches || 0);
    centimeters = centimeters.toFixed(0);

    this.setState({
      cm: centimeters,
      ft: value,
      inches: inches || 0,
    }, () => {
      const { cm } = this.state;
      change(cm);
    });
  }

  /**
   * Inches change handler
   */
  onInInputChange = (e) => {
    const { change } = this.props;
    const { ft } = this.state;

    // get inches
    const { value } = e.target;

    // convert value to cm
    let centimeters = getHeightCm(ft || 0, value);
    centimeters = centimeters.toFixed(0);

    this.setState({
      cm: centimeters,
      ft: ft || 0,
      inches: value,
    }, () => {
      const { cm } = this.state;
      change(cm);
    });
  }

  /**
   * Validate cm value
   */
  validateCm = (e) => {
    const { value } = e.target;
    // TODO: create regexp to validate numbers
    // value = value.replace(/^(?![1-2]|[1-2][0-9]|1[5-9][0-9]|2[0-1][0-9]|2[1-2]0)$/g, '');

    e.target.value = value;
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
      inches,
    } = this.state;

    return (
      <div className={classNames(className, 'height', { 'height--invalid': !isValid })} data-measure={units}>
        <div className="height__measure height__measure--cm">
          <div className="height__input-block" data-measure="cm">
            <input
              className="input"
              type="number"
              value={cm}
              onChange={this.onCmInputChange}
              placeholder="0"
            />
            <p className="height__input-placeholder">CM</p>
          </div>
        </div>

        <div className="height__measure height__measure--in">
          <div className="height__input-block" data-measure="ft">
            <input
              className="input"
              type="number"
              value={ft}
              onChange={this.onFtInputChange}
              placeholder="0"
            />
            <p className="height__input-placeholder">FT</p>
          </div>
          <div className="height__input-block" data-measure="in">
            <input
              className="input"
              type="number"
              value={inches}
              onChange={this.onInInputChange}
              placeholder="0"
            />
            <p className="height__input-placeholder">IN</p>
          </div>
        </div>

        <p className={classNames('screen__control-error', 'height__desc', { active: !isValid })}>
          {(units === 'cm' && !isValid) ? 'Your height should be between 150-220 cm' : null}
          {(units === 'in' && !isValid) ? 'Your height should be between 4’11” and 7’2”' : null}
        </p>

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
              { 'Change units to ' }
              {(units === 'in') ? 'centimeters' : 'feets and inches'}
            </span>
          </button>
        </div>
      </div>
    );
  }
}
