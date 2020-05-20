import { h, Component } from 'preact';
import { Link } from 'preact-router';

import { Stepper } from '..';

import './HowToTakePhotos.scss';

/**
 * HowToTakePhotos video page component
 */
export default function HowToTakePhotos() {
  return (
    <div className="screen active">
      <div className="screen__content how-to-take-photos">
        <Stepper steps="5" current="2" />

        <div className="hello">
          <h3 className="screen__title">how to take photos</h3>

        </div>

      </div>

      <div className="screen__footer">
        <Link className="button" href="/upload">Got it</Link>
      </div>
    </div>
  );
}
