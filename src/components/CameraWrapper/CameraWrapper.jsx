// eslint-disable-next-line no-unused-vars
import { h, Component } from 'preact';
import {
  loadRtpvCamera,
  loadDefaultCamera,
} from './cameraLoader';

export class CameraWrapper extends Component {
  state = {
    CameraComponent: null,
  };

  componentDidMount() {
    this.loadCamera(this.props);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.useRtpvCamera !== this.props.useRtpvCamera) {
      this.loadCamera(this.props);
    }
  }

  async loadCamera(props) {
    const { useRtpvCamera } = props;

    this.setState({ CameraComponent: null });

    const CameraComponent = useRtpvCamera
      ? await loadRtpvCamera()
      : await loadDefaultCamera();

    this.setState({ CameraComponent });
  }

  adaptProps(props) {
    const {
      useRtpvCamera,
      setFrontValidationStatus,
      setSideValidationStatus,
      ...rest
    } = props;

    return {
      ...rest,
      isFrontPhotoPoseValidated: setFrontValidationStatus,
      isSidePhotoPoseValidated: setSideValidationStatus,
    };
  }

  render(props, state) {
    const { CameraComponent } = state;
    const { camera } = props;

    if (!camera || !CameraComponent) return null;

    const adaptedProps = this.adaptProps(props);

    return (
      <CameraComponent
        type={camera}
        {...adaptedProps}
      />
    );
  }
}
