import {
  h,
  Fragment,
} from 'preact';

export default function IntroSelf() {
  return (
    <Fragment>
      <h3 className="screen__label">Your AI Photo Guide</h3>
        <p className="how-to-take-photos__text">
        Before we start, you’ll need to place your phone on a desk-height table
        against a coffee mug – and I’ll guide you from there.
      </p>
    </Fragment>

  );
}
