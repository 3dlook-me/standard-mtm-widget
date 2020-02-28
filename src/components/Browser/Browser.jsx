import { h, Component } from 'preact';

import './Browser.scss';
import chrome from '../../images/chrome.svg';
import safari from '../../images/safari.svg';

export default class Browser extends Component {
  constructor() {
    super();

    this.state = {
      browser: ' Safari ',
    };
  }

  render() {
    const { browser } = this.state;

    return (
      <section className="screen active">
        <div className="screen__content browser">
          <div className="browser__control screen__control">
            <figure className="browser__img">
              <img src={safari} alt="browser" />
            </figure>
            <h2 className="browser__title">
              Please, continue in
              {browser}
            </h2>
            <p className="browser__txt">
              Use
              {browser}
              to finish the process.
              <br />
              Otherwise, the camera won’t work.
            </p>
          </div>
        </div>
        <div className="screen__footer">
          <button className="button" type="button">copy link</button>
        </div>
      </section>
    );
  }
}
