import { h, Component } from 'preact';

import './PrivacyBanner.scss';
import icon from '../../images/icon_shield.svg';

/**
 * Privacy banner component
 */
export default function PrivacyBanner() {
  return (
    <div className="privacy-banner">
      <img
        className="privacy-banner__icon"
        src={icon}
        alt="icon_shield"
      />
      <p className="privacy-banner__txt">
        Your privacy is at the center of what we do. Your photos will be deleted immediately after they are processed!
      </p>
    </div>
  );
}
