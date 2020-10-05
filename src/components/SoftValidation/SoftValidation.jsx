import { h } from 'preact';
import classNames from 'classnames';

import { SoftValidationItem } from '../index';

import retakeIcon from '../../images/ic_retake.svg';
import looseTopImage from '../../images/imgs_sv/img_9.svg';
import looseBottomImage from '../../images/imgs_sv/img_10.svg';
import looseTopAndBottomImage from '../../images/imgs_sv/img_11.svg';
import wideLegsImage from '../../images/imgs_sv/img_1.svg';
import smallLegsImage from '../../images/imgs_sv/img_2.svg';
import bodyMaleImage from '../../images/imgs_sv/img_3_m.svg';
import bodyFemaleImage from '../../images/imgs_sv/img_3_f.svg';

import './SoftValidation.scss';

/**
 * Soft validation object:
 *
 * softValidation = {
 *    looseTop: true,
 *    looseBottom: true,
 *    looseTopAndBottom: true,
 *    wideLegs: true,
 *    smallLegs: true,
 *    bodyPercentage: true,
 *  };
 */

/**
 * SoftValidation component
 */
const SoftValidation = ({ className, retake, units, gender, softValidation, isDesktop }) => (
  <div className={classNames('soft-validation', className)}>
    <p className="soft-validation__warning">Results may not be accurate for the following reasons</p>

    {/* Loose top */}
    {(softValidation && softValidation.looseTop) ? (
      <SoftValidationItem className="soft-validation__item" image={looseTopImage}>
        <p>Your top is a bit loose. Please change into something more form-fitting so we can see your body contour</p>
      </SoftValidationItem>
    ) : null }

    {/* Loose bottom */}
    {(softValidation && softValidation.looseBottom) ? (
      <SoftValidationItem className="soft-validation__item" image={looseBottomImage}>
        <p>Your pants are loose. Please change into something more form-fitting so we can see your body contour</p>
      </SoftValidationItem>
    ) : null }

    {/* Loose top and bottom */}
    {(softValidation && softValidation.looseTopAndBottom) ? (
      <SoftValidationItem className="soft-validation__item" image={looseTopAndBottomImage}>
        <p>Please change into more form-fitting clothes so we can see your body contour</p>
      </SoftValidationItem>
    ) : null }

    {/* Wide - legs > 15 cm */}
    {(softValidation && softValidation.wideLegs) ? (
      <SoftValidationItem className="soft-validation__item" image={wideLegsImage}>
        {(units === 'cm') ? (
          <p>Make sure your feet are 15 cm apart!</p>
        ) : (
          <p>Make sure your feet are 7 inches apart!</p>
        )}
      </SoftValidationItem>
    ) : null }

    {/* Small distance < 2 cm */}
    {(softValidation && softValidation.smallLegs) ? (
      <SoftValidationItem className="soft-validation__item" image={smallLegsImage}>
        {(units === 'cm') ? (
          <p>Make sure your feet are 15 cm apart!</p>
        ) : (
          <p>Make sure your feet are 7 inches apart!!</p>
        )}
      </SoftValidationItem>
    ) : null }

    {/* Body_area_percentage less 50 % */}
    {(softValidation && softValidation.bodyPercentage) ? (
      <SoftValidationItem className="soft-validation__item" image={(gender === 'male') ? bodyMaleImage : bodyFemaleImage}>
        <p>Don&apos;t be shy, come a little closer to the camera</p>
      </SoftValidationItem>
    ) : null }

    {(!isDesktop) ? (
      <button className="button soft-validation__btn" type="button" onClick={() => retake()}>
        <img src={retakeIcon} alt="" />
        <span>
          {'Retake '}
          {(softValidation.looseTop || softValidation.looseBottom || softValidation.looseTopAndBottom) ? 'both photos' : 'front photo'}
        </span>
      </button>
    ) : (
      null
    )}

    <div className="soft-validation__decor" />
  </div>
);

export default SoftValidation;
