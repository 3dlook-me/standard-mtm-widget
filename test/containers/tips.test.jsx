/* eslint-disable */
import { h, render } from 'preact';
import chai, { expect } from 'chai';
import assertJsx from 'preact-jsx-chai';

chai.use(assertJsx);

import Tips from '../../src/containers/tips/Tips';

describe('Tips', () => {
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

  it('should render tips page', () => {
    render(<Tips />, scratch);

    expect(scratch.innerHTML).to.contain('Simply take two photos with any smartphone');
  });

  it('should contain Slider component', () => {
    render(<Tips />, scratch);

    expect(scratch.querySelector('.slider')).to.be.ok;
  });
});
