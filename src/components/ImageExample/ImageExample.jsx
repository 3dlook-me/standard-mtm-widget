import { h, Component } from 'preact';
import classNames from 'classnames';

import './ImageExample.scss';
import exampleSide from '../../images/example-side.png';
import exampleFront from '../../images/example-front.png';

/**
 * Help component.
 * Displays help information
 */
class ImageExample extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isImageActive: false,
    };
  }

  hideImage = () => {
    this.setState({
      isImageActive: false,
    });
  }

  /**
   * Show example image on touch start event
   *
   */
  onClick = () => {
    this.setState({
      isImageActive: true,
    });
  }

  render() {
    const { type } = this.props;
    const { imageX, imageY, isImageActive } = this.state;

    const imageStyle = {
      top: imageY,
      left: imageX,
    };

    return (
      <div className="image-example image-example--mobile">
        <button
          className="image-example__btn"
          type="button"
          onClick={this.onClick}
        >
          See example
        </button>
        <div className={classNames('image-example__img', { active: isImageActive })} style={imageStyle}>
          <figure className="image-example__img-wrap">
            <button className="image-example__close-btn" type="button" onClick={this.hideImage}>
              <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round">
                  <g transform="translate(-567.000000, -20.000000)" stroke="darkgrey" strokeWidth="2">
                    <g className="header__svg-fill" transform="translate(574.727922, 27.727922) rotate(-315.000000) translate(-574.727922, -27.727922) translate(565.727922, 18.727922)">
                      <path d="M18,9 L0,9" />
                      <path d="M9,0 L9,18" />
                    </g>
                  </g>
                </g>
              </svg>
            </button>
            {(type === 'side')
              ? <img src={exampleSide} alt="Side example" />
              : <img src={exampleFront} alt="Front example" /> }
          </figure>
        </div>
      </div>
    );
  }
}

export default ImageExample;
