import {
  h,
  Component,
  createRef,
} from 'preact';
import { connect } from 'react-redux';
import { Link } from 'preact-router';

import actions from '../../store/actions';
import { Stepper } from '../../components';

import './HowToTakePhotos.scss';
import videoTableMode from '../../video/table-flow-example.mp4';
import videoFriendMode from '../../video/video-pf.mp4';
import FlowService from '../../services/flowService';
import { mobileFlowStatusUpdate } from '../../helpers/utils';

/**
 * HowToTakePhotos video page component
 */
class HowToTakePhotos extends Component {
  $video = createRef();

  $videoProgress = createRef();

  componentDidMount =() => {
    const { current } = this.$video;

    current.play();
    current.addEventListener('timeupdate', this.handleProgress);

    const {
      isFromDesktopToMobile,
      pageReloadStatus,
      token,
      flowId,
    } = this.props;

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);

    // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
    if (pageReloadStatus && isFromDesktopToMobile) {
      const { setPageReloadStatus, flowState } = this.props;

      setPageReloadStatus(false);

      mobileFlowStatusUpdate(this.flow, flowState);
    }
  }

  componentWillUnmount = () => {
    this.$video.current.removeEventListener('timeupdate', this.handleProgress);
  }

  handleProgress = () => {
    const { current } = this.$video;
    const percent = (current.currentTime / current.duration) * 100;

    this.$videoProgress.current.style.flexBasis = `${percent}%`;
  }

  restartVideo = () => {
    const { current } = this.$video;

    current.currentTime = 0;
    current.play();
  }

  render() {
    const { isTableFlow } = this.props;
    const videoTrack = isTableFlow ? videoTableMode : videoFriendMode;

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
                ref={this.$video}
                muted
                preload="auto"
                playsInline
              >
                <source src={videoTrack} type="video/mp4" />
              </video>

              <div className="how-to-take-photos__progress-bar">
                <div
                  className="how-to-take-photos__progress"
                  ref={this.$videoProgress}
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

export default connect((state) => state, actions)(HowToTakePhotos);
