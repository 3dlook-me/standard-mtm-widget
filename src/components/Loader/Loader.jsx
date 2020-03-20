import { h } from 'preact';
import './Loader.scss';
import loaderImg from '../../images/preloader.svg';

const Loader = () => (
  <div className="loader">
    <img src={loaderImg} alt="loader" />
  </div>
);

export default Loader;
