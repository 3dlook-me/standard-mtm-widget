import { h } from 'preact';
import './Preloader.scss';

import preloaderImage from '../../images/preloader.svg';

/**
 * Preloader component
 */
const Preloader = ({ isActive }) => (
  <div className={`preloader ${isActive ? 'active' : ''}`}>
    <h2 className="preloader__title screen__title">
      The magic is happening
    </h2>
    <img className="preloader__image" src={preloaderImage} alt="Preloader animation" />
    <p className="preloader__text">
      {'It might take us up to '}
      <b>one minute</b>
      {' to find your '}
      <br />
      perfect fit. Thanks for being patient!
    </p>
  </div>
);

export default Preloader;
