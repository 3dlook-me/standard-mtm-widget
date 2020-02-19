/* eslint-disable */
import { h, render } from 'preact';
import { route } from 'preact-router';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import assertJsx from 'preact-jsx-chai';
import { Height } from '../../src/components/Height/Height';

import { sleep, dispatchEvent } from '../test-utils';

chai.use(assertJsx);

describe('Height', () => {
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

  it('should render height component', () => {
    render(<Height />, scratch);

    expect(scratch.innerHTML).to.contain('height__switcher');
  });

  it('should has invalid class if isValid === false', () => {
    render(<Height isValid={false} />, scratch);

    expect(scratch.querySelector('.height.height--invalid')).to.be.ok;
  });

  it('should not has invalid class if isValid === true', () => {
    render(<Height isValid={true} />, scratch);

    expect(scratch.querySelector('.height:not(.height--invalid)')).to.be.ok;
  });

  it('should display description when measures in centimeters', () => {
    let component = null;

    render(<Height ref={ref => component = ref} />, scratch);

    component.setState({
      ...component.state,
      units: 'cm',
    });

    expect(scratch.querySelector('.height__desc:not(.height__desc--hidden)').innerHTML).to.contain('150-220 cm');
  });

  it('should display description when measures in inches', async () => {
    let component = null;

    render(<Height ref={ref => component = ref} />, scratch);

    component.setState({
      ...component.state,
      units: 'in',
    });

    await sleep(100);

    expect(scratch.querySelector('.height__desc:not(.height__desc--hidden)').innerHTML).to.contain('4’11” and 7’2”');
  });

  it('should change units by clicking on switch block', () => {
    let component = null;

    render(<Height ref={ref => component = ref} />, scratch);

    expect(component.state.units).to.equal('cm');

    let units = component.state.units;

    const button = scratch.querySelector('.height__switcher-switch');

    dispatchEvent(button, 'click');

    expect(units).to.not.equal(component.state.units);
    expect(component.state.units).to.equal('in');

    units = component.state.units;

    dispatchEvent(button, 'click');

    expect(units).to.not.equal(component.state.units);
    expect(component.state.units).to.equal('cm');
  });

  it('should change units by changing inch input', async () => {
    let component = null;

    render(<Height ref={ref => component = ref} />, scratch);

    expect(component.state.units).to.equal('cm');

    const input = scratch.querySelector('input[name="measure"][value="in"]');

    dispatchEvent(input, 'change');

    expect(component.state.units).to.equal('in');
  });

  it('should change units by changing centimeters input', async () => {
    let component = null;

    render(<Height ref={ref => component = ref} />, scratch);

    component.setState({
      ...component.state,
      units: 'in',
    });

    await sleep(100);

    expect(component.state.units).to.equal('in');

    const input = scratch.querySelector('input[name="measure"][value="cm"]');

    dispatchEvent(input, 'change');

    expect(component.state.units).to.equal('cm');
  });

  it('should change cm value', async () => {
    const spy = sinon.spy();
    let component = null;

    render(<Height ref={ref => component = ref} change={spy} />, scratch);

    const input = scratch.querySelector('[data-measure="cm"] .height__input');
    input.value = 120;

    dispatchEvent(input, 'change');

    expect(component.state.cm).to.equal('120');
    expect(spy.called).to.be.true;
    expect(spy.calledWith('120')).to.be.true;
  });

  it('should change inches value', async () => {
    const spy = sinon.spy();
    let component = null;

    render(<Height ref={ref => component = ref} change={spy} />, scratch);

    const input = scratch.querySelector('[data-measure="in"] .height__input');
    input.value = 10;

    dispatchEvent(input, 'change');

    expect(component.state.in).to.equal('10');
    expect(spy.called).to.be.true;
    expect(spy.calledWith(component.state.cm)).to.be.true;
  });

  it('should change feets value', async () => {
    const spy = sinon.spy();
    let component = null;

    render(<Height ref={ref => component = ref} change={spy} />, scratch);

    const input = scratch.querySelector('[data-measure="ft"] .height__input');
    input.value = 10;

    dispatchEvent(input, 'change');

    expect(component.state.ft).to.equal('10');
    expect(spy.called).to.be.true;
    expect(spy.calledWith(component.state.cm)).to.be.true;
  });

  it('should validate entered height', async () => {
    let component = null;

    render(<Height ref={ref => component = ref} change={() => {}} />, scratch);

    const input = scratch.querySelector('[data-measure="cm"] .height__input');
    input.value = 10;

    dispatchEvent(input, 'change');
    dispatchEvent(input, 'keydown');

    expect(component.state.cm).to.equal('10');
  });

});
