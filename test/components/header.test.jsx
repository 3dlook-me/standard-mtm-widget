/* eslint-disable */
import { h, render } from 'preact';
import { route } from 'preact-router';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import assertJsx from 'preact-jsx-chai';
import { Header } from '../../src/components/Header/Header';
import App from '../../src/App';
import { dispatchEvent } from '../test-utils';

chai.use(assertJsx);

describe('Header', () => {
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

  it('should render header component', () => {
    render(<Header />, scratch);

    expect(scratch.innerHTML).to.contain('Help');
    // TODO: add checking logo
    expect(scratch.innerHTML).to.contain('Close button icon');
  });

  it('should call help prop', () => {
    const spy = sinon.spy();

    render(<Header help={spy} />, scratch);

    const button = scratch.querySelector('.header__help');

    dispatchEvent(button, 'click');

    expect(spy.called).to.be.ok;
  });

  it('should send message to parent window on close', (done) => {
    let component = null;

    window.parent = window;

    const handler = (e) => {
      const c = e.data;
      expect(c.command).to.equal('saia-pf-widget.close');
      window.removeEventListener('message', handler);
      return done();
    };

    window.addEventListener('message', handler);

    render(<Header ref={ref => component = ref} />, scratch);

    component.onCloseButtonClick();
  });

});
