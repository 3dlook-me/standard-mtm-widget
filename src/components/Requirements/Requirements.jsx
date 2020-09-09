import {
  h,
  Component,
  createRef,
  Fragment,
} from 'preact';

import { Loader } from '../Loader';

import './Requirements.scss';
import videoTableFlowRequirements from '../../video/table-flow-requirements.mp4';

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
    const { current } = this.$videoTF;

    if (current) current.play();
  }

  onImgExampleLoaded = () => {
    this.setState({ isImageExampleLoaded: true });
  }

  onVideoLoad = () => {
    this.setState({ isVideoLoaded: true });
  }

  render() {
    const { isImageExampleLoaded, isVideoLoaded } = this.state;
    const { isTableFlow, photoBg } = this.props;

    return (
      <Fragment>
        {isTableFlow ? (
          // <Tabs activeTab={activeTab} />
          <div className="requirements__video-wrap">
            {!isVideoLoaded ? (
              <Loader />
            ) : null}

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
              <source src={videoTableFlowRequirements} type="video/mp4" />
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
