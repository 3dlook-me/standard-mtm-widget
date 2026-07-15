import {
  h,
  Fragment,
} from 'preact';

import iconShield from '../../../images/icon_shield.svg';
import selfFlow from '../../../images/self_flow.png';
import selfFlowMen from '../../../images/self_flow_men.png';
import withFriend from '../../../images/with_friend.png';
import withFriendMen from '../../../images/friend_mode_men.png';

const beforeStartImages = {
  female: {
    self: selfFlow,
    friend: withFriend,
  },
  male: {
    self: selfFlowMen,
    friend: withFriendMen,
  },
};

export default function BeforeStart({ gender, isTableFlow, useRtpvCamera }) {
  const title = useRtpvCamera ? 'Your AI Photo Guide' : 'How to take photos';
  const images = beforeStartImages[gender] || beforeStartImages.female;
  const image = isTableFlow ? images.self : images.friend;
  const rtpvText = isTableFlow
    ? 'Before we start, you’ll need to place your phone on a desk-height table against a coffee mug - and I’ll guide you from there.'
    : 'Before we start, you’ll need to take 3-4 steps backwards and hold your phone at a 90° angle - and I’ll guide you from there.';
  const checklist = isTableFlow
    ? [
      'Place your phone at 90° angle.',
      'Raise volume to hear instructions.',
      'Take 3-4 steps backward.',
    ]
    : [
      'Hold your phone at a 90° angle.',
      'Take 3-4 steps backward.',
    ];

  return (
    <Fragment>
      <h3 className="screen__label">{title}</h3>
      <div className="before-start">
        <div className="before-start__privacy">
          <img
            className="before-start__privacy-icon"
            src={iconShield}
            alt=""
          />
          <p className="before-start__privacy-text">
            Your privacy is at the center of what we do.
            Your photos will be deleted immediately after they are processed!
          </p>
        </div>
        <img
          className="before-start__image"
          src={image}
          alt=""
        />
        {useRtpvCamera ? (
          <p className="before-start__text">{rtpvText}</p>
        ) : (
          <ul className="before-start__list">
            {checklist.map((item) => (
              <li className="before-start__item" key={item}>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Fragment>
  );
}
