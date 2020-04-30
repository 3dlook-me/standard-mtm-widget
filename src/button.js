import API from '@3dlook/saia-sdk/lib/api';

import {
  transformRecomendations,
  parseHashParams,
  isMobileDevice,
  send,
} from './helpers/utils';

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
   * @param {string} options.key - SAIA PF API key
   * @param {string} [options.widgetUrl] - url to the widget host to open it in the iframe
   * @param {string} [options.buttonStyle] - button style.
   * Could be 'gradient', 'gradient-reversed', 'black', 'white'
   * @param {Object} [options.product] - object with product parameters (optional)
   * @param {string} [options.product.description] - product description.
   * Will be displayed on final results page
   * @param {string} [options.product.imageUrl] - url to product image
   * Will be displayed on final results page
   * @param {string} [options.product.url] - url to product. For shopify usage only.
   * Instead use brand and bodyPart options to determine right sizecharts
   * @param {string} [options.brand] - brand name. If brand and bodyPart are set,
   * then product.url is ignored
   * @param {string} [options.bodyPart] - body part name. If brand and bodyPart are set,
   * then product.url is ignored
   * @param {number|string} [options.id] - unique id of the button
   * @param {string} [options.returnUrl] - product page url on which user will be redirected
   * after he pressing close button at results screen after he complite the mobile flow
   * @param {string} [options.returnUrlDesktop] - should widget open returnUrl on desktop or not
   * @param {string} [options.fakeSize] - should show fake size result page
   * @param {number} [options.productId] - shoify product id
   */
  constructor(options) {
    uid += 1;

    this.defaults = {
      buttonStyle: 'orange',
      container: '.saia-widget-container',
      key: '',
      widgetUrl: (typeof WIDGET_HOST !== 'undefined') ? WIDGET_HOST : '',
      brand: '',
      bodyPart: '',
      returnUrl: `${window.location.origin}${window.location.pathname}`,
      returnUrlDesktop: false,
      ...options,

      product: {
        description: '',
        imageUrl: '',
        url: `${window.location.origin}${window.location.pathname}`,

        ...options.product,
      },
      id: uid,
    };

    if (!this.defaults.container) {
      throw new Error('Please provide a container CSS selector');
    }

    if (!this.defaults.key) {
      throw new Error('Please provide API key');
    }

    if (!this.defaults.widgetUrl) {
      throw new Error('Please provide a widget url');
    }

    this.buttonEl = null;

    this.api = new API({
      host: `${API_HOST}/api/v2/`,
      key: this.defaults.key || API_KEY,
    });
  }

  /**
   * Init widget
   */
  init() {
    this.checkGetParamsForMeasurements();
    const buttonClasses = `saia-mtm-button--${this.defaults.id}`;
    const buttonTemplateClasses = buttonTemplate.replace('classes', buttonClasses);
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

    this.buttonEl.addEventListener('click', () => this.showWidget());

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
   * Check should we display button for current product page or not
   */
  checkButtonVisibility() {
    if (this.defaults.brand && this.defaults.bodyPart) {
      return Promise.resolve();
    }

    return this.api.product.get(this.defaults.product.url)
      .then((product) => {
        if (product.length) {
          return product[0].widget_is_visible;
        }

        if ('widget_is_visible' in product) {
          return product.widget_is_visible;
        }

        return true;
      });
  }

  /**
   * Show widget
   */
  showWidget() {
    if (!this.isMobile) {
      this.modal.classList.toggle('active');
    }

    let url = `${this.defaults.widgetUrl}?key=${this.defaults.key}#/?origin=${window.location.origin}&returnUrl=${this.defaults.returnUrl}&returnUrlDesktop=${this.defaults.returnUrlDesktop}`;

    if (this.defaults.product.url) {
      url += `&product=${this.defaults.product.url}`;
    }

    if (this.defaults.product.description) {
      url += `&product_description=${this.defaults.product.description}`;
    }

    if (this.defaults.product.imageUrl) {
      url += `&image=${this.defaults.product.imageUrl}`;
    }

    if (this.defaults.brand && this.defaults.bodyPart) {
      url += `&brand=${this.defaults.brand}`;
      url += `&body_part=${this.defaults.bodyPart}`;
    }

    if (this.defaults.fakeSize) {
      url += `&fakeSize=${this.defaults.fakeSize}`;
    }

    if (this.defaults.productId) {
      url += `&productId=${this.defaults.productId}`;
    }

    if (!this.isMobile) {
      this.modal.querySelector('iframe').src = url;
    } else {
      window.location = url;
    }
  }

  /**
   * Get size for current product if measurements presaved in localstorage
   *
   * @async
   * @returns {Object|null} recomendations
   */
  async getSize() {
    const measurements = JSON.parse(localStorage.getItem('saia-pf-widget-data'));

    if (measurements) {
      delete measurements.personId;

      let recomendations;
      let originalRecommendations;

      if (this.defaults.brand && this.defaults.bodyPart) {
        originalRecommendations = await this.api.sizechart.getSize({
          ...measurements,
          brand: this.defaults.brand,
          body_part: this.defaults.bodyPart,
        });
      } else {
        originalRecommendations = await this.api.product.getRecommendations({
          ...measurements,
          url: this.defaults.product.url,
        });
      }


      if (originalRecommendations) {
        recomendations = transformRecomendations(originalRecommendations);
      }

      return recomendations;
    }

    return null;
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
}

window.SaiaMTMButton = SaiaMTMButton;

export default SaiaMTMButton;
