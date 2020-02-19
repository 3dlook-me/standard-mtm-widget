/* eslint-disable */
import { h, render } from 'preact';
import sinon from 'sinon';
import { route, Router } from 'preact-router';
import chai, { expect } from 'chai';
import assertJsx from 'preact-jsx-chai';
import App from '../../src/App';
import { Upload } from '../../src/containers/Upload/Upload';
import { sleep, dispatchEvent } from '../test-utils';

chai.use(assertJsx);

window.API_HOST = 'https://saia-test.3dlook.me/api/v2/';
window.API_KEY = 'uweh721gt7723trv';

describe('Upload', () => {
  let scratch;
  let mount;
  let component = null;

  before(() => {
    scratch = document.createElement('div');
    (document.body || document.documentElement).appendChild(scratch);
  });

  beforeEach(() => {
    scratch.innerHTML = '';

    render(<Router>
      <Upload path="/upload" ref={(ref) => component = ref} />
    </Router>, scratch);

    route('/upload');
  });

  after(() => {
    scratch.parentNode.removeChild(scratch);
    scratch = null;
  });

  it('should render Upload component', () => {
    expect(scratch.innerHTML).to.contain('YOU’RE ALMOST THERE');
    expect(scratch.innerHTML).to.contain('Please upload two full body');
    expect(scratch.innerHTML).to.contain('get your size');
  });

  it('should save front image file to state', () => {
    const file = 'fake file';
    component.saveFrontFile({ file });
    expect(component.state.frontImage).to.equal(file);
  });

  it('should save side image file to state', () => {
    const file = 'fake file';
    component.saveSideFile({ file });
    expect(component.state.sideImage).to.equal(file);
  });

  it('should return undefined if there is no frontImage', async () => {
    const r = await component.onNextButtonClick(new Event('click'));
    expect(r).to.be.undefined;
  });

  it('should return undefined if there is no sideImage', async () => {
    const file = 'fake file';
    component.saveSideFile({ file });
    const r = await component.onNextButtonClick(new Event('click'));
    expect(r).to.be.undefined;
  });

  it('should go to the next page for enterprise users', async () => {
    route('/upload?body_part=top&brand=Nike');

    const file = 'fake file';
    component.saveFrontFile({ file });
    component.saveSideFile({ file });

    component.setState({
      ...component.state,
      height: 180,
      gender: 'male',
    });

    const fakePersonCreate = sinon.fake.resolves('fake task set url');
    sinon.replace(component.api.person, 'create', fakePersonCreate);

    const fakeGetResults = sinon.fake.resolves({
      volume_params: {
        high_hips: 1,
        chest: 2,
        waist: 3,
      },
    });
    sinon.replace(component.api.queue, 'getResults', fakeGetResults);

    const fakeGetSize = sinon.fake.resolves({
      normal: {
        size: 'M',
      },
    });
    sinon.replace(component.api.sizechart, 'getSize', fakeGetSize);

    await component.onNextButtonClick(new Event('click'));
    expect(fakePersonCreate.alwaysCalledWithExactly({
      gender: 'male',
      height: 180,
      frontImage: 'fake file',
      sideImage: 'fake file',
    })).to.be.true;
    expect(fakeGetResults.alwaysCalledWithExactly('fake task set url')).to.be.true;
    expect(fakeGetSize.alwaysCalledWithExactly({
      gender: 'male',
      hips: 1,
      chest: 2,
      waist: 3,
      brand: 'Nike',
      body_part: 'top',
    })).to.be.true;

    expect(window.location.hash.substr(1).indexOf('body_part=top') !== -1).to.be.true;
    expect(window.location.hash.substr(1).indexOf('brand=Nike') !== -1).to.be.true;
    expect(window.location.hash.substr(1).indexOf('normal=M') !== -1).to.be.true;
  });

  it('should go to the next page for shopify users', async () => {
    route('/upload?product=fake_product_url');

    const file = 'fake file';
    component.saveFrontFile({ file });
    component.saveSideFile({ file });

    component.setState({
      ...component.state,
      height: 180,
      gender: 'male',
    });

    const fakePersonCreate = sinon.fake.resolves('fake task set url');
    sinon.replace(component.api.person, 'create', fakePersonCreate);

    const fakeGetResults = sinon.fake.resolves({
      volume_params: {
        high_hips: 1,
        chest: 2,
        waist: 3,
      },
    });
    sinon.replace(component.api.queue, 'getResults', fakeGetResults);

    const fakeGetSize = sinon.fake.resolves({
      normal: {
        size: 'M',
      },
    });
    sinon.replace(component.api.product, 'getRecommendations', fakeGetSize);

    await component.onNextButtonClick(new Event('click'));
    expect(fakePersonCreate.alwaysCalledWithExactly({
      gender: 'male',
      height: 180,
      frontImage: 'fake file',
      sideImage: 'fake file',
    })).to.be.true;
    expect(fakeGetResults.alwaysCalledWithExactly('fake task set url')).to.be.true;
    expect(fakeGetSize.alwaysCalledWithExactly({
      gender: 'male',
      hips: 1,
      chest: 2,
      waist: 3,
      url: 'fake_product_url',
    })).to.be.true;

    expect(window.location.hash.substr(1).indexOf('product=fake_product_url') !== -1).to.be.true;
    expect(window.location.hash.substr(1).indexOf('normal=M') !== -1).to.be.true;
  });

  it('should handle regular error', async () => {
    const file = 'fake file';
    component.saveFrontFile({ file });
    component.saveSideFile({ file });

    component.setState({
      ...component.state,
      height: 180,
      gender: 'male',
    });

    const fakePersonCreate = sinon.fake.throws();
    sinon.replace(component.api.person, 'create', fakePersonCreate);

    const fakeAlert = sinon.spy(window, 'alert');

    await component.onNextButtonClick(new Event('click'));

    expect(fakeAlert.calledOnce).to.be.true;
    fakeAlert.restore();
  });

  it('should handle back end validation error - detail', async () => {
    const file = 'fake file';
    component.saveFrontFile({ file });
    component.saveSideFile({ file });

    component.setState({
      ...component.state,
      height: 180,
      gender: 'male',
    });

    const error = new Error('Test error');
    error.response = {
      data: {
        detail: 'error about detail',
      },
    };
    const fakePersonCreate = sinon.fake.throws(error);
    sinon.replace(component.api.person, 'create', fakePersonCreate);

    const fakeAlert = sinon.spy(window, 'alert');

    await component.onNextButtonClick(new Event('click'));

    expect(fakeAlert.calledOnce).to.be.true;
    expect(fakeAlert.calledWithExactly('error about detail')).to.be.true;
    fakeAlert.restore();
  });

  it('should handle back end validation error - brand', async () => {
    const file = 'fake file';
    component.saveFrontFile({ file });
    component.saveSideFile({ file });

    component.setState({
      ...component.state,
      height: 180,
      gender: 'male',
    });

    const error = new Error('Test error');
    error.response = {
      data: {
        brand: 'error about brand',
      },
    };
    const fakePersonCreate = sinon.fake.throws(error);
    sinon.replace(component.api.person, 'create', fakePersonCreate);

    const fakeAlert = sinon.spy(window, 'alert');

    await component.onNextButtonClick(new Event('click'));

    expect(fakeAlert.calledOnce).to.be.true;
    expect(fakeAlert.calledWithExactly('error about brand')).to.be.true;
    fakeAlert.restore();
  });

  it('should handle back end validation error - body_part', async () => {
    const file = 'fake file';
    component.saveFrontFile({ file });
    component.saveSideFile({ file });

    component.setState({
      ...component.state,
      height: 180,
      gender: 'male',
    });

    const error = new Error('Test error');
    error.response = {
      data: {
        body_part: 'error about body_part',
      },
    };
    const fakePersonCreate = sinon.fake.throws(error);
    sinon.replace(component.api.person, 'create', fakePersonCreate);

    const fakeAlert = sinon.spy(window, 'alert');

    await component.onNextButtonClick(new Event('click'));

    expect(fakeAlert.calledOnce).to.be.true;
    expect(fakeAlert.calledWithExactly('error about body_part')).to.be.true;
    fakeAlert.restore();
  });

  it('should handle 400 error', async () => {
    const file = 'fake file';
    component.saveFrontFile({ file });
    component.saveSideFile({ file });

    component.setState({
      ...component.state,
      height: 180,
      gender: 'male',
    });

    const error = new Error('Test error');
    error.response = {
      status: 400,
    };
    const fakePersonCreate = sinon.fake.throws(error);
    sinon.replace(component.api.person, 'create', fakePersonCreate);

    await component.onNextButtonClick(new Event('click'));

    expect(window.location.hash.substr(1)).to.equal('/results');
  });

  it('should handle image validation errors', async () => {
    const file = 'fake file';
    component.saveFrontFile({ file });
    component.saveSideFile({ file });

    component.setState({
      ...component.state,
      height: 180,
      gender: 'male',
    });

    const error = new Error('Test error');
    error.response = {
      data: {
        sub_tasks: [
          { name: 'front_error', message: 'error' },
          { name: 'side_error', message: 'error' },
        ],
      },
    };
    const fakePersonCreate = sinon.fake.throws(error);
    sinon.replace(component.api.person, 'create', fakePersonCreate);

    await component.onNextButtonClick(new Event('click'));

    expect(component.state.isFrontImageValid).to.be.false;
    expect(component.state.isSideImageValid).to.be.false;
  });

});
