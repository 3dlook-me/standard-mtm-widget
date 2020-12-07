import { h } from 'preact';
import classNames from 'classnames';

import './Preloader.scss';

import indicator from '../../images/line.svg';
import spinner from '../../images/loader-for-phone.svg';
import phone from '../../images/phone-for-loader.svg';

import firstStageFemale from '../../images/stage_1_female.svg';
import secondStageFemale from '../../images/stage_2_female.svg';
import thirdStageFemale from '../../images/stage_3_female.svg';

import firstStageMale from '../../images/stage_1_male.svg';
import secondStageMale from '../../images/stage_2_male.svg';
import thirdStageMale from '../../images/stage_3_male.svg';

/**
 * Preloader component
 */
const Preloader = ({
  isActive, status, isMobile, gender,
}) => (
  <div className={`preloader ${isActive ? 'active' : ''}`}>

    <div className={classNames('preloader__instructions',
      { 'preloader__instructions--active': !isMobile && status === '' })}
    >
      <div className="preloader__instructions-phone-wrap">
        <img className="preloader__instructions-phone" src={phone} alt="phone" />
        <img className="preloader__instructions-spinner" src={spinner} alt="spinner" />
      </div>
      <p>
        Follow instructions on
        <b> your mobile phone</b>
        <br />
        to generate your measurements
      </p>
    </div>

    <div className="preloader__title-wrap">
      <h2 className="preloader__title screen__title">
        The magic is happening
      </h2>

      <p className="preloader__status">{status}</p>
    </div>

    <div className="preloader__animation">
      <img
        className="preloader__animation-stage preloader__animation-stage--first"
        src={gender === 'female' ? firstStageFemale : firstStageMale}
        alt="stage-1"
      />
      <img
        className="preloader__animation-stage preloader__animation-stage--second"
        src={gender === 'female' ? secondStageFemale : secondStageMale}
        alt="stage-2"
      />
      <img
        className="preloader__animation-stage preloader__animation-stage--third"
        src={gender === 'female' ? thirdStageFemale : thirdStageMale}
        alt="stage-3"
      />
      <img
        className="preloader__animation-indicator"
        src={indicator}
        alt="line"
      />
    </div>

    {isMobile ? (
      <div className="preloader__warning-block">
        <div className="preloader__warning-icon">×</div>
        <p className="preloader__warning-txt">
          Please
          <b> do not lock your phone, </b>
          we are computing your measurements! &#128522;
        </p>
      </div>
    ) : (
      <p className="preloader__text">
        <span>
          Please give us
          <b> a minute </b>
          to check your photos and generate your measurements. Thanks for your patience!
        </span>
      </p>
    )}
  </div>
);

export default Preloader;
