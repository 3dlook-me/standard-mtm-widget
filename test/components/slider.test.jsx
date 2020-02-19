/* eslint-disable */
import { h, render } from 'preact';
import chai, { expect } from 'chai';
import assertJsx from 'preact-jsx-chai';
import { Slider } from '../../src/components/Slider/Slider';

chai.use(assertJsx);

describe('Slider', () => {
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

  it('should render slider component', () => {
    render(<Slider images={[1, 2, 3]} />, scratch);

    expect(scratch.innerHTML).to.contain('tips__slider');
    expect(scratch.innerHTML).to.contain('slider');
  });

  it('should increment index on next event', () => {
    let component = null;

    render(<Slider ref={(ref) => component = ref} images={[1, 2, 3]} />, scratch);

    component.onNextClick();

    expect(component.state.index).to.equal(1);

    component.onNextClick();

    expect(component.state.index).to.equal(2);

    component.onNextClick();

    expect(component.state.index).to.equal(0);
  });

  it('should decrement index on previous event', () => {
    let component = null;

    render(<Slider ref={(ref) => component = ref} images={[1, 2, 3]} />, scratch);

    component.onPrevClick();

    expect(component.state.index).to.equal(2);

    component.onPrevClick();

    expect(component.state.index).to.equal(1);

    component.onPrevClick();

    expect(component.state.index).to.equal(0);
  });

});
