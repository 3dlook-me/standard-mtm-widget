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
        <div>
          <LottieLoader isMobile={isMobile} />

          <div className="preloader__title-wrap">
            <h2 className="preloader__title screen__title">Don't miss the magic - stay on!</h2>
            {isMobile ? (
              <p>AI magic is at work, so stay on the page for your
              best fit. It takes less than a minute</p>
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
        : null}
    </div>
  );

export default Preloader;
