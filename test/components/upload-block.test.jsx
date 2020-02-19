/* eslint-disable */
import { h, render } from 'preact';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import assertJsx from 'preact-jsx-chai';
import { UploadBlock } from '../../src/components/UploadBlock/UploadBlock';

chai.use(assertJsx);

describe('UploadBlock', () => {
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

  it('should render UploadBlock component for front image file', () => {
    render(<UploadBlock type={'front'} gender={'male'} validation={{ pose: false, body: false }} />, scratch);

    expect(scratch.innerHTML).to.contain('upload__file-block');
    expect(scratch.innerHTML).to.contain('Front');
    expect(scratch.innerHTML).to.contain('upload__file-title');
    expect(scratch.innerHTML).to.contain('upload__file');
    expect(scratch.innerHTML).to.contain('upload__file-validation');
  });

  it('should render UploadBlock component for side image file', () => {
    render(<UploadBlock type={'side'} gender={'male'} validation={{ pose: false, body: false }} />, scratch);

    expect(scratch.innerHTML).to.contain('upload__file-block');
    expect(scratch.innerHTML).to.contain('Side');
    expect(scratch.innerHTML).to.contain('upload__file-title');
    expect(scratch.innerHTML).to.contain('upload__file');
    expect(scratch.innerHTML).to.contain('upload__file-validation');
  });

  it('should call change prop', () => {
    let component = null;
    const spy = sinon.spy();
    render(<UploadBlock change={spy} ref={(ref) => component = ref} type={'side'} gender={'male'} validation={{ pose: false, body: false }} />, scratch);

    component.fileChange();

    expect(spy.called).to.be.ok;
  });

});
