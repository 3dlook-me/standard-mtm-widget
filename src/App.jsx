import { h, render, Component } from 'preact';
import Router from 'preact-router';
import { createHashHistory } from 'history';
import { Provider } from 'react-redux';
import store from './store';
import { gaStart } from './helpers/ga';

import './scss/_index.scss';

/**
 * Components
 */
import {
  Header,
  Help,
} from './components';

/**
 * Containers
 */
import {
  Welcome,
  HeightContainer,
  QRCodeContainer,
  Tutorial,
  Upload,
  Data,
  Email,
  QRCodeHelp,
  Results,
  SoftValidation,
  HardValidation,
  NotFound,
  MobileFlow,
} from './containers';

// welcome screen img bg
import bgImage from './images/welcome-bg.png';

console.log(`%cVERSION: ${VERSION}, COMMITHASH: ${COMMITHASH}, BRANCH: ${BRANCH}`, 'background: #f00; color: #fff; font-size: 20px;');

class App extends Component {
  constructor(props) {
    super(props);

    gaStart();
  }

  render() {
    return (
      <Provider store={store}>
        <div className="widget-container widget-container--no-bg" style={{ backgroundImage: `url(${bgImage})` }}>
          <Header help={this.toggleHelp} />
          <Help />

          <Router history={createHashHistory()}>
            <Welcome path="/" />
            <Email path="/email" />
            <HeightContainer path="/height" />
            <QRCodeContainer path="/qrcode" />
            <QRCodeHelp path="/qrcode-help" />
            <Data path="/data" />
            <Upload path="/upload" />
            <Tutorial path="/tutorial" />
            <SoftValidation path="/soft-validation" />
            <HardValidation path="/hard-validation" />
            <NotFound path="/not-found" />
            <Results path="/results" />
            <MobileFlow path="/mobile/:id" />
          </Router>
        </div>
      </Provider>
    );
  }
}

render(<App />, document.body);

export default App;
