import { h, Component, createRef } from 'preact';
import { Link } from 'preact-router';

import { Stepper } from '..';

import './HowToTakePhotos.scss';
import video from '../../video/table-flow-example.mp4';

/**
 * HowToTakePhotos video page component
 */
export default class HowToTakePhotos {
  video = createRef();

  videoProgress = createRef();

  componentDidMount =() => {
    const { current } = this.video;

    current.play();
    current.addEventListener('timeupdate', this.handleProgress);
  }

  componentWillUnmount = () => {
    this.video.current.removeEventListener('timeupdate', this.handleProgress);
  }

  handleProgress = () => {
    const { current } = this.video;
    const percent = (current.currentTime / current.duration) * 100;

    this.videoProgress.current.style.flexBasis = `${percent}%`;
  }

  restartVideo = () => {
    const { current } = this.video;

    current.currentTime = 0;
    current.play();
  }

  render() {
    return (
      <div className="screen active">
        <div className="screen__content how-to-take-photos">
          <Stepper steps="5" current="2" />

          <div className="how-to-take-photos__content">
            <h3 className="screen__title">how to take photos</h3>

            <div className="how-to-take-photos__video-wrap">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                className="how-to-take-photos__video"
                ref={this.video}
                muted
                preload="auto"
                playsInline
              >
                <source src={video} type="video/mp4" />
              </video>

              <div className="how-to-take-photos__progress-bar">
                <div
                  className="how-to-take-photos__progress"
                  ref={this.videoProgress}
                />
              </div>
            </div>
            <div className="how-to-take-photos__btn-wrap">
              <p>Take 3 - 4 steps backwards</p>
              <button
                className="how-to-take-photos__btn"
                onClick={this.restartVideo}
                type="button"
              >
                <i>&#8635;</i>
                <span>Replay</span>
              </button>
            </div>
          </div>
        </div>

        <div className="screen__footer">
          <Link className="button" href="/upload">Next</Link>
        </div>
      </div>
    );
  }
}
