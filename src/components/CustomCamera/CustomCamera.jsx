// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

import Camera from '@3dlook-me/camera-rpv-client';
import '@3dlook-me/camera-rpv-client/dist/style.css';

import analyticsService, {
  CAMERA_ACCESS_DENIED,
} from '../../services/analyticsService';

export default class CustomCamera extends Camera {
  // eslint-disable-next-line no-useless-constructor
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps, prevState) {
    const { isCameraAccess } = this.state;
    const { token } = this.props;

    if (prevState.isCameraAccess && !isCameraAccess) {
      analyticsService({
        uuid: token,
        event: CAMERA_ACCESS_DENIED,
      });
    }
  }

  render() {
    return super.render();
  }
}
