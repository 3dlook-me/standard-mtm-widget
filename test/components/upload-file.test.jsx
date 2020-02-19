/* eslint-disable */
import { h, render } from 'preact';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import assertJsx from 'preact-jsx-chai';
import { UploadFile } from '../../src/components/UploadFile/UploadFile';
import { sleep, keyboardEvent, getBlob } from '../test-utils';

const photo1 = require('../__images__/photo 1.png');
const exif1 = require('../__images__/exif_1.jpg');
const exif2 = require('../__images__/exif_2.jpg');
const exif3 = require('../__images__/exif_3.jpg');
const exif4 = require('../__images__/exif_4.jpg');
const exif5 = require('../__images__/exif_5.jpg');
const exif6 = require('../__images__/exif_6.jpg');
const exif7 = require('../__images__/exif_7.jpg');
const exif8 = require('../__images__/exif_8.jpg');

chai.use(assertJsx);

describe('UploadFile', () => {
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

  it('should render UploadFile', () => {
    render(<UploadFile gender={'male'} isValid={true} type={'front'} />, scratch);

    expect(scratch.innerHTML).to.contain('upload__file');
    expect(scratch.innerHTML).to.contain('upload__file-select-text');
    expect(scratch.innerHTML).to.contain('select file');
    expect(scratch.innerHTML).to.contain('front-male');
  });

  it('should display front-male.svg for gender===male and type===front', () => {
    render(<UploadFile gender={'male'} isValid={true} type={'front'} />, scratch);

    expect(scratch.innerHTML).to.contain('front-male');
  });

  it('should display side-male.svg for gender===male and type===side', () => {
    render(<UploadFile gender={'male'} isValid={true} type={'side'} />, scratch);

    expect(scratch.innerHTML).to.contain('side-male');
  });

  it('should display front-female.svg for gender===female and type===front', () => {
    render(<UploadFile gender={'female'} isValid={true} type={'front'} />, scratch);

    expect(scratch.innerHTML).to.contain('front-female');
  });

  it('should display side-female.svg for gender===female and type===side', () => {
    render(<UploadFile gender={'female'} isValid={true} type={'side'} />, scratch);

    expect(scratch.innerHTML).to.contain('side-female');
  });

  it('should display placeholder image when mode===placeholder', async () => {
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'female'} isValid={true} type={'side'} />, scratch);

    component.setState({
      ...component.state,
      mode: 'placeholder',
    });

    await sleep(1);

    const c = scratch.querySelector('.upload__file-image.upload__file-image--placeholder.active');

    expect(c).to.be.ok;
  });

  it('should display placeholder image when mode===preview', async () => {
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'female'} isValid={true} type={'side'} />, scratch);

    component.setState({
      ...component.state,
      mode: 'preview',
    });

    await sleep(1);

    const c = scratch.querySelector('.upload__file-image.upload__file-image--preview.active');

    expect(c).to.be.ok;
  });

  it('should call keyboardAccess on space', () => {
    render(<UploadFile gender={'female'} isValid={true} type={'side'} />, scratch);

    const c = scratch.querySelector('.upload__file');

    keyboardEvent(c, 'keypress', {
      char: 'enter',
      key: 'enter',
      keyCode: 32,
    });

    expect(c).to.be.ok;
  });

  it('should call keyboardAccess on enter', () => {
    render(<UploadFile gender={'female'} isValid={true} type={'side'} />, scratch);

    const c = scratch.querySelector('.upload__file');

    keyboardEvent(c, 'keypress', {
      char: 'enter',
      key: 'enter',
      keyCode: 13,
    });

    expect(c).to.be.ok;
  });

  it('should disable dragover event', () => {
    render(<UploadFile gender={'male'} isValid={true} type={'front'} />, scratch);

    const c = scratch.querySelector('.upload__file');

    const event = new DragEvent('dragover');
    const spy1 = sinon.spy(event, 'preventDefault');
    const spy2 = sinon.spy(event, 'stopPropagation');

    c.dispatchEvent(event);

    expect(spy1.calledOnce).to.be.true;
    expect(spy2.calledOnce).to.be.true;
  });

  it('should disable dragleave event', () => {
    render(<UploadFile gender={'male'} isValid={true} type={'front'} />, scratch);

    const c = scratch.querySelector('.upload__file');

    const event = new DragEvent('dragleave');
    const spy1 = sinon.spy(event, 'preventDefault');
    const spy2 = sinon.spy(event, 'stopPropagation');

    c.dispatchEvent(event);

    expect(spy1.calledOnce).to.be.true;
    expect(spy2.calledOnce).to.be.true;
  });

  it('should handle drop event', async () => {
    let component = null;
    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const event = {
      preventDefault: () => {},
      dataTransfer: {
        files: ['fake file'],
      },
    };
    const fake = sinon.fake.resolves();
    sinon.replace(component, 'saveFile', fake);

    await component.dropImage(event);

    expect(fake.calledWithExactly('fake file')).to.be.true;
  });

  it('should return undefined if no file was provided', async () => {
    let component = null;
    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const r = await component.saveFile();

    expect(r).to.be.undefined;
  });

  it('should return undefined if no file was provided', async () => {
    let component = null;
    const changeSpy = sinon.spy();

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} change={changeSpy} />, scratch);

    const getOrientationSpy = sinon.fake.resolves(1);
    sinon.replace(component, 'getOrientation', getOrientationSpy);
    const loadPhotoSpy = sinon.fake.resolves('fake base64 file');
    sinon.replace(component, 'loadPhoto', loadPhotoSpy);

    await component.saveFile('fake file');

    expect(getOrientationSpy.calledWithExactly('fake file')).to.be.true;
    expect(loadPhotoSpy.calledWithExactly('fake file', 1)).to.be.true;
    expect(changeSpy.calledOnce).to.be.true;
    expect(changeSpy.calledWithExactly({
      file: 'fake base64 file',
      fileBlob: 'fake file',
      mode: 'preview',
    })).to.be.true;
  });

  it('should handle change event', async () => {
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const event = {
      preventDefault: () => {},
      target: {
        files: ['fake file'],
      },
    };
    const fake = sinon.fake.resolves();
    sinon.replace(component, 'saveFile', fake);

    await component.onChange(event);

    expect(fake.calledWithExactly('fake file')).to.be.true;
  });

  it('should get image orientation - exif flag 1', async () => {
    const blob = await getBlob(exif1);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);

    expect(orientation).to.be.equal(1);
  });

  it('should get image orientation - exif flag 2', async () => {
    const blob = await getBlob(exif2);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);

    expect(orientation).to.be.equal(2);
  });

  it('should get image orientation - exif flag 3', async () => {
    const blob = await getBlob(exif3);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);

    expect(orientation).to.be.equal(3);
  });

  it('should get image orientation - exif flag 4', async () => {
    const blob = await getBlob(exif4);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);

    expect(orientation).to.be.equal(4);
  });

  it('should get image orientation - exif flag 5', async () => {
    const blob = await getBlob(exif5);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);

    expect(orientation).to.be.equal(5);
  });

  it('should get image orientation - exif flag 6', async () => {
    const blob = await getBlob(exif6);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);

    expect(orientation).to.be.equal(6);
  });

  it('should get image orientation - exif flag 7', async () => {
    const blob = await getBlob(exif7);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);

    expect(orientation).to.be.equal(7);
  });

  it('should get image orientation - exif flag 8', async () => {
    const blob = await getBlob(exif8);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);

    expect(orientation).to.be.equal(8);
  });

  it('should not get image orientation flag for normal image', async () => {
    const blob = await getBlob(photo1);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);

    expect(orientation).to.be.equal(-2);
  });

  it('should transform image if EXIF flag === 1', async () => {
    const blob = await getBlob(exif1);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);
    const base64 = await component.loadPhoto(blob, orientation);

    expect(base64).to.be.string;
    expect(base64.indexOf('base64') !== -1).to.be.true;
  });

  it('should transform image if EXIF flag === 2', async () => {
    const blob = await getBlob(exif2);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);
    const base64 = await component.loadPhoto(blob, orientation);

    expect(base64).to.be.string;
    expect(base64.indexOf('base64') !== -1).to.be.true;
  });

  it('should transform image if EXIF flag === 3', async () => {
    const blob = await getBlob(exif3);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);
    const base64 = await component.loadPhoto(blob, orientation);

    expect(base64).to.be.string;
    expect(base64.indexOf('base64') !== -1).to.be.true;
  });

  it('should transform image if EXIF flag === 4', async () => {
    const blob = await getBlob(exif4);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);
    const base64 = await component.loadPhoto(blob, orientation);

    expect(base64).to.be.string;
    expect(base64.indexOf('base64') !== -1).to.be.true;
  });

  it('should transform image if EXIF flag === 5', async () => {
    const blob = await getBlob(exif5);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);
    const base64 = await component.loadPhoto(blob, orientation);

    expect(base64).to.be.string;
    expect(base64.indexOf('base64') !== -1).to.be.true;
  });

  it('should transform image if EXIF flag === 6', async () => {
    const blob = await getBlob(exif6);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);
    const base64 = await component.loadPhoto(blob, orientation);

    expect(base64).to.be.string;
    expect(base64.indexOf('base64') !== -1).to.be.true;
  });

  it('should transform image if EXIF flag === 7', async () => {
    const blob = await getBlob(exif7);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);
    const base64 = await component.loadPhoto(blob, orientation);

    expect(base64).to.be.string;
    expect(base64.indexOf('base64') !== -1).to.be.true;
  });

  it('should transform image if EXIF flag === 8', async () => {
    const blob = await getBlob(exif8);
    let component = null;

    render(<UploadFile ref={(ref) => component = ref} gender={'male'} isValid={true} type={'front'} />, scratch);

    const orientation = await component.getOrientation(blob);
    const base64 = await component.loadPhoto(blob, orientation);

    expect(base64).to.be.string;
    expect(base64.indexOf('base64') !== -1).to.be.true;
  });

});
