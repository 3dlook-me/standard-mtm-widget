import { h, Component } from 'preact';

import './PrivacyBanner.scss';

/**
 * Privacy banner component
 */
export default function PrivacyBanner() {
  return (
    <div className="privacy-banner">
      <figure className="privacy-banner__icon">
        <svg width="24px" height="28px" viewBox="0 0 24 28" version="1.1">
          <title>privacy</title>
          <desc>Created with Sketch.</desc>
          <g id="Mobile" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g id="[M]-Step-6_1" transform="translate(-46.000000, -132.000000)" fill="#396EC5">
              <g id="Group" transform="translate(30.000000, 120.000000)">
                <g id="security-on" transform="translate(16.000000, 12.000000)">
                  <path
                    d="M23.1972759,4.37435632 C18.4198966,4.37435632 14.7599425,3.00943678 11.6650575,0 C8.57049425,3.00943678 4.91070115,4.37435632 0.133724138,4.37435632 C0.133724138,12.2115402 -1.48794253,23.4382529 11.664977,27.9976667 C24.8188621,23.4383333 23.1972759,12.2116207 23.1972759,4.37435632 Z M10.7097586,18.1656437 L6.86788506,14.3232069 L8.58803448,12.6031379 L10.7097586,14.7253448 L14.7424828,10.6925402 L16.4625517,12.4126092 L10.7097586,18.1656437 Z"
                    id="privacy"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </figure>
      <p className="privacy-banner__txt">
        Your privacy is at the center of what we do. Photos
        <b> will be deleted immediately </b>
        after the processing!
      </p>
    </div>
  );
}
