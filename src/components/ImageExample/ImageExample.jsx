import { h, Component } from 'preact';
import classNames from 'classnames';
import './ImageExample.scss';

import exampleSide1x from '../../images/example-side.png';
import exampleSide2x from '../../images/example-side@2x.png';

import exampleFront1x from '../../images/example-front.png';
import exampleFront2x from '../../images/example-front@2x.png';

/**
 * Help component.
 * Displays help information
 */
class ImageExample extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageX: 0,
      imageY: 0,
      isImageActive: false,
    };
  }

  showImage(target) {
    const { isMobile } = this.props;
    const { imageX, imageY } = this.state;

    const rect = target.getBoundingClientRect();

    let newImageX;

    if (isMobile) {
      newImageX = rect.left;
    } else {
      newImageX = rect.left + target.offsetWidth / 2;
    }

    const newImageY = rect.top - 366 - 8;

    const updatedState = {};

    if (imageX !== newImageX || imageY !== newImageY) {
      updatedState.imageX = newImageX;
      updatedState.imageY = newImageY;
    }

    updatedState.isImageActive = true;

    this.setState(updatedState);
  }

  hideImage() {
    this.setState({
      isImageActive: false,
    });
  }

  /**
   * Show example image on mouse enter event
   *
   * @param {MouseEvent} event - mouse event object
   */
  onMouseEnter = ({ target }) => {
    const { isMobile } = this.props;

    if (isMobile) {
      return;
    }

    this.showImage(target);
  }

  /**
   * Hide example image on mouse leave event
   *
   * @param {MouseEvent} event - mouse event object
   */
  onMouseLeave = () => {
    const { isMobile } = this.props;

    if (isMobile) {
      return;
    }

    this.hideImage();
  }

  /**
   * Show example image on touch start event
   *
   * @param {TouchEvent} event - mouse event object
   */
  onTouchStart = ({ target }) => {
    const { isMobile } = this.props;

    if (!isMobile) {
      return;
    }

    this.showImage(target);
  }

  /**
   * Hide example image on touch end event
   *
   * @param {TouchEvent} event - mouse event object
   */
  onTouchEnd = () => {
    const { isMobile } = this.props;

    if (!isMobile) {
      return;
    }

    this.hideImage();
  }

  render() {
    const { type, isMobile } = this.props;
    const { imageX, imageY, isImageActive } = this.state;

    const imageStyle = {
      top: imageY,
      left: imageX,
    };

    return (
      <div className={classNames('image-example', { 'image-example--mobile': isMobile })}>
        <button
          className="image-example__btn"
          type="button"
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onTouchStart={this.onTouchStart}
          onTouchEnd={this.onTouchEnd}
        >
          See example
        </button>
        <div className={classNames('image-example__img', { active: isImageActive })} style={imageStyle}>
          {(type === 'side')
            ? <img src={exampleSide1x} srcSet={`${exampleSide1x} 1x, ${exampleSide2x} 2x`} alt="Side example" />
            : <img src={exampleFront1x} srcSet={`${exampleFront1x} 1x, ${exampleFront2x} 2x`} alt="Front example" /> }
        </div>
      </div>
    );
  }
}

export default ImageExample;
