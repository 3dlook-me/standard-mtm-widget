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
import videoFriendMode from '../../video/friend-flow-example.mp4';
import FlowService from '../../services/flowService';
import { mobileFlowStatusUpdate } from '../../helpers/utils';

/**
 * HowToTakePhotos video page component
 */
class HowToTakePhotos extends Component {
  $video = createRef();

  $videoProgress = createRef();

  constructor(props) {
    super(props);

    this.state = {
      videoText: props.isTableFlow ? 'Place your phone on a table' : 'Take front and side photos',
    };

    const { setPageReloadStatus } = props;

    this.reloadListener = () => {
      setPageReloadStatus(true);
    };

    window.addEventListener('unload', this.reloadListener);
  }

  componentWillUnmount() {
    window.removeEventListener('unload', this.reloadListener);
  }

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
    const { isTableFlow } = this.props;
    const percent = (current.currentTime / current.duration) * 100;

    if (isTableFlow) {
      this.setTableFlowVideoText(current.currentTime);
    }

    this.$videoProgress.current.style.flexBasis = `${percent}%`;
  }

  restartVideo = () => {
    const { current } = this.$video;

    current.currentTime = 0;
    current.play();
  }

  setTableFlowVideoText = (time) => {
    if (time < 3.4) {
      this.setState({
        videoText: 'Place your phone on a table',
      });
    } else if (time > 3.4 && time < 5.3) {
      this.setState({
        videoText: 'Take 3 - 4 steps backwards',
      });
    } else if (time > 5.3) {
      this.setState({
        videoText: 'Follow audio instructions',
      });
    }
  }

  setFriendFlowVideoText = (time) => {
    if (time < 3) {
      this.setState({
        videoText: 'friend flow 1',
      });
    } else if (time > 3 && time < 5) {
      this.setState({
        videoText: 'friend flow 2',
      });
    } else if (time > 5) {
      this.setState({
        videoText: 'friend flow 3',
      });
    }
  }

  render() {
    const { isTableFlow } = this.props;
    const { videoText } = this.state;
    const videoTrack = isTableFlow ? videoTableMode : videoFriendMode;

    return (
      <div className="screen active">
        <div className="screen__content how-to-take-photos">
          <Stepper steps="9" current="6" />

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
                autoPlay
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
              <p>{videoText}</p>
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
