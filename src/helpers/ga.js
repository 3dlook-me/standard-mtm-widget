export const gaStart = () => ga('send', {
  hitType: 'event',
  eventCategory: 'widget',
  eventAction: 'initiate',
});

export const gaWelcomeOnContinue = () => ga('send', {
  hitType: 'event',
  eventCategory: 'start',
  eventAction: 'continue',
});

export const gaDataMale = () => ga('send', {
  hitType: 'event',
  eventCategory: 'gender',
  eventAction: 'select',
  eventLabel: 'male',
});

export const gaDataFemale = () => ga('send', {
  hitType: 'event',
  eventCategory: 'gender',
  eventAction: 'select',
  eventLabel: 'female',
});

export const gaOnWeightNext = () => ga('send', {
  hitType: 'event',
  eventCategory: 'weight',
  eventAction: 'continue',
});

export const gaOnEmailNext = () => ga('send', {
  hitType: 'event',
  eventCategory: 'email_widget',
  eventAction: 'continue',
});

export const gaOnHeightNext = () => ga('send', {
  hitType: 'event',
  eventCategory: 'height',
  eventAction: 'continue',
});

export const gaDataOnContinue = () => ga('send', {
  hitType: 'event',
  eventCategory: 'gender',
  eventAction: 'continue',
});

export const gaTutorialMobile = () => ga('send', {
  hitType: 'event',
  eventCategory: 'tutorial',
  eventAction: 'next',
  eventLabel: 'mobile',
});

export const gaTutorialDesktop = () => ga('send', {
  hitType: 'event',
  eventCategory: 'tutorial',
  eventAction: 'view',
  eventLabel: 'desktop',
});

export const gaTutorialBack = () => ga('send', {
  hitType: 'event',
  eventCategory: 'tutorial',
  eventAction: 'back',
  eventLabel: 'desktop',
});

export const gaCopyUrl = () => ga('send', {
  hitType: 'event',
  eventCategory: 'link',
  eventAction: 'copy',
});

export const gaUploadOnContinue = () => ga('send', {
  hitType: 'event',
  eventCategory: 'photos',
  eventAction: 'continue',
});

export const gaSwitchToMobileFlow = () => ga('send', {
  hitType: 'event',
  eventCategory: 'widget',
  eventAction: 'switch_to_mobile',
});

export const gaOpenCameraFrontPhoto = () => ga('send', {
  hitType: 'event',
  eventCategory: 'camera',
  eventAction: 'front',
});

export const gaOpenCameraSidePhoto = () => ga('send', {
  hitType: 'event',
  eventCategory: 'camera',
  eventAction: 'side',
});

export const gaSuccess = () => ga('send', {
  hitType: 'event',
  eventCategory: 'processing',
  eventAction: 'success',
});

export const gaHardValidationError = () => ga('send', {
  hitType: 'event',
  eventCategory: 'processing',
  eventAction: 'error',
});

export const gaSoftValidationError = () => ga('send', {
  hitType: 'event',
  eventCategory: 'processing',
  eventAction: 'warning',
});

export const gaRetakePhotoError = () => ga('send', {
  hitType: 'event',
  eventCategory: 'photo_error',
  eventAction: 'retake',
});

export const gaRetakePhotoWarning = () => ga('send', {
  hitType: 'event',
  eventCategory: 'photo_warning',
  eventAction: 'retake',
});

export const gaContinueAnyway = () => ga('send', {
  hitType: 'event',
  eventCategory: 'photo_warning',
  eventAction: 'continue',
});

export const gaResultsOnContinue = () => ga('send', {
  hitType: 'event',
  eventCategory: 'backtostore',
  eventAction: 'continue',
});

export const gaHelpOnClick = () => ga('send', {
  hitType: 'event',
  eventCategory: 'help',
  eventAction: 'view',
});

export const gaCloseOnClick = () => ga('send', {
  hitType: 'event',
  eventCategory: 'widget',
  eventAction: 'close',
});

export const gaSizeNotFound = () => ga('send', {
  hitType: 'event',
  eventCategory: 'size_error',
  eventAction: 'error',
});
