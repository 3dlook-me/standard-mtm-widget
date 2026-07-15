import {
  h,
  Fragment,
} from 'preact';

import lightingRequirements from '../../../images/lighting_requirements.png';
import lightingRequirementsMen from '../../../images/lighting_requirements_men.png';

const lightingRequirementsByGender = {
  female: lightingRequirements,
  male: lightingRequirementsMen,
};

export default function LightingRequirements({ gender } = {}) {
  const image = lightingRequirementsByGender[gender] || lightingRequirements;

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
          Make sure you are in a well lit room.
        </p>
      </div>
    </Fragment>
  );
}
