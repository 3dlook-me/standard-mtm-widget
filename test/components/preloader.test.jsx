/* eslint-disable */
import { h, render } from 'preact';
import chai, { expect } from 'chai';
import assertJsx from 'preact-jsx-chai';
import Preloader from '../../src/components/Preloader/Preloader';

chai.use(assertJsx);

describe('Preloader', () => {
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

  it('should render preloader component', () => {
    render(<Preloader />, scratch);

    expect(scratch.innerHTML).to.contain('We’re doing some magic…');
    expect(scratch.innerHTML).to.contain('Please stand by');
  });

  it('should add active class if isActive === true', () => {
    render(<Preloader isActive={true} />, scratch);

    expect(scratch.innerHTML).to.contain('class="preloader active"');
  });

});
