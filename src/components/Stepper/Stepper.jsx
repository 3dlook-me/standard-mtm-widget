import { h } from 'preact';

import './Stepper.scss';

/**
 * Stepper component
 */
const Stepper = ({ steps, current }) => (

  <div className="stepper">
    {Array.from({ length: steps }).map((_, index) => {
      const stepNumber = index + 1;
      const isCompleted = stepNumber <= current;

      return (
        <div
          key={index}
          className={`step ${isCompleted ? "completed" : ""}`}
        />
      );
    })}
  </div>
);

export default Stepper;
