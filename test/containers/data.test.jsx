/* eslint-disable */
import { h, render } from 'preact';
import sinon from 'sinon';
import { route } from 'preact-router';
import chai, { expect } from 'chai';
import assertJsx from 'preact-jsx-chai';
import { Data } from '../../src/containers/Data/Data';
import { sleep, dispatchEvent } from '../test-utils';

chai.use(assertJsx);

window.API_HOST = 'https://saia-test.3dlook.me/api/v2/';
window.API_KEY = 'uweh721gt7723trv';

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

  it('should render Data component', () => {
    render(<Data />, scratch);

    expect(scratch.innerHTML).to.contain('PLEASE ENTER YOUR DATA');
    expect(scratch.innerHTML).to.contain('Please select your gender and enter height.');
    expect(scratch.innerHTML).to.contain('We need this information to create your Perfect Fit Profile');
  });

  it('should render gender block with invalid class if isGenderValid===false', async () => {
    let component = null;

    render(<Data ref={(ref) => component = ref} />, scratch);

    component.setState({
      ...component.state,
      isGenderValid: false,
    });

    await sleep(1);

    const el = scratch.querySelector('.data__field:first-child.data__field--invalid');

    expect(el).to.be.ok;
  });

  it('should render height block with invalid class if isHeightValid===false', async () => {
    let component = null;

    render(<Data ref={(ref) => component = ref} />, scratch);

    component.setState({
      ...component.state,
      isHeightValid: false,
    });

    await sleep(1);

    const el = scratch.querySelector('.data__field:last-child.data__field--invalid');

    expect(el).to.be.ok;
  });

  it('should render agree checkbox with invalid class if isAgreeValid===false', async () => {
    let component = null;

    render(<Data ref={(ref) => component = ref} />, scratch);

    component.setState({
      ...component.state,
      isAgreeValid: false,
    });

    await sleep(1);

    const el = scratch.querySelector('.data__check.checkbox--invalid');

    expect(el).to.be.ok;
  });

  it('should change gender in components state to male', () => {
    let component = null;

    render(<Data ref={(ref) => component = ref} />, scratch);

    component.changeGender('male');

    expect(component.state.gender).to.equal('male');
  });

  it('should change gender in components state to female', () => {
    let component = null;

    render(<Data ref={(ref) => component = ref} />, scratch);

    component.changeGender('female');

    expect(component.state.gender).to.equal('female');
  });

  it('should change height in range 150-220cm', () => {
    let component = null;

    render(<Data ref={(ref) => component = ref} />, scratch);

    component.changeHeight(150);

    expect(component.state.height).to.equal(150);
    expect(component.state.isHeightValid).to.be.true;

    component.changeHeight(220);

    expect(component.state.height).to.equal(220);
    expect(component.state.isHeightValid).to.be.true;
  });

  it('should set isHeightValid if height is not in range 150-220cm', () => {
    let component = null;

    render(<Data ref={(ref) => component = ref} />, scratch);

    component.changeHeight(149);

    expect(component.state.height).to.equal(149);
    expect(component.state.isHeightValid).to.be.false;

    component.changeHeight(221);

    expect(component.state.height).to.equal(221);
    expect(component.state.isHeightValid).to.be.false;
  });

  it('should change agree value after checkbox was clicked', () => {
    let component = null;

    render(<Data ref={(ref) => component = ref} />, scratch);

    expect(component.state.agree).to.be.false;

    const checkbox = scratch.querySelector('input[name="agree"]');

    checkbox.checked = true;

    dispatchEvent(checkbox, 'change');

    expect(component.state.agree).to.be.true;
  });

  it('should go to the next page if all data is valid', async () => {
    let component = null;

    render(<Data ref={(ref) => component = ref} />, scratch);

    component.setState({
      ...component.state,
      gender: 'male',
      height: 150,
      agree: true,
    });

    await sleep(1);

    component.onNextScreen();

    expect(window.location.hash.substr(1)).to.contain('/upload');
    expect(window.location.hash.substr(1)).to.contain('height=150');
    expect(window.location.hash.substr(1)).to.contain('gender=male');
  });

  it('should not go to the next page if all data is invalid', async () => {
    route('/');

    let component = null;

    render(<Data ref={(ref) => component = ref} />, scratch);

    component.setState({
      ...component.state,
      gender: 'qwerty',
      height: 149,
      agree: false,
    });

    await sleep(1);

    component.onNextScreen();

    expect(window.location.hash.substr(1)).to.equal('/');
    expect(window.location.hash.substr(1)).to.not.contain('height=150');
    expect(window.location.hash.substr(1)).to.not.contain('gender=male');
  });

});
