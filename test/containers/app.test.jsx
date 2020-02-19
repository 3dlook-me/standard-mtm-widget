/* eslint-disable */
import { h, render } from 'preact';
import { route } from 'preact-router';
import chai, { expect } from 'chai';
import assertJsx from 'preact-jsx-chai';
import App from '../../src/App';

chai.use(assertJsx);


describe('App', () => {
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

  it('should render the homepage', () => {
    render(<App />, scratch);

    route('/');

    expect(scratch.innerHTML).to.contain('After uploading only two photos');
  });

  it('should toggle help component', () => {
    let component = null;
    render(<App ref={ref => component = ref} />, scratch);
    component.toggleHelp();

    expect(component.state.isHelpActive).to.equal(true);

    component.toggleHelp();

    expect(component.state.isHelpActive).to.equal(false);
  });
});
