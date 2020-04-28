/**
 * CONSTANTS constants
 */
export const CONSTANTS = {
  RESET_STATE: 'RESET_STATE',
  SET_MEASUREMENTS: 'SET_MEASUREMENTS',
  SET_IS_MOBILE: 'SET_IS_MOBILE',
  SET_IS_FROM_DESKTOP_TO_MOBILE: 'SET_IS_FROM_DESKTOP_TO_MOBILE',
  SET_ORIGIN: 'SET_ORIGIN',
  SET_RETURN_URL: 'SET_RETURN_URL',
  SET_WIDGET_URL: 'SET_WIDGET_URL',
  SET_TOKEN: 'SET_TOKEN',
  ADD_FRONT_IMAGE: 'ADD_FRONT_IMAGE',
  ADD_SIDE_IMAGE: 'ADD_SIDE_IMAGE',
  ADD_HEIGHT: 'ADD_HEIGHT',
  ADD_GENDER: 'ADD_GENDER',
  SET_WEIGHT: 'SET_WEIGHT',
  SET_WEIGHT_LB: 'SET_WEIGHT_LB',
  SET_BODY_TYPE: 'SET_BODY_TYPE',
  ADD_AGREE: 'ADD_AGREE',
  SET_FLOW_ID: 'SET_FLOW_ID',
  SET_PERSON_ID: 'SET_PERSON_ID',
  SET_BRAND: 'SET_BRAND',
  SET_BODY_PART: 'SET_BODY_PART',
  SET_PRODUCT_URL: 'SET_PRODUCT_URL',
  SET_RECOMMENDATIONS: 'SET_RECOMMENDATIONS',
  SET_SOFT_VALIDATION: 'SET_SOFT_VALIDATION',
  SET_HARD_VALIDATION: 'SET_HARD_VALIDATION',
  SET_EMAIL: 'SET_EMAIL',
  SET_FAKE_SIZE: 'SET_FAKE_SIZE',
  SET_HEADER_ICONS_STYLE: 'SET_HEADER_ICONS_STYLE',
  SET_CAMERA: 'SET_CAMERA',
  SET_HELP_IS_ACTIVE: 'SET_HELP_IS_ACTIVE',
  SET_HELP_BUTTON_STATUS: 'SET_HELP_BUTTON_STATUS',
  SET_IS_OPEN_RETURN_URL_DESKTOP: 'SET_IS_OPEN_RETURN_URL_DESKTOP',
  SET_PHONE_NUMBER: 'SET_PHONE_NUMBER',
  SET_PRODUCT_ID: 'SET_PRODUCT_ID',
  SET_UNITS: 'SET_UNITS',
  SET_PROCESSING_STATUS: 'SET_PROCESSING_STATUS',
  SET_PAGE_RELOAD_STATUS: 'SET_PAGE_RELOAD_STATUS',
  SET_FLOW_STATE: 'SET_FLOW_STATE',
  SET_SETTINGS: 'SET_SETTINGS',
  SET_IS_NETWORK: 'SET_IS_NETWORK',
  SET_SOURCE: 'SET_SOURCE',
};

/**
 * Save measurements
 */
export const setMeasurements = (measurements) => ({
  type: CONSTANTS.SET_MEASUREMENTS,
  payload: measurements,
});

/**
 * Reset state
 */
export const resetState = () => ({
  type: CONSTANTS.RESET_STATE,
});

/**
 * Set is mobile device
 *
 * @param {boolean} isMobile - is mobile device
 */
export const setIsMobile = (isMobile) => ({
  type: CONSTANTS.SET_IS_MOBILE,
  payload: isMobile,
});

/**
 * Set if user continue flow from desktop to mobile
 *
 * @param {string} isFromDesktopToMobile - is from desktop to mobile
 */
export const setIsFromDesktopToMobile = (isFromDesktopToMobile) => ({
  type: CONSTANTS.SET_IS_FROM_DESKTOP_TO_MOBILE,
  payload: isFromDesktopToMobile,
});

/**
 * Set origin
 *
 * @param {string} origin - origin
 */
export const setOrigin = (origin) => ({
  type: CONSTANTS.SET_ORIGIN,
  payload: origin,
});

/**
 * Set return url
 *
 * @param {string} returnUrl - return url
 */
export const setReturnUrl = (returnUrl) => ({
  type: CONSTANTS.SET_RETURN_URL,
  payload: returnUrl,
});

/**
 * Set widget url
 *
 * @param {string} widgetUrl - widget url
 */
export const setWidgetUrl = (widgetUrl) => ({
  type: CONSTANTS.SET_WIDGET_URL,
  payload: widgetUrl,
});

/**
 * Set api token action
 *
 * @param {string} token - api token
 */
export const setToken = (token) => ({
  type: CONSTANTS.SET_TOKEN,
  payload: token,
});

/**
 * Add front image action
 *
 * @param {string} frontImage - base64 encoded front image
 */
export const addFrontImage = (frontImage) => ({
  type: CONSTANTS.ADD_FRONT_IMAGE,
  payload: frontImage,
});

/**
 * Add side image action
 *
 * @param {string} frontImage - base64 encoded side image
 */
export const addSideImage = (sideImage) => ({
  type: CONSTANTS.ADD_SIDE_IMAGE,
  payload: sideImage,
});

/**
 * Add height value action
 *
 * @param {number} height - user's height
 */
export const addHeight = (height) => ({
  type: CONSTANTS.ADD_HEIGHT,
  payload: height,
});

/**
 * Add gender value action
 *
 * @param {string} gender - user's gender
 */
export const addGender = (gender) => ({
  type: CONSTANTS.ADD_GENDER,
  payload: gender,
});

/**
 * Add agree value action
 *
 * @param {boolean} agree - user's agree value
 */
export const addAgree = (agree) => ({
  type: CONSTANTS.ADD_AGREE,
  payload: agree,
});

/**
 * Set flow id action
 *
 * @param {string} flowId - user's id value
 */
export const setFlowId = (flowId) => ({
  type: CONSTANTS.SET_FLOW_ID,
  payload: flowId,
});

/**
 * Set person id action
 *
 * @param {number} personId - person id value
 */
export const setPersonId = (personId) => ({
  type: CONSTANTS.SET_PERSON_ID,
  payload: personId,
});

/**
 * Set brand action
 *
 * @param {string} brand - brand name
 */
export const setBrand = (brand) => ({
  type: CONSTANTS.SET_BRAND,
  payload: brand,
});

/**
 * Set body part action
 *
 * @param {string} bodyPart - body part
 */
export const setBodyPart = (bodyPart) => ({
  type: CONSTANTS.SET_BODY_PART,
  payload: bodyPart,
});

/**
 * Set product url
 *
 * @param {string} productUrl - product url
 */
export const setProductUrl = (productUrl) => ({
  type: CONSTANTS.SET_PRODUCT_URL,
  payload: productUrl,
});

/**
 * Set recommendations
 *
 * @param {Object} recommendations - recommendations
 * @param {string} recommendations.tight - tight size
 * @param {string} recommendations.normal - normal (regular) size
 * @param {string} recommendations.loose - loose size
 */
export const setRecommendations = (recommendations) => ({
  type: CONSTANTS.SET_RECOMMENDATIONS,
  payload: recommendations,
});

/**
 * Set soft validation
 *
 * @param {Object} softValidation - recommendations
 * @param {Object} softValidation.front - front photo soft validation
 * @param {number} softValidation.front.bodyAreaPercentage - percentage of the body on
 * the front  photo
 * @param {number} softValidation.front.legsDistance - distance between legs on the front photo
 * @param {string[]} softValidation.front.messages - front photo validation messages
 * @param {Object} softValidation.side - side photo soft validation
 * @param {number} softValidation.side.bodyAreaPercentage - percentage of the body on
 * the side  photo
 * @param {string[]} softValidation.side.messages - side photo validation messages
 */
export const setSoftValidation = (softValidation) => ({
  type: CONSTANTS.SET_SOFT_VALIDATION,
  payload: softValidation,
});

/**
 * Set hard validation
 *
 * @param {Object} hardValidation - recommendations
 * @param {sting} hardValidation.front - front photo hard validation message
 * @param {sting} hardValidation.side - side photo hard validation message
 */
export const setHardValidation = (hardValidation) => ({
  type: CONSTANTS.SET_HARD_VALIDATION,
  payload: hardValidation,
});

/**
 * Set body type
 *
 * @param {string} bodyType - body type
 */
export const setBodyType = (bodyType) => ({
  type: CONSTANTS.SET_BODY_TYPE,
  payload: bodyType,
});

/**
 * Set email
 *
 * @param {string} email - email
 */
export const setEmail = (email) => ({
  type: CONSTANTS.SET_EMAIL,
  payload: email,
});

/**
 * Set fake size
 *
 * @param {string} isFakeSize - is fake size enabled
 */
export const setFakeSize = (isFakeSize) => ({
  type: CONSTANTS.SET_FAKE_SIZE,
  payload: isFakeSize,
});

/**
 * Set icons style
 *
 * @param {string} style - icons style -  default, white
 */
export const setHeaderIconsStyle = (style) => ({
  type: CONSTANTS.SET_HEADER_ICONS_STYLE,
  payload: style,
});

/**
 * Set camera type
 *
 * @param {string} camera - camera type -  front, side
 */
export const setCamera = (camera) => ({
  type: CONSTANTS.SET_CAMERA,
  payload: camera,
});

/**
 * Set help is active
 *
 * @param {string} isActive - is help active
 */
export const setHelpIsActive = (isActive) => ({
  type: CONSTANTS.SET_HELP_IS_ACTIVE,
  payload: isActive,
});

/**
 * Set help btn status
 *
 * @param {Boolean} status - is to show btn
 */
export const setHelpBtnStatus = (status) => ({
  type: CONSTANTS.SET_HELP_BUTTON_STATUS,
  payload: status,
});

/**
 * Set is redirect
 *
 * @param {Boolean} isRedirect - is redirect
 */
export const setIsOpenReturnUrlDesktop = (isRedirect) => ({
  type: CONSTANTS.SET_IS_OPEN_RETURN_URL_DESKTOP,
  payload: isRedirect,
});

/**
 * Set phone number
 *
 * @param {string} phoneNumber - phone number
 */
export const setPhoneNumber = (phoneNumber) => ({
  type: CONSTANTS.SET_PHONE_NUMBER,
  payload: phoneNumber,
});

/**
 * Set product id
 *
 * @param {string} productId - product id
 */
export const setProductId = (productId) => ({
  type: CONSTANTS.SET_PRODUCT_ID,
  payload: productId,
});

/**
 * Set units
 *
 * @param {string} units - units system
 */
export const setUnits = (units) => ({
  type: CONSTANTS.SET_UNITS,
  payload: units,
});

/**
 * Set weight
 *
 * @param {any} weight - weight object
 */
export const setWeight = (weight) => ({
  type: CONSTANTS.SET_WEIGHT,
  payload: weight,
});

/**
  * Set weight
  *
  * @param {any} weightLb - weight object
  */
export const setWeightLb = (weightLb) => ({
  type: CONSTANTS.SET_WEIGHT_LB,
  payload: weightLb,
});

/**
 * Set sendDataStatus
 *
 * @param {string} status - status text
 */
export const setProcessingStatus = (status) => ({
  type: CONSTANTS.SET_PROCESSING_STATUS,
  payload: status,
});

/**
 * Set status
 *
 * @param {boolean} status - true if page reloaded
 */
export const setPageReloadStatus = (status) => ({
  type: CONSTANTS.SET_PAGE_RELOAD_STATUS,
  payload: status,
});

/**
 * Set flow state
 *
 * @param {Object} state - flow state
 */
export const setFlowState = (state) => ({
  type: CONSTANTS.SET_FLOW_STATE,
  payload: state,
});

/**
 * Set widget settings
 *
 * @param {string} settings - widget settings
 */
export const setSettings = (settings) => ({
  type: CONSTANTS.SET_SETTINGS,
  payload: settings,
});

/**
 * Set network error
 *
 * @param {boolean} isStable - network status
 */
export const setIsNetwork = (isStable) => ({
  type: CONSTANTS.SET_IS_NETWORK,
  payload: isStable,
});

/**
 * Set source
 *
 * @param {string} source - source
 */
export const setSource = (source) => ({
  type: CONSTANTS.SET_SOURCE,
  payload: source,
});

export default {
  setMeasurements,
  resetState,
  setIsMobile,
  setIsFromDesktopToMobile,
  setReturnUrl,
  setWidgetUrl,
  setOrigin,
  setToken,
  addFrontImage,
  addSideImage,
  addHeight,
  addGender,
  addAgree,
  setFlowId,
  setPersonId,
  setBrand,
  setBodyPart,
  setProductUrl,
  setRecommendations,
  setSoftValidation,
  setHardValidation,
  setBodyType,
  setEmail,
  setFakeSize,
  setHeaderIconsStyle,
  setCamera,
  setHelpIsActive,
  setIsOpenReturnUrlDesktop,
  setPhoneNumber,
  setProductId,
  setUnits,
  setWeight,
  setWeightLb,
  setProcessingStatus,
  setPageReloadStatus,
  setFlowState,
  setSettings,
  setHelpBtnStatus,
  setIsNetwork,
  setSource,
};
