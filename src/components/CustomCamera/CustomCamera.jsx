import { h } from 'preact';
import Camera from '@3dlook-me/camera-rpv-client';

import analyticsService, {
  CAMERA_ACCESS_DENIED,
} from '../../services/analyticsService';

export default class CustomCamera extends Camera {
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
