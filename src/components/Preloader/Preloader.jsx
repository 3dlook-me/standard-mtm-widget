import { h } from 'preact';
import classNames from 'classnames';

import './Preloader.scss';
import {
  LottieLoader
} from '../../components';

import spinner from '../../images/loader-for-phone.svg';
import phone from '../../images/phone-for-loader.svg';


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
    <p>Follow instructions on
       <b> your mobile phone</b>
       <br />
       to generate your measurements
      </p>
   </div>


      {isActive ?
        <div className="preloader__body">
          <LottieLoader isMobile={isMobile} />

          <div className="preloader__title-wrap">
            {status ?
              <div className="preloader__status">
                Status
                <span key={status}>{status}</span>
              </div>
              : null }
            <h2 className="preloader__title screen__title">Please stay on this screen — <br />AI magic in progress.</h2>
            {isMobile ? (
              <p>We’re processing your scan. It’ll be done in under a minute.</p>
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
        </div>
        : null }
  </div>
);

export default Preloader;
