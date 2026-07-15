import {
  h,
  Fragment,
} from 'preact';

import backgroundRequirements from '../../../images/background_requirements.png';
import backgroundRequirementsMen from '../../../images/background_requirements_men.png';

const backgroundRequirementsByGender = {
  female: backgroundRequirements,
  male: backgroundRequirementsMen,
};

export default function BackgroundRequirements({ gender } = {}) {
  const image = backgroundRequirementsByGender[gender] || backgroundRequirements;

  return (
    <Fragment>
      <h3 className="screen__label">How to take photos</h3>
      <div className="photo-requirements">
        <img
          className="photo-requirements__image"
          src={image}
          alt=""
        />
        <p className="photo-requirements__text">
          The background should <strong>not be cluttered</strong> - choose a clean background.
        </p>
      </div>
    </Fragment>
  );
}
