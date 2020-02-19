/* eslint-disable */
import { h, render } from 'preact';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import assertJsx from 'preact-jsx-chai';
import { Gender } from '../../src/components/Gender/Gender';
import { dispatchEvent } from '../test-utils';

chai.use(assertJsx);

describe('Gender', () => {
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

  it('should render gender component', () => {
    render(<Gender />, scratch);

    expect(scratch.innerHTML).to.contain('Male');
    expect(scratch.innerHTML).to.contain('Female');
  });

  it('should render gender component with invalid class', () => {
    render(<Gender />, scratch);

    expect(scratch.innerHTML).to.contain('gender--invalid');
  });

  it('should render gender component without invalid class', () => {
    render(<Gender isValid={true} />, scratch);

    expect(scratch.innerHTML).to.not.contain('gender--invalid');
  });

  it('should call change prop and pass selected gender', () => {
    let component = null;
    const spy = sinon.spy();

    render(<Gender ref={ref => component = ref} isValid={true} change={spy} />, scratch);

    const input = scratch.querySelector('input[name="gender"');

    dispatchEvent(input, 'change');

    expect(spy.called).to.be.ok;
  });

});
