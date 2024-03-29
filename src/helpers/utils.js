import axios from 'axios';
import { detectOS, browserName } from 'detect-browser';

import { flowScreens } from '../configs/flowScreens';

export const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      func(...args);
    }, delay);
  };
};

/**
 * Get stringified GET params from object
 *
 * @param {Object} obj - object with params
 * @param {string} url - return url
 */
export const objectToUrlParams = (obj, url) => {
  let str = url.includes('?') ? '&measurements=true' : '?measurements=true&';

  for (const key in obj) {
    if (str !== '?measurements=true&') {
      str += '&';
    }

    str += `${key}=${encodeURIComponent(obj[key])}`;
  }

  return str;
};

/**
 * Parse hash params
 */
export const parseHashParams = () => {
  const indexOfStartParams = window.location.hash.indexOf('?') + 1;

  let hash = window.location.hash.substr(indexOfStartParams);
  hash = decodeURIComponent(hash);

  const result = hash.split('&').reduce((result, item) => {
    const parts = item.split('=');
    result[parts[0]] = parts[1];
    return result;
  }, {});

  return result;
};

/**
 * Parse get params
 */
export const parseGetParams = () => {
  let hash = window.location.search.substr(1);
  hash = decodeURIComponent(hash);

  const result = hash.split('&').reduce((result, item) => {
    const parts = item.split('=');
    result[parts[0]] = parts[1];
    return result;
  }, {});

  return result;
};

/**
 * Send command to parent window
 *
 * @param {string} command - command name
 * @param {*} data - object with data that should be sent to parent window
 */
export const send = (command, data = {}, origin) => {
  const finalOrigin = origin || parseHashParams().origin || window.location.origin;

  window.parent.postMessage({
    command: `saia-pf-widget.${command}`,
    data,
  }, finalOrigin);
};

/**
 * Transforms response object from size recomendation API to object like this
 * {
 *    normal: 'M',
 *    loose: 'L'
 * }
 *
 * @param {Object} recomendations - response from size recomendation API
 */
export const transformRecomendations = (recomendations) => {
  const entries = Object.entries(recomendations);
  const transformed = {};

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    transformed[entry[0]] = entry[1].size;
  }

  return transformed;
};

/**
 * Convert centimeters value to feets and inches
 *
 * @param {number} cm - centimeters
 * @returns {Object} object with feets and inches values
 */
export const cmToFtIn = (cm) => {
  const realFeet = ((cm * 0.393700) / 12);
  let feet = Math.floor(realFeet);
  let inches = Math.round((realFeet - feet) * 12);

  if (inches === 12) {
    feet += 1;
    inches = 0;
  }

  return {
    ft: feet,
    in: inches,
  };
};

/**
 * Convert inches to centimeters
 *
 * @param {number} inches - inches
 * @returns {number} centimeters value
 */
export const in2cm = (inches) => inches * 2.54;

/**
 * Convert ft to in value
 *
 * @param {number} ft - feets value
 * @returns {number} inches value
 */
export const ft2in = (ft) => ft * 12;

/**
 * Convert ft and in height to cm value
 *
 * @param {number} ft - feets value
 * @param {number} inches - inches value
 */
export const getHeightCm = (ft = 0, inches = 0) => in2cm(ft2in(ft) + parseInt(inches, 10));

/**
 * Convert lb weight to kg value
 *
 * @param {number} lb - weight value
 */
export const getWeightKg = (lb) => lb * 0.45359237;

/**
 * Convert kg weight to lb value
 *
 * @param {number} lb - weight value
 */
export const getWeightLb = (kg) => Math.round(kg / 0.45359237);

/**
 * Check if user device is mobile device
 *
 * @returns {boolean}
 */
export const isMobileDevice = () => {
  let isMobile = false;

  if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
    isMobile = true;
  }

  return isMobile;
};

/**
 * Validate email address
 *
 * @param {string} email - email address
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate phone number for letters
 *
 * @param {string} phone - phone number
 * @returns {boolean}
 */
export const validatePhoneNumberLetters = (phone) => {
  const re = /^[0-9,\-, , (, ), \+]*$/;
  return re.test(phone.trim());
};

/**
* Get image orientation
*
* @async
* @param {Blob} blob - image blob object
*/
export const getOrientation = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.addEventListener('load', () => {
    const view = new DataView(reader.result);

    if (view.getUint16(0, false) !== 0xFFD8) {
      return resolve(-2);
    }

    const length = view.byteLength;
    let offset = 2;

    while (offset < length) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xFFE1) {
        offset += 2;

        if (view.getUint32(offset, false) !== 0x45786966) {
          return resolve(-1);
        }

        const little = view.getUint16(offset += 6, false) === 0x4949;
        offset += view.getUint32(offset + 4, little);

        const tags = view.getUint16(offset, little);
        offset += 2;

        for (let i = 0; i < tags; i += 1) {
          if (view.getUint16(offset + (i * 12), little) === 0x0112) {
            return resolve(view.getUint16(offset + (i * 12) + 8, little));
          }
        }
      } else {
        // eslint-disable-next-line no-bitwise
        if ((marker & 0xFF00) !== 0xFF00) {
          return resolve(-1);
        }

        offset += view.getUint16(offset, false);
      }
    }

    return resolve(-1);
  });

  reader.addEventListener('error', (e) => reject(e));

  reader.readAsArrayBuffer(blob);
});

/**
 * Get image base64 and fix its orientation (if needed)
 *
 * @param {*} blob - file blob
 * @param {*} orientation - image orientation
 */
export const fixOrientation = (blob, orientation) => new Promise((resolve, reject) => {
  const fileReader = new FileReader();

  fileReader.addEventListener('load', () => {
    if (!orientation || orientation <= 1) {
      return resolve(fileReader.result);
    }

    const image = new Image();
    image.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const { width, height } = image;
      canvas.width = width;
      canvas.height = height;

      // eslint-disable-next-line default-case
      switch (orientation) {
        case 2:
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          break;
        case 3:
          ctx.translate(width, height);
          ctx.rotate(180 / 180 * Math.PI);
          break;
        case 4:
          ctx.translate(0, height);
          ctx.scale(1, -1);
          break;
        case 5:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(90 / 180 * Math.PI);
          ctx.scale(1, -1);
          break;
        case 6:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(90 / 180 * Math.PI);
          ctx.translate(0, -height);
          break;
        case 7:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(270 / 180 * Math.PI);
          ctx.translate(-width, height);
          ctx.scale(1, -1);
          break;
        case 8:
          canvas.width = height;
          canvas.height = width;
          ctx.translate(0, width);
          ctx.rotate(270 / 180 * Math.PI);
          break;
      }

      ctx.drawImage(image, 0, 0, width, height);
      resolve(
        canvas.toDataURL('image/jpeg', 0.95),
      );
    });

    image.src = fileReader.result;

    return null;
  });

  fileReader.addEventListener('error', (e) => {
    reject(e);
  });

  fileReader.readAsDataURL(blob);
});


/**
 * Check if current browser is Samsung Browser
 */
export const isSamsungBrowser = () => /SamsungBrowser\/(?!([1-9][1-9]|[2-9][0-9]))/i.test(navigator.userAgent);

/**
 * Detect needed browser
 */
export const browserDetect = () => {
  const system = detectOS(navigator.userAgent);

  if (system === 'Mac OS' || system === 'iOS') {
    return 'safari';
  }

  return 'chrome';
};

const someBrowsersDetect = () => {
  // Mint Browser
  if (window.navigator.userAgent.includes('Mint Browser')) return false;
  // UC Browser
  if (window.navigator.userAgent.includes('UCBrowser')) return false;
  // Opera Touch
  if (window.navigator.userAgent.includes('OPT')) return false;
  // Edge
  if (window.navigator.userAgent.includes('EdgA')) return false;
  // Mi Browser
  if (window.navigator.userAgent.includes('MiuiBrowser')) return false;
  // Puffin
  if (window.navigator.userAgent.includes('Puffin')) return false;
  // DuckDuck
  if (window.navigator.userAgent.includes('DuckDuckGo')) return false;

  return true;
};

/**
 * Detect IOS Version
 */
const detectIOSVersion = () => {
  if (/iP(hone|od|ad)/.test(navigator.platform)) {
    const v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
    const major = parseInt(v[1], 10);
    const minor = parseInt(v[2], 10);
    const patch = parseInt(v[3] || '0', 10);

    return { major, minor, patch };
  }
};

export const iOSVersion = detectIOSVersion();

/**
 * Check if widget camera will work correct if browser is Chrome and it's IOS
 */

const checkForChromeOnIOS = () => iOSVersion
  && ((iOSVersion.major === 14 && iOSVersion.minor >= 3) || iOSVersion.major > 14)
  && (browserName(navigator.userAgent) === 'crios' || browserName(navigator.userAgent) === 'chrome');


/**
 * Detect user browser
 */
export const browserValidation = () => {
  const neededBrowser = browserDetect();
  const currentBrowser = browserName(navigator.userAgent);

  if (checkForChromeOnIOS()) {
    return true;
  }

  if (!someBrowsersDetect()) {
    return false;
  }

  if (neededBrowser === 'safari' && currentBrowser !== 'safari' && currentBrowser !== 'ios') {
    return false;
  }

  return !(neededBrowser === 'chrome' && currentBrowser !== 'chrome');
};

/**
 * Make delay
 *
 * @async
 * @param {number} delay - delay in milliseconds
 */
export const wait = (delay) => new Promise((resolve) => {
  setTimeout(() => resolve(), delay);
});


/**
 * Throttle function
 *
 * @param {callback} callback - your function
 * @param {number} limit - your function
 */
export const throttle = (callback, limit) => {
  let pause = false;

  return () => {
    if (!pause) {
      callback.call();
      pause = true;

      setTimeout(() => {
        pause = false;
      }, limit);
    }
  };
};

/**
 * Save data store to browser storage
 */
export const loadState = () => {
  try {
    const serializedState = sessionStorage.getItem('widgetPf');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

/**
 * Save data store to browser storage
 *
 * @param {Object} state - current store
 */
export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem('widgetPf', serializedState);
  } catch {
    // ignore write errors
  }
};

/**
 * Update flow data after page reload
 *
 * @param {Object} flow - active flow
 * @param {Object} state - flow state
 */
export const mobileFlowStatusUpdate = (flow, state) => {
  flow.updateState({
    ...state,
    processStatus: '',
    lastActiveDate: Date.now(),
  }).then(() => Promise.resolve());

  setInterval(() => {
    flow.updateState({
      lastActiveDate: Date.now(),
    }).then(() => Promise.resolve());
  }, 3000);
};

/**
 * Convert centimeters to inches
 *
 * @param {number} cm - centimeters
 * @returns {number} inches value
 */
export const cm2in = (cm) => cm / 2.54;

/**
 * Check online status
 */
export const updateInternetStatus = () => {
  const $body = document.body;

  if (navigator.onLine) {
    $body.classList.remove('offline');
  } else {
    $body.classList.add('offline');
  }
};

/**
 * Close selects drops on landscape view
 */
export const closeSelectsOnResize = () => {
  const $selects = document.querySelectorAll('select');

  for (const el of $selects) {
    el.blur();
  }
};

export const filterCustomMeasurements = (measurements, customSettings) => {
  /* eslint-disable camelcase */

  if (!customSettings.outputMeasurements) return;

  const { volumetric, linear } = customSettings.outputMeasurements;
  const volume_params = {};
  const front_params = {
    soft_validation: measurements.front_params.soft_validation,
    clothes_type: measurements.front_params.clothes_type,
  };

  const side_params = {
    soft_validation: measurements.side_params.soft_validation,
    clothes_type: measurements.side_params.clothes_type,
  };

  for (const key in volumetric) {
    if (volumetric[key]) {
      volume_params[key] = measurements.volume_params[key];
    }
  }

  for (const key in linear) {
    if (linear[key]
      && measurements.front_params[key]) {
      front_params[key] = measurements.front_params[key];
    }

    if (linear[key]
      && measurements.side_params[key]) {
      side_params[key] = measurements.side_params[key];
    }
  }

  return {
    volume_params,
    side_params,
    front_params,
  };
  /* eslint-enable camelcase */
};

/**
 * Convert snake string to camel case
 * @param {string} str - snake string
 * @returns {string} - camel case value
 */
export const snakeToCamel = (str) => str.replace(
  /([-_][a-z])/g,
  (group) => group
    .toUpperCase()
    .replace('-', '')
    .replace('_', ''),
);

/**
 * Get male/female friend/table flow asset
 * @param {boolean} isTableFlow - is table flow
 * @param {string} gender - gender type
 * @param {string} role - role of asset in the page
 */
export const getAsset = (isTableFlow, gender, role) => {
  const page = snakeToCamel(window.location.hash).replace('#/', '');
  const flowType = isTableFlow ? 'tableFlow' : 'friendFlow';

  const isValid = !!(flowScreens[page]
    && gender
    && role);

  return isValid && flowScreens[page][flowType][gender][role];
};

/**
 * Return event label name
 *
 * @param {boolean} isTableFlow - centimeters
 * @returns {string} - 'alone' || 'friend'
 */
export const getGaEventLabel = (isTableFlow) => (isTableFlow ? 'alone' : 'friend');

/**
 * Returns parsed url address without previous measurements data
 *
 * @param {string} url - url address
 * @returns {string | null} - parsed url
 */
export const parseReturnUrl = (url) => {
  if (!url) return null;

  return url.split('&measurements=true')[0]
    .split('?measurements=true')[0];
};
