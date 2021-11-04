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
  ADD_FRONT_COORDINATES: 'ADD_FRONT_COORDINATES',
  ADD_SIDE_COORDINATES: 'ADD_SIDE_COORDINATES',
  ADD_HEIGHT: 'ADD_HEIGHT',
  ADD_GENDER: 'ADD_GENDER',
  SET_WEIGHT: 'SET_WEIGHT',
  SET_WEIGHT_LB: 'SET_WEIGHT_LB',
  SET_BODY_TYPE: 'SET_BODY_TYPE',
  ADD_AGREE: 'ADD_AGREE',
  SET_FLOW_ID: 'SET_FLOW_ID',
  SET_WIDGET_ID: 'SET_WIDGET_ID',
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
  SET_IS_HEADER_TRANSLUCENT: 'SET_IS_HEADER_TRANSLUCENT',
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
  SET_MTM_CLIENT_ID: 'SET_MTM_CLIENT_ID',
  SET_FIRST_NAME: 'SET_FIRST_NAME',
  SET_NOTES: 'SET_NOTES',
  SET_IS_PHOTOS_FROM_GALLERY: 'SET_IS_PHOTOS_FROM_GALLERY',
  SET_PHONE_COUNTRY: 'SET_PHONE_COUNTRY',
  SET_PHONE_USER_PART: 'SET_PHONE_USER_PART',
  SET_IS_SMB_FLOW: 'SET_IS_SMB_FLOW',
  SET_IS_SMB_QR_FLOW: 'SET_IS_SMB_QR_FLOW',
  SET_IS_TABLE_FLOW: 'SET_IS_TABLE_FLOW',
  SET_IS_TABLE_FLOW_DISABLED: 'SET_IS_TABLE_FLOW_DISABLED',
  SET_TASK_ID: 'SET_TASK_ID',
  SET_FLOW_IS_PENDING: 'SET_FLOW_IS_PENDING',
  SET_IS_WIDGET_DEACTIVATED: 'SET_IS_WIDGET_DEACTIVATED',
  SET_IS_DEMO_WIDGET: 'SET_IS_DEMO_WIDGET',
  SET_CUSTOM_SETTINGS: 'SET_CUSTOM_SETTINGS',
  SET_IS_WIDGET_ARCHIVED: 'SET_IS_WIDGET_ARCHIVED',
  SET_IS_DISABLED_EMAIL: 'SET_IS_DISABLED_EMAIL',
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
 * @param {string} sideImage - base64 encoded side image
 */
export const addSideImage = (sideImage) => ({
  type: CONSTANTS.ADD_SIDE_IMAGE,
  payload: sideImage,
});

/**
 * Add device coordinates for front photo action
 *
 * @param {Object} coords - x, y, z device coordinates
 */
export const addFrontDeviceCoordinates = (coords) => ({
  type: CONSTANTS.ADD_FRONT_COORDINATES,
  payload: coords,
});

/**
 * Add device coordinates for side photo action
 *
 * @param {Object} coords - x, y, z device coordinates
 */
export const addSideDeviceCoordinates = (coords) => ({
  type: CONSTANTS.ADD_SIDE_COORDINATES,
  payload: coords,
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
 * Set widget object id action
 *
 * @param {string} id - widget object's id value
 */
export const setWidgetId = (id) => ({
  type: CONSTANTS.SET_WIDGET_ID,
  payload: id,
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
 * @param {string} hardValidation.front - front photo hard validation message
 * @param {string} hardValidation.side - side photo hard validation message
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
 * Set header style
 *
 * @param {boolean} isTranslucent - icons opacity 0.4
 */
export const setIsHeaderTranslucent = (isTranslucent) => ({
  type: CONSTANTS.SET_IS_HEADER_TRANSLUCENT,
  payload: isTranslucent,
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

/**
 * Set mtm client id
 *
 * @param {string} id - mtm client id
 */
export const setMtmClientId = (id) => ({
  type: CONSTANTS.SET_MTM_CLIENT_ID,
  payload: id,
});

/**
 * Set mtm client first name
 *
 * @param {string} firstName - mtm client first name
 */
export const setFirstName = (firstName) => ({
  type: CONSTANTS.SET_FIRST_NAME,
  payload: firstName,
});

/**
 * Set mtm client notes
 *
 * @param {string} notes - mtm client notes
 */
export const setNotes = (notes) => ({
  type: CONSTANTS.SET_NOTES,
  payload: notes,
});

/** Set ability to upload photos from gallery
 *
 * @param {boolean} isGallery - is able
*/
export const setIsPhotosFromGallery = (isGallery) => ({
  type: CONSTANTS.SET_IS_PHOTOS_FROM_GALLERY,
  payload: isGallery,
});

/**
 * Set phone country
 *
 * @param {string} phoneCountry - phone country
 */
export const setPhoneCountry = (phoneCountry) => ({
  type: CONSTANTS.SET_PHONE_COUNTRY,
  payload: phoneCountry,
});

/**
 * Set phone user part
 *
 * @param {string} phoneUserPart - phone user part
 */
export const setPhoneUserPart = (phoneUserPart) => ({
  type: CONSTANTS.SET_PHONE_USER_PART,
  payload: phoneUserPart,
});

/**
 * Set is SMB flow
 *
 * @param {string} isSmbFlow - is smb flow
 */
export const setIsSmbFlow = (isSmbFlow) => ({
  type: CONSTANTS.SET_IS_SMB_FLOW,
  payload: isSmbFlow,
});

/**
 * Set is SMB QR flow
 *
 * @param {string} isSmbQRFlow - is smb qr flow
 */
export const setIsSmbQRFlow = (isSmbQRFlow) => ({
  type: CONSTANTS.SET_IS_SMB_QR_FLOW,
  payload: isSmbQRFlow,
});


/**
 * Set is table flow mode
 *
 * @param {boolean} isTableFLow
 */
export const setIsTableFlow = (isTableFLow) => ({
  type: CONSTANTS.SET_IS_TABLE_FLOW,
  payload: isTableFLow,
});

/**
 * Set is table flow mode disabled
 *
 * @param {boolean} isTableFLow
 */
export const setIsTableFlowDisabled = (isTableFLow) => ({
  type: CONSTANTS.SET_IS_TABLE_FLOW_DISABLED,
  payload: isTableFLow,
});

/**
 * Set taskSetID
 *
 * @param {string} id - taskSetID
 */
export const setTaskId = (id) => ({
  type: CONSTANTS.SET_TASK_ID,
  payload: id,
});

/**
 * Set flow is pending
 *
 * @param {boolean} isPending - isPending
 */
export const setFlowIsPending = (isPending) => ({
  type: CONSTANTS.SET_FLOW_IS_PENDING,
  payload: isPending,
});

/**
 * Set is widget deactivated
 *
 * @param {boolean} isDeactivated - is deactivated
 */
export const setIsWidgetDeactivated = (isDeactivated) => ({
  type: CONSTANTS.SET_IS_WIDGET_DEACTIVATED,
  payload: isDeactivated,
});

/**
 * Set is demo widget
 *
 * @param {boolean} isDemo - is demo widget
 */
export const setIsDemoWidget = (isDemo) => ({
  type: CONSTANTS.SET_IS_DEMO_WIDGET,
  payload: isDemo,
});

/**
 * Set widget custom settings
 *
 * @param {Object} settings - settings
 * @param {string} settings.gender - custom gender
 * @param {string} settings.redirectLink - custom redirect link
 * @param {Object} settings.outputMeasurements - custom qty of measurements output
 */
export const setCustomSettings = (settings) => ({
  type: CONSTANTS.SET_CUSTOM_SETTINGS,
  payload: settings,
});

/**
 * Set is widget archived
 *
 * @param {boolean} isArchived - is archived
 */
export const setIsWidgetArchived = (isArchived) => ({
  type: CONSTANTS.SET_IS_WIDGET_ARCHIVED,
  payload: isArchived,
});

/**
 * Set is disabled email
 *
 * @param {boolean} isDisabled - is disabled
 */
export const setIsDisabledEmail = (isDisabled) => ({
  type: CONSTANTS.SET_IS_DISABLED_EMAIL,
  payload: isDisabled,
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
  setWidgetId,
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
  setIsHeaderTranslucent,
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
  setSource,
  setMtmClientId,
  setFirstName,
  setNotes,
  setIsNetwork,
  setIsPhotosFromGallery,
  setPhoneCountry,
  setPhoneUserPart,
  setIsSmbFlow,
  setIsSmbQRFlow,
  setIsTableFlow,
  setIsTableFlowDisabled,
  addFrontDeviceCoordinates,
  addSideDeviceCoordinates,
  setTaskId,
  setFlowIsPending,
  setIsWidgetDeactivated,
  setIsDemoWidget,
  setCustomSettings,
  setIsWidgetArchived,
  setIsDisabledEmail,
};
