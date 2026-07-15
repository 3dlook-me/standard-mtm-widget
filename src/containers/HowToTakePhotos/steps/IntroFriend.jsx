import {
  h,
  Fragment,
} from 'preact';

export default function IntroFriend() {
  return (
    <Fragment>
      <h3 className="screen__label">Your AI Photo Guide</h3>
      <p className="how-to-take-photos__text">
        Before we start, you’ll need to take 3-4 steps backwards and hold your phone at a 90° angle - and I’ll guide you from there.
      </p>
    </Fragment>
  );
}
