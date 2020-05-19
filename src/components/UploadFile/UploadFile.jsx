/* eslint class-methods-use-this: off */
import { h, Component } from 'preact';
import classNames from 'classnames';

import { getOrientation, fixOrientation } from '../../helpers/utils';
import { Loader } from '..';

import './UploadFile.scss';
import frontPhoto from '../../images/fornt_photo.png';
import sidePhoto from '../../images/side_photo.png';

const environment = process.env.NODE_ENV;

/**
 * Upload file component
 */
export default class UploadFile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      file: null,
      value: null,
      isImageLoaded: false,
      isButtonDisabled: true,
    };
  }

  componentDidMount() {
    const {
      value,
      change,
      photosFromGallery,
    } = this.props;

    this.isButtonDisabled(photosFromGallery);

    if (value) {
      this.setState({
        file: value,
      }, () => change(value));
    }
  }

  /**
   * Stop loader on image load
   */
  onImageLoad = () => {
    this.setState({
      isImageLoaded: true,
    });
  }

  /**
   * Change file input handler
   *
   * @async
   */
  onChange = async (e) => {
    const file = e.target.files[0];
    await this.saveFile(file);
  }

  /**
   * Save file blob to the state
   *
   * @async
   * @param {Blob} file - image file
   */
  async saveFile(file) {
    const { change } = this.props;

    if (!file) {
      return;
    }

    const orientation = await getOrientation(file);
    const fileBase64 = await fixOrientation(file, orientation);

    this.setState({
      file: fileBase64,
    }, () => change(fileBase64));
  }

  /**
   * Disable dragOver and dragLeave events
   */
  disableDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }


  /**
   * Handle drop image file event
   */
  dropImage = async (e) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    const { files } = dt;
    await this.saveFile(files[0]);
  }

  /**
   * Enter and space buttons press handler
   * Triggers file input
   */
  keyboardAccess = (e) => {
    if (e.which === 32 || e.which === 13) {
      e.preventDefault();
      e.target.click();
    }
  }

  /**
   * Ability to load photos from gallery
   */
  isButtonDisabled = (isGallery) => {
    if (environment === 'development' || isGallery) {
      this.setState({
        isButtonDisabled: false,
      });
    }
  }

  render() {
    const {
      type,
      isValid,
    } = this.props;

    const {
      value,
      isImageLoaded,
      isButtonDisabled,
    } = this.state;

    const classes = classNames('upload-file',
      {
        'upload-file--invalid': !isValid,
      });

    return (
      <label
        onDragOver={this.disableDragEvents}
        onDragLeave={this.disableDragEvents}
        onDrop={this.dropImage}
        className={classes}
        htmlFor={type}
        tabIndex="0"
        onKeyPress={this.keyboardAccess}
        onKeyUp={this.keyboardAccess}
      >
        <input
          type="file"
          name={type}
          id={type}
          onChange={this.onChange}
          tabIndex="-1"
          value={value}
          accept="image/*"
          disabled={isButtonDisabled}
        />
        <div className="upload-file__image upload-file__image--placeholder">

          {/* {!isImageLoaded ? ( */}
          {/*  <Loader /> */}
          {/* ) : null} */}

          {/* {(type === 'front') ? ( */}
          {/*  <img src={frontPhoto} onLoad={this.onImageLoad} alt="front" /> */}
          {/* ) : null} */}

          {/* {(type === 'side') ? ( */}
          {/*  <img src={sidePhoto} onLoad={this.onImageLoad} alt="side" /> */}
          {/* ) : null} */}
        </div>
      </label>
    );
  }
}
