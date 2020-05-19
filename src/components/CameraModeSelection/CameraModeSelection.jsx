import { h, Component } from 'preact';

import './CameraModeSelection.scss';
import classNames from 'classnames';
import frontCameraMode from '../../images/front-camera-mode.png';
import sideCameraMode from '../../images/side-camera-mode.png';
import checkMark from '../../images/check-mark.svg';

/**
 * CameraModeSelection component
 */
export default class CameraModeSelection extends Component {
  constructor(props) {
    super(props);

    this.setState({
      activeMode: 'back-mode',
    });
  }

  handleClick = (e) => {
    const { value } = e.target;

    console.log(value)

    this.setState({
      activeMode: value,
    });
  }

  render() {
    // const {} = this.props;
    const { activeMode } = this.state;

    return (
      <div className="camera-mode-selection">
        <p className="camera-mode-selection__text">
          You can either ask someone to help you or
          take photos with the guidance of our AI assistant.
          <br />
          <b>How do you want to proceed?</b>
        </p>
        <div className="camera-mode-selection__buttons-wrap">
          <label
            className={classNames('camera-mode-selection__button camera-mode-selection__button--back', {
              'camera-mode-selection__button--active': activeMode === 'back-mode',
            })}
            htmlFor="back-mode-radio"
          >
            <input
              type="radio"
              value="back-mode"
              name="camera-mode"
              id="back-mode-radio"
              onChange={this.handleClick}
            />

            <div className="camera-mode-selection__img-wrap">
              <img src={frontCameraMode} alt="front" />
            </div>
            <div className="camera-mode-selection__icon-wrap">
              <h4 className="camera-mode-selection__title">
                With a friend
              </h4>
              <div className="camera-mode-selection__icon">
                <img src={checkMark} alt="button-status" />
              </div>
            </div>
          </label>

          {/*<label*/}
          {/*  className={classNames('camera-mode-selection__button camera-mode-selection__button--front', {*/}
          {/*    'camera-mode-selection__button--active': activeMode === 'front-mode',*/}
          {/*  })}*/}
          {/*  htmlFor="front-mode-radio"*/}
          {/*>*/}
          {/*  <input*/}
          {/*    type="radio"*/}
          {/*    value="front-mode"*/}
          {/*    name="camera-mode"*/}
          {/*    id="front-mode-radio"*/}
          {/*    onChange={this.handleClick}*/}
          {/*  />*/}

          {/*  <div className="camera-mode-selection__img-wrap">*/}
          {/*    <img src={sideCameraMode} alt="side" />*/}
          {/*  </div>*/}
          {/*  <div className="camera-mode-selection__icon-wrap">*/}
          {/*    <h4 className="camera-mode-selection__title">*/}
          {/*      AI assistant*/}
          {/*    </h4>*/}
          {/*    <div className="camera-mode-selection__icon">*/}
          {/*      <img src={checkMark} alt="button-status" />*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</label>*/}
        </div>
      </div>
    );
  }
}
