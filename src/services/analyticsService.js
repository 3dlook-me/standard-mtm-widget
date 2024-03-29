import axios from 'axios';
import { route } from 'preact-router';
import { store } from '../store';
import { setIsWidgetArchived } from '../store/actions';

export default ({ uuid, event, data = {} }) => axios.post(`${API_HOST}/api/v2/persons/widget/${uuid}/events/`, {
  name: event,
  data,
}, {
  headers: { Authorization: `UUID ${uuid}` },
}).catch((err) => {
  // TODO refactor: make react-error-boundary component and outside analit service
  if (err && err.response && err.response.data.detail === 'Widget is archived.') {
    // store.dispatch(setIsWidgetArchived(true));

    route('/contact-your-dealer', true);
  }
});

export const analyticsServiceAsync = async ({ uuid, event, data = {} }) => await axios.post(`${API_HOST}/api/v2/persons/widget/${uuid}/events/`, {
  name: event,
  data,
}, {
  headers: { Authorization: `UUID ${uuid}` },
}).catch((err) => {
  // TODO refactor: make react-error-boundary component and outside analit service
  if (err && err.response && err.response.data.detail === 'Widget is archived.') {
    // store.dispatch(setIsWidgetArchived(true));

    route('/contact-your-dealer', true);
  }
});

// TODO Common events
export const FAQ_PAGE_OPEN = 'FAQ_PAGE_OPEN';
export const FAQ_PAGE_CLOSE = 'FAQ_PAGE_CLOSE';

export const WELCOME_SCREEN_ENTER = 'WELCOME_SCREEN_ENTER';
export const WELCOME_SCREEN_CLOSE = 'WELCOME_SCREEN_CLOSE';

export const WIDGET_OPEN = 'WIDGET_OPEN';
export const WIDGET_CLOSE = 'WIDGET_CLOSE';

// TODO Email screen
export const EMAIL_PAGE_ENTER = 'EMAIL_PAGE_ENTER';
export const EMAIL_PAGE_LEAVE = 'EMAIL_PAGE_LEAVE';
export const EMAIL_PAGE_ENTER_EMAIL = 'EMAIL_PAGE_ENTER_EMAIL';

export const CHECK_TERMS_AND_POLICY = 'CHECK_TERMS_AND_POLICY';
export const CLICK_TERMS_CONDITIONS = 'CLICK_TERMS_CONDITIONS';
export const CLICK_PRIVACY_POLICY = 'CLICK_PRIVACY_POLICY';

// TODO Gender screen
export const GENDER_PAGE_ENTER = 'GENDER_PAGE_ENTER';
export const GENDER_PAGE_LEAVE = 'GENDER_PAGE_LEAVE';
export const GENDER_PAGE_MALE_GENDER_SELECTED = 'GENDER_PAGE_MALE_GENDER_SELECTED';
export const GENDER_PAGE_FEMALE_GENDER_SELECTED = 'GENDER_PAGE_FEMALE_GENDER_SELECTED';

// TODO Height screen
export const HEIGHT_PAGE_ENTER = 'HEIGHT_PAGE_ENTER';
export const HEIGHT_PAGE_LEAVE = 'HEIGHT_PAGE_LEAVE';
export const HEIGHT_PAGE_HEIGHT_SELECTED = 'HEIGHT_PAGE_HEIGHT_SELECTED';
export const HEIGHT_PAGE_METRIC_SELECTED = 'HEIGHT_PAGE_METRIC_SELECTED';
export const HEIGHT_PAGE_IMPERIAL_SELECTED = 'HEIGHT_PAGE_IMPERIAL_SELECTED';

// TODO Weight screen
export const WEIGHT_PAGE_ENTER = 'WEIGHT_PAGE_ENTER';
export const WEIGHT_PAGE_LEAVE = 'WEIGHT_PAGE_LEAVE';
export const WEIGHT_PAGE_WEIGHT_SELECTED = 'WEIGHT_PAGE_WEIGHT_SELECTED';
export const WEIGHT_PAGE_METRIC_SELECTED = 'WEIGHT_PAGE_METRIC_SELECTED';
export const WEIGHT_PAGE_IMPERIAL_SELECTED = 'WEIGHT_PAGE_IMPERIAL_SELECTED';

export const WEIGHT_PAGE_WEIGHT_SKIP = 'WEIGHT_PAGE_WEIGHT_SKIP';

// TODO Scan QR code screen
export const SCAN_QR_CODE_PAGE_ENTER = 'SCAN_QR_CODE_PAGE_ENTER';
export const SCAN_QR_CODE_PAGE_LEAVE = 'SCAN_QR_CODE_PAGE_LEAVE';
export const SCAN_QR_CODE_PAGE_LINK_COPIED = 'SCAN_QR_CODE_PAGE_LINK_COPIED';
export const SCAN_QR_CODE_PAGE_SMS_SENT = 'SCAN_QR_CODE_PAGE_SMS_SENT';

// TODO Mobile flow start screen
export const MOBILE_FLOW_START = 'MOBILE_FLOW_START';

// TODO Camera mode selection
export const CAMERA_MODE_PAGE_ENTER = 'CAMERA_MODE_PAGE_ENTER';
export const CAMERA_MODE_PAGE_LEAVE = 'CAMERA_MODE_PAGE_LEAVE';
export const CAMERA_MODE_PAGE_WITH_FRIEND = 'CAMERA_MODE_PAGE_WITH_FRIEND';
export const CAMERA_MODE_PAGE_HANDS_FREE = 'CAMERA_MODE_PAGE_HANDS_FREE';

// TODO How to take photos
export const HOW_TO_TAKE_PHOTOS_PAGE_ENTER = 'HOW_TO_TAKE_PHOTOS_PAGE_ENTER';
export const HOW_TO_TAKE_PHOTOS_PAGE_LEAVE = 'HOW_TO_TAKE_PHOTOS_PAGE_LEAVE';
export const HOW_TO_TAKE_PHOTOS_PAGE_REPLAY = 'HOW_TO_TAKE_PHOTOS_PAGE_REPLAY';

// TODO Front photo screen
export const FRONT_PHOTO_PAGE_ENTER = 'FRONT_PHOTO_PAGE_ENTER';
export const FRONT_PHOTO_PAGE_OPEN_CAMERA = 'FRONT_PHOTO_PAGE_OPEN_CAMERA';
export const FRONT_PHOTO_PAGE_EXAMPLE_OPEN = 'FRONT_PHOTO_PAGE_EXAMPLE_OPEN';
export const FRONT_PHOTO_PAGE_EXAMPLE_CLOSE = 'FRONT_PHOTO_PAGE_EXAMPLE_CLOSE';
export const FRONT_PHOTO_PAGE_PHOTO_TAKEN = 'FRONT_PHOTO_PAGE_PHOTO_TAKEN';

// TODO Side photo screen
export const SIDE_PHOTO_PAGE_ENTER = 'SIDE_PHOTO_PAGE_ENTER';
export const SIDE_PHOTO_PAGE_OPEN_CAMERA = 'SIDE_PHOTO_PAGE_OPEN_CAMERA';
export const SIDE_PHOTO_PAGE_EXAMPLE_OPEN = 'SIDE_PHOTO_PAGE_EXAMPLE_OPEN';
export const SIDE_PHOTO_PAGE_EXAMPLE_CLOSE = 'SIDE_PHOTO_PAGE_EXAMPLE_CLOSE';
export const SIDE_PHOTO_PAGE_PHOTO_TAKEN = 'SIDE_PHOTO_PAGE_PHOTO_TAKEN';

// TODO Camera access denied
export const CAMERA_ACCESS_DENIED = 'CAMERA_ACCESS_DENIED';

// TODO Magic is happening screen
export const MAGIC_SCREEN_PAGE_ENTER = 'MAGIC_SCREEN_PAGE_ENTER';
export const MAGIC_SCREEN_PAGE_LEAVE = 'MAGIC_SCREEN_PAGE_LEAVE';
export const MAGIC_SCREEN_PAGE_SUCCESS = 'MAGIC_SCREEN_PAGE_SUCCESS';
export const MAGIC_SCREEN_PAGE_FAILED = 'MAGIC_SCREEN_PAGE_FAILED';

// TODO Results screen
export const RESULT_SCREEN_ENTER = 'RESULT_SCREEN_ENTER';

export const NOT_FOUND_PAGE = 'NOT_FOUND_PAGE';
export const RETAKE_PHOTO = 'RETAKE_PHOTO';
export const SEE_EXAMPLE = 'SEE_EXAMPLE';
export const INFO_CLICK = 'INFO_CLICK';
