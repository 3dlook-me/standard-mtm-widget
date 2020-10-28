import {
  parseHashParams,
  isMobileDevice,
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
   */
  constructor(options) {
    uid += 1;

    this.defaults = {
      container: '.saia-widget-container',
      publicKey: '',
      widgetUrl: (typeof WIDGET_HOST !== 'undefined') ? WIDGET_HOST : '',
      returnUrl: `${window.location.origin}${window.location.pathname}`,
      returnUrlDesktop: false,
      buttonTitle: 'GET MEASURED',
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
    const uuid = await this.createWidget(publicKey);

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

  /**
   * Create widget flow object
   *
   * @param {string} publicKey - user public key
   */
  async createWidget(publicKey) {
    const flowService = new FlowService(publicKey);
    const widget = await flowService.create();
    const { uuid } = widget;

    return Promise.resolve(uuid);
  }

  /**
   * Check if widget button should be shown on the page
   *
   * @param {string} publicKey - user public key
   */
  static async isWidgetAllowed(publicKey) {
    const flowService = new FlowService(publicKey);
    const isWidgetAllowed = await flowService.isWidgetAllowed();

    return Promise.resolve(isWidgetAllowed);
  }
}

window.SaiaMTMButton = SaiaMTMButton;

export default SaiaMTMButton;
