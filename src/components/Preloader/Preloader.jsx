import { h } from 'preact';
import './Preloader.scss';

import bgImage from '../../images/preloader-bg.svg';
import dotsImage from '../../images/preloader-dots.svg';
import strokeImage from '../../images/preloader-stroke.svg';

/**
 * Preloader component
 */
const Preloader = ({ isActive, status, isMobile }) => (
  <div className={`preloader ${isActive ? 'active' : ''}`}>
    <div className="preloader__title-wrap">
      <h2 className="preloader__title screen__title">
        The magic is happening
      </h2>

      {isMobile ? (
        <p className="preloader__warning-txt">Please, do not lock your phone until we calculate your measurements</p>
      ) : null}
    </div>

    <div className="preloader__anim">
      <img className="preloader__dots" src={dotsImage} alt="dots" />
      <img className="preloader__bg" src={bgImage} alt="background" />
      <img className="preloader__stroke" src={strokeImage} alt="stroke" />
    </div>

    <p className="preloader__text">
      {isMobile ? `${status}` : (
        <span>
          It might take us up to
          <b> one minute </b>
          to find your perfect fit. Thanks for being patient!
        </span>
      )}
    </p>
  </div>
);

export default Preloader;
