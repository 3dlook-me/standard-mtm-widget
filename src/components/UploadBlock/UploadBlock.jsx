import { h, Component } from 'preact';
import classNames from 'classnames';
import './UploadBlock.scss';

import { UploadFile } from '..';

/**
 * Upload file block component
 */
export default class UploadBlock extends Component {
  fileChange = (params) => {
    const { change } = this.props;
    change(params);
  }

  render() {
    const {
      type,
      gender,
      isValid,
      value,
      className,
    } = this.props;

    const fileText = (type === 'front') ? 'Front' : 'Side';

    return (
      <div className={classNames('upload-block', className)}>
        <UploadFile
          gender={gender}
          type={type}
          change={this.fileChange}
          isValid={isValid}
          value={value}
        />

        <p className="upload-block__text">Make sure your entire body is present on the screen</p>

        <h3 className="upload-block__title">{fileText}</h3>
      </div>
    );
  }
}
