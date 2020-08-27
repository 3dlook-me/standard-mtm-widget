import { CONSTANTS } from './actions';

export const INITIAL_STATE = {
  measurements: null,
  origin: null,
  returnUrl: null,
  widgetUrl: null,
  isFromDesktopToMobile: false,
  isMobile: false,
  token: null,

  gender: null,
  height: null,
  weight: null,
  weightLb: null,
  bodyType: null,

  frontImage: null,
  sideImage: null,
  deviceCoordinates: {
    frontPhoto: null,
    sidePhoto: null,
  },

  flowId: null,
  personId: null,
  flowState: null,

  brand: null,
  bodyPart: null,
  productUrl: null,
  productId: null,
  taskId: null,

  recommendations: {
    tight: null,
    normal: null,
    loose: null,
  },

  isSoftValidationPresent: true,

  softValidation: {
    looseTop: true,
    looseBottom: true,
    looseTopAndBottom: true,
    wideLegs: true,
    smallLegs: true,
    bodyPercentage: true,
  },

  hardValidation: {
    front: null,
    side: null,
  },

  email: null,
  units: 'in',
  phoneNumber: null,
  phoneCountry: null,
  phoneUserPart: null,
  fakeSize: false,

  headerIconsStyle: 'default',
  camera: null,
  isTableFlow: false,
  isTableFlowDisabled: false,
  isHelpActive: false,
  isOpenReturnUrlDesktop: false,
  sendDataStatus: '',
  pageReloadStatus: false,

  isNetwork: true,

  photosFromGallery: false,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CONSTANTS.SET_MEASUREMENTS:
      return {
        ...state,
        measurements: action.payload,
      };

    case CONSTANTS.RESET_STATE:
      return {
        ...INITIAL_STATE,
      };

    case CONSTANTS.SET_IS_MOBILE:
      return {
        ...state,
        isMobile: action.payload,
      };

    case CONSTANTS.SET_IS_FROM_DESKTOP_TO_MOBILE:
      return {
        ...state,
        isFromDesktopToMobile: action.payload,
      };

    case CONSTANTS.SET_RETURN_URL:
      return {
        ...state,
        returnUrl: action.payload,
      };

    case CONSTANTS.SET_WIDGET_URL:
      return {
        ...state,
        widgetUrl: action.payload,
      };

    case CONSTANTS.SET_ORIGIN:
      return {
        ...state,
        origin: action.payload,
      };

    case CONSTANTS.SET_TOKEN:
      return {
        ...state,
        token: action.payload,
      };

    case CONSTANTS.ADD_FRONT_IMAGE:
      return {
        ...state,
        frontImage: action.payload,
      };

    case CONSTANTS.ADD_SIDE_IMAGE:
      return {
        ...state,
        sideImage: action.payload,
      };

    case CONSTANTS.ADD_FRONT_COORDINATES:
      return {
        ...state,
        deviceCoordinates: {
          ...state.deviceCoordinates,
          frontPhoto: action.payload,
        },
      };

    case CONSTANTS.ADD_SIDE_COORDINATES:
      return {
        ...state,
        deviceCoordinates: {
          ...state.deviceCoordinates,
          sidePhoto: action.payload,
        },
      };

    case CONSTANTS.ADD_GENDER:
      return {
        ...state,
        gender: action.payload,
      };

    case CONSTANTS.ADD_HEIGHT:
      return {
        ...state,
        height: action.payload,
      };

    case CONSTANTS.ADD_AGREE:
      return {
        ...state,
        agree: action.payload,
      };

    case CONSTANTS.SET_FLOW_ID:
      return {
        ...state,
        flowId: action.payload,
      };

    case CONSTANTS.SET_PERSON_ID:
      return {
        ...state,
        personId: action.payload,
      };

    case CONSTANTS.SET_BODY_PART:
      return {
        ...state,
        bodyPart: action.payload,
      };

    case CONSTANTS.SET_BRAND:
      return {
        ...state,
        brand: action.payload,
      };

    case CONSTANTS.SET_PRODUCT_URL:
      return {
        ...state,
        productUrl: action.payload,
      };

    case CONSTANTS.SET_RECOMMENDATIONS:
      return {
        ...state,
        recommendations: {
          ...state.recommendations,
          ...action.payload,
        },
      };

    case CONSTANTS.SET_SOFT_VALIDATION:
      return {
        ...state,
        isSoftValidationPresent: action.payload.looseTop
          || action.payload.looseBottom
          || action.payload.looseTopAndBottom
          || action.payload.wideLegs
          || action.payload.smallLegs
          || action.payload.bodyPercentage,
        softValidation: {
          ...state.softValidation,
          ...action.payload,
        },
      };

    case CONSTANTS.SET_HARD_VALIDATION:
      return {
        ...state,
        hardValidation: {
          ...state.hardValidation,
          ...action.payload,
        },
      };

    case CONSTANTS.SET_BODY_TYPE:
      return {
        ...state,
        bodyType: action.payload,
      };

    case CONSTANTS.SET_EMAIL:
      return {
        ...state,
        email: action.payload,
      };

    case CONSTANTS.SET_FAKE_SIZE:
      return {
        ...state,
        fakeSize: action.payload,
      };

    case CONSTANTS.SET_HEADER_ICONS_STYLE:
      return {
        ...state,
        headerIconsStyle: action.payload,
      };

    case CONSTANTS.SET_CAMERA:
      return {
        ...state,
        camera: action.payload,
      };

    case CONSTANTS.SET_HELP_IS_ACTIVE:
      return {
        ...state,
        isHelpActive: action.payload,
      };

    case CONSTANTS.SET_IS_OPEN_RETURN_URL_DESKTOP:
      return {
        ...state,
        isOpenReturnUrlDesktop: action.payload,
      };

    case CONSTANTS.SET_PHONE_NUMBER:
      return {
        ...state,
        phoneNumber: action.payload,
      };

    case CONSTANTS.SET_PRODUCT_ID:
      return {
        ...state,
        productId: action.payload,
      };

    case CONSTANTS.SET_UNITS:
      return {
        ...state,
        units: action.payload,
      };

    case CONSTANTS.SET_WEIGHT:
      return {
        ...state,
        weight: action.payload,
      };

    case CONSTANTS.SET_WEIGHT_LB:
      return {
        ...state,
        weightLb: action.payload,
      };

    case CONSTANTS.SET_PROCESSING_STATUS:
      return {
        ...state,
        sendDataStatus: action.payload,
      };

    case CONSTANTS.SET_PAGE_RELOAD_STATUS:
      return {
        ...state,
        pageReloadStatus: action.payload,
      };

    case CONSTANTS.SET_FLOW_STATE:
      return {
        ...state,
        flowState: action.payload,
      };

    case CONSTANTS.SET_IS_NETWORK:
      return {
        ...state,
        isNetwork: action.payload,
      };

    case CONSTANTS.SET_IS_PHOTOS_FROM_GALLERY:
      return {
        ...state,
        isPhotosFromGallery: action.payload,
      };

    case CONSTANTS.SET_PHONE_COUNTRY:
      return {
        ...state,
        phoneCountry: action.payload,
      };

    case CONSTANTS.SET_PHONE_USER_PART:
      return {
        ...state,
        phoneUserPart: action.payload,
      };

    case CONSTANTS.SET_IS_TABLE_FLOW:
      return {
        ...state,
        isTableFlow: action.payload,
      };

    case CONSTANTS.SET_IS_TABLE_FLOW_DISABLED:
      return {
        ...state,
        isTableFlowDisabled: action.payload,
      };

    case CONSTANTS.SET_TASK_ID:
      return {
        ...state,
        taskId: action.payload,
      };

    default:
      return state;
  }
};
