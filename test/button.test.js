/* eslint-disable */
import { expect } from 'chai';
import SaiaButton from '../src/button';
import sinon from 'sinon';

window.API_HOST = 'https://saia-test.3dlook.me/api/v2/';

describe('SaiaButton', () => {

  let button = null;

  beforeEach(() => {
    const container = document.createElement('div');

    container.className = 'container';

    document.body.appendChild(container);

    button = new SaiaButton({
      container: '.container',
      key: 'test api key',
      widgetUrl: 'test widget url',
    });
  });

  it('should throw an error if container is not provided', () => {
    expect(() => new SaiaButton({ container: '' })).to.throw();
  });

  it('should throw an error if key is not provided', () => {
    expect(() => new SaiaButton({
      container: '.fake-container-selector',
      key: '',
    })).to.throw();
  });

  it('should throw an error if widgetUrl is not provided', () => {
    expect(() => new SaiaButton({
      container: '.fake-container-selector',
      key: 'fake api key',
    })).to.throw();
  });

  it('should init button', () => {
    button.init();

    const buttonEl = document.querySelector('.saia-pf-button');

    expect(buttonEl).to.be.ok;
  });

  it('should open modal for pf users', () => {
    button.init();

    const buttonEl = document.querySelector(`.saia-pf-button--${button.defaults.id}`);
    const iframe = document.querySelector('.saia-pf-drop iframe');
    button.defaults.brand = 'Nike';
    button.defaults.bodyPart = 'top';

    buttonEl.click();

    expect(iframe.getAttribute('src').indexOf(`brand=${button.defaults.brand}`) !== -1).to.be.true;
    expect(iframe.getAttribute('src').indexOf(`body_part=${button.defaults.bodyPart}`) !== -1).to.be.true;
  });

  it('should open modal for shopify users', () => {
    button.init();

    const buttonEl = document.querySelector(`.saia-pf-button--${button.defaults.id}`);
    const iframe = document.querySelector('.saia-pf-drop iframe');

    button.defaults.product.url = 'fake-product-url';
    button.defaults.product.description = 'fake-product-description';
    button.defaults.product.imageUrl = 'fake-product-image-url';

    buttonEl.click();

    expect(iframe.getAttribute('src').indexOf(`brand=${button.defaults.brand}`) === -1).to.be.true;
    expect(iframe.getAttribute('src').indexOf(`body_part=${button.defaults.bodyPart}`) === -1).to.be.true;

    expect(iframe.getAttribute('src').indexOf(`product=${button.defaults.product.url}`) !== -1).to.be.true;
    expect(iframe.getAttribute('src').indexOf(`description=${button.defaults.product.description}`) !== -1).to.be.true;
    expect(iframe.getAttribute('src').indexOf(`image=${button.defaults.product.imageUrl}`) !== -1).to.be.true;
  });

  it('should toggle active class on saia-pf-widget.close message', () => {
    button.init();

    const modal = document.querySelector('.saia-pf-drop');
    modal.classList.toggle('active')
    expect(modal.classList.contains('active')).to.be.true;

    const event = new MessageEvent('message', {
      data: {
        data: '',
        command: 'saia-pf-widget.close',
      },
    });

    window.dispatchEvent(event);

    expect(modal.classList.contains('active')).to.be.false;
  });

  it('should save to localStorage data on saia-pf-widget.data message', () => {
    button.init();

    const event = new MessageEvent('message', {
      data: {
        data: 'test',
        command: 'saia-pf-widget.data',
      },
    });

    window.dispatchEvent(event);

    expect(JSON.parse(localStorage.getItem('saia-pf-widget-data'))).to.equal('test');

    localStorage.removeItem('saia-pf-widget-data');
  });

  it('should display size on saia-pf-widget.recommendations message', () => {
    button.init();

    const fakeRecomendations = { normal: 'S' };

    const buttonEl = document.querySelector('.saia-pf-button');

    const event = new MessageEvent('message', {
      data: {
        data: fakeRecomendations,
        command: 'saia-pf-widget.recommendations',
      },
    });

    window.dispatchEvent(event);

    expect(buttonEl.innerHTML).to.equal(`YOUR PERFECT FIT: ${fakeRecomendations.normal}`);
  });

  it('should check button visibility for one product', async () => {
    button.init();

    const fake = sinon.fake.resolves({ widget_is_visible: true });

    sinon.replace(button.api.product, 'get', fake);

    const visibility = await button.checkButtonVisibility();

    expect(visibility).to.be.true;
  });

  it('should check button visibility for array of products', async () => {
    button.init();

    const fake = sinon.fake.resolves([{ widget_is_visible: true }]);

    sinon.replace(button.api.product, 'get', fake);

    const visibility = await button.checkButtonVisibility();

    expect(visibility).to.be.true;
  });

  it('should not check button visibility if brand and bodyPart are provided', async () => {
    button.init();
    button.defaults.brand = 'Nike';
    button.defaults.bodyPart = 'top';

    const fake = sinon.fake.resolves([{ widget_is_visible: true }]);

    sinon.replace(button.api.product, 'get', fake);

    const visibility = await button.checkButtonVisibility();

    expect(visibility).to.be.undefined;
  });

  it('should return null if there is no presaved data', async () => {
    button.init();

    const recomendations = await button.getSize();

    expect(recomendations).to.be.null;
  });

  it('should return recomendations for shopify users', async () => {
    button.init();
    button.defaults.product.url = 'fake url';

    const fake = sinon.fake.resolves({
      normal: {
        size: 'S',
      },
    });

    sinon.replace(button.api.product, 'getRecommendations', fake);

    localStorage.setItem('saia-pf-widget-data', JSON.stringify({ chest: 1, waist: 2, hips: 3 }));

    const recomendations = await button.getSize();

    expect(recomendations).to.eqls({ normal: 'S' });
  });

  it('should return recomendations for pf users', async () => {
    button.init();
    button.defaults.brand = 'Nike';
    button.defaults.bodyPart = 'top';

    const fake = sinon.fake.resolves({
      normal: {
        size: 'S',
      },
    });

    sinon.replace(button.api.sizechart, 'getSize', fake);

    localStorage.setItem('saia-pf-widget-data', JSON.stringify({ chest: 1, waist: 2, hips: 3 }));

    const recomendations = await button.getSize();

    expect(recomendations).to.eqls({ normal: 'S' });
  });

});
