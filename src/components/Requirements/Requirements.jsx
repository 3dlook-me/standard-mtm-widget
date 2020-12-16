import {
  h,
  Component,
  createRef,
  Fragment,
} from 'preact';

import { Loader } from '../Loader';
import analyticsService, {
  FRONT_PHOTO_PAGE_EXAMPLE_OPEN,
  SIDE_PHOTO_PAGE_EXAMPLE_OPEN,
} from '../../services/analyticsService';

import './Requirements.scss';

/**
 * Requirements component
 */
class Requirements extends Component {
  $videoTF = createRef();

  constructor(props) {
    super(props);

    this.state = {
      isVideoLoaded: false,
      isImageExampleLoaded: false,
    };
  }

  componentDidMount() {
    const { isTableFlow, token } = this.props;
    const { current } = this.$videoTF;

    if (current) current.play();

    if (isTableFlow) {
      analyticsService({
        uuid: token,
        event: FRONT_PHOTO_PAGE_EXAMPLE_OPEN,
      });

      analyticsService({
        uuid: token,
        event: SIDE_PHOTO_PAGE_EXAMPLE_OPEN,
      });
    }
  }

  onImgExampleLoaded = () => {
    this.setState({ isImageExampleLoaded: true });
  }

  onVideoLoad = () => {
    this.setState({ isVideoLoaded: true });
  }

  render() {
    const { isImageExampleLoaded, isVideoLoaded } = this.state;
    const { isTableFlow, photoBg, video } = this.props;

    return (
      <Fragment>
        {isTableFlow ? (
          // <Tabs activeTab={activeTab} />
          <div className="requirements__video-wrap">
            {!isVideoLoaded ? <Loader /> : null}

            <video
              className="requirements__video"
              ref={this.$videoTF}
              muted
              preload="auto"
              playsInline
              autoPlay
              onPlay={this.onVideoLoad}
              width="960"
              height="540"
            >
              <source src={video} type="video/mp4" />
            </video>
          </div>
        ) : (
          <div
            className="requirements__image-example"
            style={photoBg ? { backgroundImage: `url(${photoBg})` } : null}
          >
            {!isImageExampleLoaded ? (
              <Fragment>
                <Loader />

                <img
                  className="requirements__image-example-onload-detect"
                  src={photoBg}
                  onLoad={this.onImgExampleLoaded}
                  alt="back"
                />
              </Fragment>
            ) : null}
          </div>
        )}
      </Fragment>
    );
  }
}

export default Requirements;
