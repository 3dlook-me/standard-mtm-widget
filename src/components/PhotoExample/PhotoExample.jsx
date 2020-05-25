import {
  h,
  Component,
  Fragment,
} from 'preact';

import { Loader } from '..';

import './PhotoExample.scss';
import frontPhoto from '../../images/example-front-large.png';
import sidePhoto from '../../images/example-side-large.png';

class PhotoExample extends Component {
  constructor() {
    super();

    this.state = {
      isImageLoaded: false,
    };
  }

  onImageLoad = () => {
    this.setState({
      isImageLoaded: true,
    });
  }

  closeExample = () => {
    const { closePhotoExample } = this.props;

    closePhotoExample();
  }

  render() {
    const { isImageLoaded } = this.state;
    const { photoType } = this.props;
    const photo = photoType === 'front' ? frontPhoto : sidePhoto;

    return (
      <div className="photo-example">
        <div className="photo-example__container">
          <h2 className="photo-example__title">
            {`${photoType} photo example`}
          </h2>

          <div
            className={`photo-example__img photo-example__img--${photoType}`}
            style={{ backgroundImage: `url(${photo})` }}
          >
            {!isImageLoaded ? (
              <Fragment>
                <Loader />

                <img className="photo-example__img-onload-detect" src={photo} onLoad={this.onImageLoad} alt="example" />
              </Fragment>
            ) : null}
          </div>
        </div>


        <div className="screen__footer">
          <button className="button" type="button" onClick={this.closeExample}>
            back
          </button>
        </div>
      </div>
    );
  }
}

export default PhotoExample;
