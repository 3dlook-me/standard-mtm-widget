import {
  parseHashParams,
  isMobileDevice,
  getHeightCm,
  getWeightKg,
  getWeightLb,
} from './helpers/utils';
import FlowService from './services/flowService';

require('./scss/components/_saia-button.scss');
const buttonTemplate = require('./templates/button.html');
const modalTemplate = require('./templates/modal-drop.html');

let uid = 0;

class SaiaMTMButton {
  /**
   * SaiaMTMButton constructor
   *
   * @param {Object} options - parameters
   * @param {string} options.container - selector for button container
   * @param {string} options.publicKey - user's public key
   * @param {string} [options.widgetUrl] - url to the widget host to open it in the iframe
   * @param {number|string} [options.id] - unique id of the button
   * @param {string} [options.returnUrl] - product page url on which user will be redirected
   * after he pressing close button at results screen after he complite the mobile flow
   * @param {string} [options.returnUrlDesktop] - should widget open returnUrl on desktop or not
   * @param {string} [options.buttonTitle] - shoify product id
   * @param {Object} [options.defaultValues] - default values for some widget fields
   * @param {string} [options.defaultValues.email] - default value for email field
   * @param {number} [options.defaultValues.heightCm] - default value for height in centimeters.
   * Will also set units field to 'cm'.
   * @param {number} [options.defaultValues.heightFt] - default value for height in feet and
   * inches. Contains feet part. Should be used in combination with heightIn.
   * Will also set units field to 'in'.
   * @param {number} [options.defaultValues.heightIn] - default value for height in feet and
   * inches. Contains inches part. Should be used in combination with heightFt.
   * Will also set units field to 'in'.
   * @param {number} [options.defaultValues.weight] - default value for weight field.
   * If you set heightCm, then weight should contain value in kilograms.
   * If you set heightFt and heightIn, then weight should contain value in pounds.
   * @param {Object} options.customSettings - users widget custom settings
   * @param {Object} options.customSettings.button_background_color - button bg color
   * @param {Object} options.customSettings.button_border_color - button border color
   * @param {Object} options.customSettings.button_text_color - button text color

   */
  constructor(options) {
    uid += 1;

    const globalOptions = window.MTM_WIDGET_OPTIONS || {};

    this.defaults = {
      container: '.saia-widget-container',
      publicKey: '',
      widgetUrl: (typeof WIDGET_HOST !== 'undefined') ? WIDGET_HOST : '',
      returnUrl: `${window.location.origin}${window.location.pathname}`,
      returnUrlDesktop: false,
      buttonTitle: 'GET MEASURED',
      defaultValues: {
        email: null,
        heightCm: null,
        heightFt: null,
        heightIn: null,
        weight: null,
        ...globalOptions,
        ...options,
      },
      onMeasurementsReady: () => {},
      ...globalOptions,
      ...options,
      id: uid,
    };

    if (!this.defaults.publicKey) {
      throw new Error('Please provide a public key');
    }

    if (!this.defaults.container) {
      throw new Error('Please provide a container CSS selector');
    }

    if (!this.defaults.widgetUrl) {
      throw new Error('Please provide a widget url');
    }

    this.buttonEl = null;
    this.buttonTextEl = null;
    this.buttonPreloaderEl = null;
  }

  /**
   * Init widget
   */
  init() {
    this.checkGetParamsForMeasurements();
    const buttonClasses = `saia-mtm-button--${this.defaults.id}`;
    const buttonTemplateClasses = buttonTemplate
      .replace('{{classes}}', buttonClasses)
      .replace('{{buttonTitle}}', this.defaults.buttonTitle);
    const container = document.querySelector(this.defaults.container);
    container.insertAdjacentHTML('beforeend', buttonTemplateClasses);

    // check if modal container is exists
    let modal = document.querySelector('.saia-mtm-drop');
    if (!modal) {
      // append modal drop to body
      document.body.insertAdjacentHTML('beforeend', modalTemplate);
    }

    // get modal and button elements by their selectors
    modal = document.querySelector('.saia-mtm-drop');
    this.modal = modal;
    this.buttonEl = document.querySelector(`.saia-mtm-button--${this.defaults.id}`);
    this.buttonEl.type = 'button';
    this.buttonTextEl = this.buttonEl.querySelector('.saia-mtm-button__text');
    this.buttonPreloaderEl = this.buttonEl.querySelector('.saia-mtm-button__preloader');

    if (this.defaults.customSettings) {
      this.setCustomSettings();
    }

    this.buttonEl.addEventListener('click', async () => { await this.showWidget(); });

    window.addEventListener('message', (event) => {
      const { command, data } = event.data;
      const currentData = JSON.parse(localStorage.getItem('saia-pf-widget-data'));

      switch (command) {
        case 'saia-pf-widget.close':
          this.modal.classList.remove('active');
          this.modal.querySelector('iframe').src = '';
          break;
        case 'saia-pf-widget.data':
          if (this.defaults.onMeasurementsReady) {
            this.defaults.onMeasurementsReady(data);
          }

          if (currentData
            && currentData.persons
            && !currentData.persons.includes(data.personId)) {
            data.persons = [
              ...currentData.persons,
              currentData.personId,
            ];
          } else {
            data.persons = [
              data.personId,
            ];
          }

          localStorage.setItem('saia-pf-widget-data', JSON.stringify(data));
          break;
        case 'saia-pf-widget.recommendations':
          this.displaySize(data);
          break;

        default:
          break;
      }
    }, false);

    this.isMobile = isMobileDevice();
  }

  /* eslint class-methods-use-this: off */
  /**
   * Get persons data from get parameters and save them to localStorage
   */
  checkGetParamsForMeasurements() {
    const params = parseHashParams();

    if (params.chest
      && params.height
      && params.hips
      && params.waist
      && params.gender) {
      const data = {
        hips: parseFloat(params.hips),
        chest: parseFloat(params.chest),
        waist: parseFloat(params.waist),
        gender: params.gender,
        height: parseFloat(params.height),
        personId: parseFloat(params.personId),
      };

      // optional params
      if (params.inseam) {
        data.inseam = parseFloat(params.inseam);
      }

      if (params.low_hips) {
        data.low_hips = parseFloat(params.low_hips);
      }

      if (params.thigh) {
        data.thigh = parseFloat(params.thigh);
      }

      localStorage.setItem('saia-pf-widget-data', JSON.stringify(data));
    }
  }

  /**
   * Show widget
   */
  async showWidget() {
    this.buttonEl.classList.add('saia-mtm-button--pending');

    const { publicKey } = this.defaults;
    const uuid = await SaiaMTMButton.createWidget(publicKey, this.defaults);

    this.buttonEl.classList.remove('saia-mtm-button--pending');

    if (!this.isMobile) {
      this.modal.classList.toggle('active');
    }

    let url = `${this.defaults.widgetUrl}?key=${uuid}#/?origin=${window.location.origin}&returnUrl=${this.defaults.returnUrl}&returnUrlDesktop=${this.defaults.returnUrlDesktop}`;

    if (this.defaults.photosFromGallery) {
      url += `&photosFromGallery=${this.defaults.photosFromGallery}`;
    }

    if (!this.isMobile) {
      this.modal.querySelector('iframe').src = url;
    } else {
      window.location = url;
    }
  }

  /**
   * Display sizes on the button
   *
   * @param {Object} recomendations - size recomendations transformed object
   */
  displaySize(recomendations) {
    if (recomendations) {
      this.buttonEl.innerHTML = `<span>YOUR PERFECT FIT: ${recomendations.normal}</span>`;
    }
  }

  static async createWidget(publicKey, options = {}) {
    const { defaultValues } = options;

    // default values
    const defaultHeightCm = (defaultValues) ? defaultValues.heightCm : null;
    const defaultHeightFt = (defaultValues) ? defaultValues.heightFt : null;
    const defaultHeightIn = (defaultValues) ? defaultValues.heightIn : null;
    const defaultWeight = (defaultValues) ? defaultValues.weight : null;
    const defaultEmail = (defaultValues) ? defaultValues.email : null;

    // get units for default values
    let units = 'in';
    if (defaultHeightCm) {
      units = 'cm';
    }

    // convert default height in ft/in to cm
    let height = parseInt(defaultHeightCm, 10);
    if (typeof defaultHeightFt === 'number' && typeof defaultHeightIn === 'number') {
      height = Math.round(getHeightCm(defaultHeightFt, defaultHeightIn));
    }

    // convert weight to kg
    const defaultWeightNumber = parseInt(defaultWeight, 10);
    let weightKg;
    let weightLb;

    if (units === 'in') {
      weightKg = getWeightKg(defaultWeightNumber);
      weightLb = defaultWeightNumber;
    } else {
      weightKg = defaultWeightNumber;
      weightLb = getWeightLb(defaultWeightNumber);
    }

    const flowService = new FlowService(publicKey);
    const widget = await flowService.create({
      // save default values
      units,
      height,
      email: defaultEmail,
      weight: weightKg,
      weightLb,
    });
    const { uuid } = widget;

    return Promise.resolve(uuid);
  }

  /**
   * Set custom colors
   */
  setCustomSettings() {
    const {
      button_background_color,
      button_border_color,
      button_text_color,
    } = this.defaults.customSettings;

    if (button_background_color) {
      this.buttonEl.style.backgroundColor = button_background_color;
    }

    if (button_border_color) {
      this.buttonEl.style.borderColor = button_border_color;
    }

    if (button_text_color) {
      this.buttonEl.style.color = button_text_color;
      this.buttonEl.querySelectorAll('svg path')[0]
        .style.fill = button_text_color;
    }
  }

  /**
   * Check if widget button should be shown on the page and get custom settings
   *
   * @param {string} publicKey - user public key
   */
  static getWidgetInfo(publicKey) {
    const flowService = new FlowService(publicKey);
    const isWidgetAllowed = flowService.isWidgetAllowed();
    const customSettings = flowService.getCustomSettings();

    return Promise.all([isWidgetAllowed, customSettings]);
  }
}

window.SaiaMTMButton = SaiaMTMButton;

export default SaiaMTMButton;
