import { h, Component } from 'preact';
import classNames from 'classnames';

import { UploadFile } from '..';

import './UploadBlock.scss';

/**
 * Upload file block component
 */
export default class UploadBlock extends Component {
  fileChange = (params) => {
    const { change } = this.props;
    change(params);
  }

  openExample = () => {
    const { openPhotoExample, type } = this.props;

    openPhotoExample(type);
  }

  render() {
    const {
      type,
      gender,
      isValid,
      value,
      className,
    } = this.props;

    return (
      <div className={classNames('upload-block', className)}>
        <UploadFile
          gender={gender}
          type={type}
          change={this.fileChange}
          isValid={isValid}
          value={value}
        />

        <p className="upload-block__text">
          Make sure your entire body
          <b> is present on the screen</b>
        </p>
        <button
          className="upload-block__btn"
          type="button"
          onClick={this.openExample}
        >
          View an example
        </button>
      </div>
    );
  }
}
