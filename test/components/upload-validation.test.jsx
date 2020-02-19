/* eslint-disable */
import { h, render } from 'preact';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import assertJsx from 'preact-jsx-chai';
import UploadValidation from '../../src/components/UploadValidation/UploadValidation';

chai.use(assertJsx);

describe('UploadValidation', () => {
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

  it('should render UploadValidation with validation false', () => {
    render(<UploadValidation validation={{ pose: false, body: false }} />, scratch);

    expect(scratch.innerHTML).to.contain('upload__file-validation');
    expect(scratch.innerHTML).to.contain('Correct pose');
    expect(scratch.innerHTML).to.contain('Full body');
  });

  it('should not be active if pose and body === false', () => {
    render(<UploadValidation validation={{ pose: false, body: false }} />, scratch);

    const c = scratch.querySelector('.upload__file-validation.active');

    expect(c).to.not.be.ok;
  });

  it('should be active if pose === true', () => {
    render(<UploadValidation validation={{ pose: true, body: false }} />, scratch);

    const c = scratch.querySelector('.upload__file-validation.active');

    expect(c).to.be.ok;
  });

  it('should be active if body === true', () => {
    render(<UploadValidation validation={{ pose: false, body: true }} />, scratch);

    const c = scratch.querySelector('.upload__file-validation.active');

    expect(c).to.be.ok;
  });

  it('should display pose error if pose === \'invalid\'', () => {
    render(<UploadValidation validation={{ pose: 'invalid', body: false }} />, scratch);

    const c = scratch.querySelector('li:first-child.upload__file-validation-status--invalid');

    expect(c).to.be.ok;
  });

  it('should display body error if body === \'invalid\'', () => {
    render(<UploadValidation validation={{ pose: false, body: 'invalid' }} />, scratch);

    const c = scratch.querySelector('li:last-child.upload__file-validation-status--invalid');

    expect(c).to.be.ok;
  });

});
