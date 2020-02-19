/* eslint-disable */
import { h, render } from 'preact';
import sinon from 'sinon';
import { route } from 'preact-router';
import chai, { expect } from 'chai';
import assertJsx from 'preact-jsx-chai';
import App from '../../src/App';
import { sleep, dispatchEvent } from '../test-utils';

chai.use(assertJsx);

describe('Data', () => {
  let scratch;

  before(() => {
    scratch = document.createElement('div');
    (document.body || document.documentElement).appendChild(scratch);
  });

  beforeEach(() => {
    scratch.innerHTML = '';
  });

  after(() => {
    scratch.parentNode.removeChild(scratch);
    scratch = null;
  });

  it('should render Results component when no query params were passed', () => {
    render(<App />, scratch);

    route('/results');

    expect(scratch.innerHTML).to.contain('OOPS, SOMETHING WENT WRONG…');
    expect(scratch.innerHTML).to.contain('We can’t find your Perfect Fit for this item.');
    expect(scratch.innerHTML).to.contain('Please try out other items.');
    expect(scratch.innerHTML).to.contain('Size recommendations for other products are now available.');
    expect(scratch.innerHTML).to.contain('back to store');
  });

  it('should display product info with tight size', () => {
    render(<App />, scratch);

    route('/results?product_description=product_description&image=https://product_image.com/&tight=S');

    const p = scratch.querySelector('.result__product.active');

    expect(p).to.be.ok;
    expect(scratch.innerHTML).to.contain(encodeURI('https://product_image.com/'));
    expect(scratch.innerHTML).to.contain('For this product:');
    expect(scratch.innerHTML).to.contain('<p class="result__product-desc">product_description</p>');
  });

  it('should display product info with normal size', () => {
    render(<App />, scratch);

    route('/results?product_description=product_description&image=https://product_image.com/&normal=M');

    const p = scratch.querySelector('.result__product.active');

    expect(p).to.be.ok;
    expect(scratch.innerHTML).to.contain(encodeURI('https://product_image.com/'));
    expect(scratch.innerHTML).to.contain('For this product:');
    expect(scratch.innerHTML).to.contain('<p class="result__product-desc">product_description</p>');
  });

  it('should display product info with loose size', () => {
    render(<App />, scratch);

    route('/results?product_description=product_description&image=https://product_image.com/&loose=L');

    const p = scratch.querySelector('.result__product.active');

    expect(p).to.be.ok;
    expect(scratch.innerHTML).to.contain(encodeURI('https://product_image.com/'));
    expect(scratch.innerHTML).to.contain('For this product:');
    expect(scratch.innerHTML).to.contain('<p class="result__product-desc">product_description</p>');
  });

  it('should display tight size', () => {
    render(<App />, scratch);

    route('/results?tight=S');

    const p = scratch.querySelector('.result__size-not-found.active');

    expect(p).to.be.not.ok;

    const size = scratch.querySelector('.result__size--tight.active');
    expect(size).to.be.ok;
  });

  it('should display normal size', () => {
    render(<App />, scratch);

    route('/results?normal=S');

    const p = scratch.querySelector('.result__size-not-found.active');

    expect(p).to.be.not.ok;

    const size = scratch.querySelector('.result__size--normal.active');
    expect(size).to.be.ok;
  });

  it('should display loose size', () => {
    render(<App />, scratch);

    route('/results?loose=S');

    const p = scratch.querySelector('.result__size-not-found.active');

    expect(p).to.be.not.ok;

    const size = scratch.querySelector('.result__size--loose.active');
    expect(size).to.be.ok;
  });

  it('should send message to parent window on back to store', (done) => {
    window.parent = window;

    const handler = (e) => {
      const c = e.data;
      expect(c.command).to.equal('saia-pf-widget.close');
      window.removeEventListener('message', handler);
      return done();
    };

    window.addEventListener('message', handler);

    render(<App />, scratch);

    route('/results?loose=S');

    const button = scratch.querySelector('.screen--result.active .button');

    dispatchEvent(button, 'click');
  });

});
