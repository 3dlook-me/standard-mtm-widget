import { h } from 'preact';

import './Stepper.scss';

/**
 * Stepper component
 */
const Stepper = ({ steps, current }) => (
  <div className="stepper">
    <span className="visually-hidden">
      {'Current step #'}
      {current}
      {' of '}
      {steps}
    </span>
    <div className="stepper__progress" style={{ width: 200 / steps * current }} />
  </div>
);

export default Stepper;
