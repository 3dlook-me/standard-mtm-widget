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
const SoftValidation = ({
  className,
  retake,
  units,
  gender,
  softValidation,
  isDesktop,
  softValidationRetryCounter,
}) => (
    <div className={classNames('soft-validation', className)}>
      <p className="soft-validation__warning">Results may not be accurate for the following reasons</p>

      {/* Loose top */}
      {(softValidation && softValidation.looseTop) ? (
        <SoftValidationItem className="soft-validation__item" image={looseTopImage}>
          <p>Oops! Your top is too loose. Please pop into something form-fitting to capture your body contour</p>
        </SoftValidationItem>
      ) : null}

      {/* Loose bottom */}
      {(softValidation && softValidation.looseBottom) ? (
        <SoftValidationItem className="soft-validation__item" image={looseBottomImage}>
          <p>Oops! Your bottoms are too loose. Please pop  into something form-fitting to capture your body contour</p>
        </SoftValidationItem>
      ) : null}

      {/* Loose top and bottom */}
      {(softValidation && softValidation.looseTopAndBottom) ? (
        <SoftValidationItem className="soft-validation__item" image={looseTopAndBottomImage}>
          <p>Oops! Your clothing is too loose. Please pop into form-fitting clothes to capture your body contour</p>
        </SoftValidationItem>
      ) : null}

      {/* Wide - legs > 15 cm */}
      {/*(softValidation && softValidation.wideLegs) ? (
      <SoftValidationItem className="soft-validation__item" image={wideLegsImage}>
        {(units === 'cm') ? (
          <p>Make sure your feet are 15 cm apart!</p>
        ) : (
          <p>Make sure your feet are 7 inches apart!</p>
        )}
      </SoftValidationItem>
    ) : null */}

      {/* Small distance < 28 cm */}
      {(softValidation && softValidation.smallLegs) ? (
        <SoftValidationItem className="soft-validation__item" image={smallLegsImage}>
          <p>Quick tweak! Separate those feet more for a clear leg outline from crotch to floor!</p>
        </SoftValidationItem>
      ) : null}

      {/* Body_area_percentage less 50 % */}
      {(softValidation && softValidation.bodyPercentage) ? (
        <SoftValidationItem className="soft-validation__item" image={(gender === 'male') ? bodyMaleImage : bodyFemaleImage}>
          <p>Almost perfect! Come a little closer to the camera, making sure your head and toes are fully visible in the frame.</p>
        </SoftValidationItem>
      ) : null}

      {(!isDesktop && softValidationRetryCounter < 5) ? (
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
