import howToTakePhotosFriendVideoM from '../video/friend-flow-example-male.mp4';
import howToTakePhotosFriendVideoF from '../video/friend-flow-example-female.mp4';
import howToTakePhotosTableVideoM from '../video/table-flow-example-male.mp4';
import howToTakePhotosTableVideoF from '../video/table-flow-example-female.mp4';

import uploadFrontExampleF from '../images/friend_front_female.png';
import uploadFrontExampleM from '../images/friend_front_male.png';
import uploadSideExampleF from '../images/friend_side_female.png';
import uploadSideExampleM from '../images/friend_side_male.png';
import uploadVideoExampleM from '../video/table-flow-requirements-male.mp4';
import uploadVideoExampleF from '../video/table-flow-requirements-female.mp4';

import hardValidationSideF from '../images/side-female.png';
import hardValidationSideM from '../images/side-male.png';
import hardValidationFrontF from '../images/front-female.png';
import hardValidationFrontM from '../images/front-male.png';

export const flowScreens = {
  howToTakePhotos: {
    friendFlow: {
      male: {
        video: howToTakePhotosFriendVideoM,
      },
      female: {
        video: howToTakePhotosFriendVideoF,
      },
    },
    tableFlow: {
      male: {
        video: howToTakePhotosTableVideoM,
      },
      female: {
        video: howToTakePhotosTableVideoF,
      },
    },
  },
  upload: {
    friendFlow: {
      male: {
        frontExample: uploadFrontExampleM,
        sideExample: uploadSideExampleM,
      },
      female: {
        frontExample: uploadFrontExampleF,
        sideExample: uploadSideExampleF,
      },
    },
    tableFlow: {
      male: {
        videoExample: uploadVideoExampleM,
      },
      female: {
        videoExample: uploadVideoExampleF,
      },
    },
  },
  hardValidation: {
    friendFlow: {
      male: {
        front: hardValidationFrontM,
        side: hardValidationSideM,
      },
      female: {
        front: hardValidationFrontF,
        side: hardValidationSideF,
      },
    },
    tableFlow: {
      male: {
        front: hardValidationFrontM,
        side: hardValidationSideM,
      },
      female: {
        front: hardValidationFrontF,
        side: hardValidationSideF,
      },
    },
  },
};
