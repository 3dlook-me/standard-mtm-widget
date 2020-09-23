import { CONSTANTS } from './actions';

// const a = '{"id":134057,"url":"https://saia-test.3dlook.me/api/v2/persons/134057/","gender":"female","height":183,"weight":54,"volume_params":{"chest":94.22,"under_bust_girth":77.26,"upper_chest_girth":88.13,"overarm_girth":110.4,"waist":71.31,"high_hips":93.7,"low_hips":101.12,"bicep":25.59,"knee":38.63,"ankle":27.3,"wrist":17.79,"calf":37.72,"thigh":59.27,"mid_thigh_girth":47.73,"neck":33.82,"abdomen":86.16,"armscye_girth":47.35,"neck_girth":33.04,"neck_girth_relaxed":33,"forearm":25.68,"elbow_girth":24.01},"front_params":{"soft_validation":{"messages":[]},"clothes_type":{"types":{"top":{"code":"t3","detail":"underwear/without underwear"},"bottom":{"code":"b0","detail":"skinny bottom"}}},"body_area_percentage":0.73,"body_height":50.59,"outseam":121.21,"outseam_from_upper_hip_level":110.52,"inseam":78.04,"inside_crotch_length_to_mid_thigh":20.21,"inside_crotch_length_to_knee":35.31,"inside_crotch_length_to_calf":53.92,"crotch_length":35.83,"sleeve_length":59.74,"underarm_length":50.79,"back_neck_point_to_wrist_length":83.25,"high_hips":32.53,"shoulders":41.34,"chest_top":31.74,"jacket_length":73.56,"shoulder_length":14.54,"shoulder_slope":23.23,"neck":11.22,"waist_to_low_hips":24.62,"waist_to_knees":70.24,"nape_to_waist_centre_back":47.16,"shoulder_to_waist":45.3,"side_neck_point_to_armpit":21.33,"back_neck_height":156.3,"bust_height":137.4,"hip_height":99.47,"upper_hip_height":106.08,"knee_height":53.85,"outer_ankle_height":10.22,"waist_height":124.09,"inside_leg_height":88.26,"across_back_shoulder_width":40.56,"across_back_width":31.69,"total_crotch_length":77.71,"waist":25.17,"neck_length":8.97,"upper_arm_length":34.79,"lower_arm_length":29.22,"upper_hip_to_hip_length":6.61,"back_shoulder_width":43.19,"rise":25.24,"back_neck_to_hip_length":60.93,"torso_height":68.91,"front_crotch_length":32.26,"back_crotch_length":34.63,"legs_distance":35.6},"side_params":{"soft_validation":{"messages":[]},"clothes_type":{"types":[]},"body_area_percentage":0.74,"side_upper_hip_level_to_knee":57.45,"side_neck_point_to_upper_hip":53.93,"neck_to_chest":23.14,"chest_to_waist":22.15,"waist_to_ankle":115.71,"shoulders_to_knees":110.8}}';
// const a = '{"id":134078,"url":"https://saia-test.3dlook.me/api/v2/persons/134078/","gender":"female","height":185,"weight":55,"volume_params":{},"front_params":{"soft_validation":{"messages":[]},"clothes_type":{"types":{"top":{"code":"t3","detail":"underwear/without underwear"},"bottom":{"code":"b0","detail":"skinny bottom"}}},"waist_to_knees":70.95,"upper_hip_height":105.45},"side_params":{"soft_validation":{"messages":[]},"clothes_type":{"types":[]},"shoulders_to_knees":112.11,"waist_to_ankle":115.51}}';
export const INITIAL_STATE = {
  measurements: {
    front_params: {},
    side_params: {},
    volume_params: {},
  },
  // measurements: {
  //   ...(JSON.parse(a)),
  // },
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
  widgetId: null,
  personId: null,
  mtmClientId: null,
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

  softValidation: {
    front: {
      bodyAreaPercentage: null,
      legsDistance: null,
      messages: [],
    },
    side: {
      bodyAreaPercentage: null,
      messages: [],
    },
  },

  hardValidation: {
    front: null,
    side: null,
  },

  email: null,
  units: 'in',
  firstName: null,
  phoneNumber: null,
  notes: null,
  phoneCountry: null,
  phoneUserPart: null,
  fakeSize: false,

  settings: {
    final_page: 'thanks',
    // final_page: 'measurements',
    // result_screen: 'measurements',
  },

  headerIconsStyle: 'default',
  isHeaderTranslucent: false,
  camera: null,
  isTableFlow: false,
  isTableFlowDisabled: false,
  isHelpActive: false,
  isOpenReturnUrlDesktop: false,
  sendDataStatus: '',
  pageReloadStatus: false,
  helpBtnStatus: true,

  isNetwork: true,

  source: 'widget',

  photosFromGallery: false,

  isSmbFlow: false,
  isWidgetDeactivated: false,
  isDemoWidget: false,

  customSettings: {
    gender: 'all',
    redirectLink: null,
    outputMeasurements: {
      volumetric: {
        chest: false,
        under_bust_girth: false,
        upper_chest_girth: false,
      },
      linear: {
        waist_to_knees: true,
        upper_hip_height: true,
        shoulders_to_knees: true,
        waist_to_ankle: true,
      },
    },
  },
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

    case CONSTANTS.SET_WIDGET_ID:
      return {
        ...state,
        widgetId: action.payload,
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

    case CONSTANTS.SET_IS_HEADER_TRANSLUCENT:
      return {
        ...state,
        isHeaderTranslucent: action.payload,
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

    case CONSTANTS.SET_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case CONSTANTS.SET_HELP_BUTTON_STATUS:
      return {
        ...state,
        helpBtnStatus: action.payload,
      };

    case CONSTANTS.SET_IS_NETWORK:
      return {
        ...state,
        isNetwork: action.payload,
      };

    case CONSTANTS.SET_SOURCE:
      return {
        ...state,
        source: action.payload || 'widget',
      };

    case CONSTANTS.SET_MTM_CLIENT_ID:
      return {
        ...state,
        mtmClientId: action.payload,
      };

    case CONSTANTS.SET_FIRST_NAME:
      return {
        ...state,
        firstName: action.payload,
      };

    case CONSTANTS.SET_NOTES:
      return {
        ...state,
        notes: action.payload,
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

    case CONSTANTS.SET_IS_SMB_FLOW:
      return {
        ...state,
        isSmbFlow: action.payload,
      };

    case CONSTANTS.SET_TASK_ID:
      return {
        ...state,
        taskId: action.payload,
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

    case CONSTANTS.SET_IS_WIDGET_DEACTIVATED:
      return {
        ...state,
        isWidgetDeactivated: action.payload,
      };

    case CONSTANTS.SET_IS_DEMO_WIDGET:
      return {
        ...state,
        isDemoWidget: action.payload,
      };

    case CONSTANTS.SET_CUSTOM_SETTINGS:
      return {
        ...state,
        customSettings: {
          ...state.customSettings,
          gender: action.payload.gender,
          redirectLink: action.payload.redirect_link,
          outputMeasurements: action.payload.output_measurements,
          is_custom_output_measurements: action.payload.is_custom_output_measurements,
        },
      };

    default:
      return state;
  }
};
