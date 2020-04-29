import { Component, h } from 'preact';
import { cm2in } from '../../helpers/utils';
import './Measurements.scss';
import { VOLUMETRIC_PARAMS, LINEAR_PARAMS } from '../../helpers/bodyParametersInfo';

import { Loader } from '..';

/*
 * Measurements component
 */

class Measurements extends Component {
  constructor() {
    super();

    this.state = {
      measurementsLoading: true,
    };
  }

  componentDidMount() {
    const { measurements } = this.props;

    if (measurements.id) {
      this.setState({
        measurementsLoading: false,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { measurements } = nextProps;

    if (measurements.id) {
      this.setState({
        measurementsLoading: false,
      });
    }
  }

  handleClick = (e) => {
    const { openGuide, helpBtnToggle } = this.props;
    const { target } = e;

    if (target.type === 'button') {
      helpBtnToggle(false);
      openGuide(target.dataset.key, target.dataset.measurement);
    }
  }

  getMeasurements = (e) => {
    const { measurements, units } = this.props;
    const { paramName } = e;
    const measurementsParamName = measurements[e.paramGroup][paramName];

    if (units === 'in' && paramName !== 'shoulder_slope') {
      return `${cm2in(measurementsParamName).toFixed(1)}"`;
    }

    return `${measurementsParamName} ${paramName === 'shoulder_slope' ? '°' : 'cm'}`;
  }

  render() {
    const { measurementsLoading } = this.state;
    const { measurements } = this.props;
    const groups = ['Volumetric measurements', 'Linear measurements'];
    const parameters = [VOLUMETRIC_PARAMS, LINEAR_PARAMS];

    return (
      <div className="measurements__wrapper">

        {measurementsLoading ? (
          <Loader />
        ) : null}

        <div className="measurements">

          {groups.map((group, i) => (
            <div className="measurements__list-wrapper">
              <h4 className="measurements__title">{group}</h4>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
              <ul className="measurements__list" onClick={this.handleClick}>

                {parameters[i].map((e, index) => (
                  measurements[e.paramGroup] && measurements[e.paramGroup][e.paramName] ? (
                    <li className="measurements__measurement">
                      <button
                        className="measurements__measurement-label"
                        data-key={index}
                        data-measurement={e.paramGroup}
                        type="button"
                      >
                        {e.name}
                      </button>
                      <span className="measurements__measurement-value">
                        {this.getMeasurements(e)}
                      </span>
                    </li>
                  ) : null))}

              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Measurements;
