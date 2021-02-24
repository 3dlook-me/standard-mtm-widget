import ReactGA from 'react-ga';

if (GA_TRACKING_ID) {
  ReactGA.initialize(GA_TRACKING_ID);
  ReactGA.pageview(window.location.pathname + window.location.search);
} else {
  window.ga = () => true;
}

export const gaStart = () => ga('send', {
  hitType: 'event',
  eventCategory: 'widget',
  eventAction: 'initiate',
});

export const gaWelcomeOnContinue = () => ga('send', {
  hitType: 'event',
  eventCategory: 'Start',
  eventAction: 'continue',
});

export const gaGenderOnContinue = () => ga('send', {
  hitType: 'event',
  eventCategory: 'gender',
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

export const gaOnWeightSkip = () => ga('send', {
  hitType: 'event',
  eventCategory: 'weight',
  eventAction: 'skip',
});

export const gaTutorialMobile = () => ga('send', {
  hitType: 'event',
  eventCategory: 'tutorial',
  eventAction: 'next',
  eventLabel: 'mobile',
});

export const gaCopyUrl = () => ga('send', {
  hitType: 'event',
  eventCategory: 'link',
  eventAction: 'copy',
});

export const gaSendSms = () => ga('send', {
  hitType: 'event',
  eventCategory: 'send_sms',
  eventAction: 'sent',
});

export const gaUploadOnContinue = (eventLabel) => ga('send', {
  hitType: 'event',
  eventCategory: 'photos',
  eventAction: 'continue',
  eventLabel,
});

export const gaSwitchToMobileFlow = () => ga('send', {
  hitType: 'event',
  eventCategory: 'widget',
  eventAction: 'switch_to_mobile',
});

export const gaOnNextLetsTakePhotos = () => ga('send', {
  hitType: 'event',
  eventCategory: 'lets_take_photos',
  eventAction: 'continue',
});

export const gaOnSelectFlow = (eventLabel) => ga('send', {
  hitType: 'event',
  eventCategory: 'lets_take_photos',
  eventAction: 'select',
  eventLabel,
});

/* How to take photos - friend */
export const gaOnClickNextHowTakePhotos = () => ga('send', {
  hitType: 'event',
  eventCategory: 'how_take_photos',
  eventAction: 'continue',
  eventLabel: 'friend',
});
export const gaOnClickReplay = () => ga('send', {
  hitType: 'event',
  eventCategory: 'how_take_photos',
  eventAction: 'replay',
  eventLabel: 'friend',
});

/* How to take photos - alone */
export const gaOnClickNextAloneTakePhotos = () => ga('send', {
  hitType: 'event',
  eventCategory: 'alone_take_photos',
  eventAction: 'next',
  eventLabel: 'alone',
});
export const gaOnClickReplayAlone = () => ga('send', {
  hitType: 'event',
  eventCategory: 'alone_take_photos',
  eventAction: 'replay',
  eventLabel: 'alone',
});

/* Take front photo - friend */
export const gaOnClickLetsStartFrontFriend = (validationType) => ga('send', {
  hitType: 'event',
  eventCategory: 'Take_front',
  eventAction: 'front',
  eventLabel: `friend ${validationType}`,
});
export const gaOpenCameraFrontPhoto = () => ga('send', {
  hitType: 'event',
  eventCategory: 'camera',
  eventAction: 'front',
  eventLabel: 'friend',
});

/* Take side photo - friend */
export const gaOnClickLetsStartSideFriend = (validationType) => ga('send', {
  hitType: 'event',
  eventCategory: 'Take_front',
  eventAction: 'side',
  eventLabel: `friend ${validationType}`,
});
export const gaOpenCameraSidePhoto = () => ga('send', {
  hitType: 'event',
  eventCategory: 'camera',
  eventAction: 'side',
  eventLabel: 'friend',
});

/* Requirements */
export const gaOnClickLetsStartRequirements = (validationType) => ga('send', {
  hitType: 'event',
  eventCategory: 'alone_requirements',
  eventAction: 'continue',
  eventLabel: `alone ${validationType}`,
});

export const gaOnClickDoneRequirements = (validationType) => ga('send', {
  hitType: 'event',
  eventCategory: 'alone_sound_check',
  eventAction: 'continue',
  eventLabel: `alone ${validationType}`,
});

/* Result */
export const gaSuccess = (eventLabel) => ga('send', {
  hitType: 'event',
  eventCategory: 'success_results',
  eventAction: 'thanks',
  eventLabel,
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

/* Result continue */
export const gaResultsOnContinue = (eventLabel) => ga('send', {
  hitType: 'event',
  eventCategory: 'success_results_close',
  eventAction: 'ok_button',
  eventLabel,
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

export const gaOnSoftRetakeBtn = (eventLabel, type) => ga('send', {
  hitType: 'event',
  eventCategory: 'photo_error_soft',
  eventAction: `retake_${type}`,
  eventLabel,
});

export const gaTakePhotoFriendMode = (photoType, validationType) => ga('send', {
  hitType: 'event',
  eventCategory: 'camera',
  eventAction: `${photoType}_photo`,
  eventLabel: `friend ${validationType}`,
});

// photoType - front/side
export const gaTakePhotoAloneMode = (photoType, validationType) => ga('send', {
  hitType: 'event',
  eventCategory: 'camera',
  eventAction: `${photoType}_photo`,
  eventLabel: `alone ${validationType}`,
});
