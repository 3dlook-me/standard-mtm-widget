import { h, render, Component } from 'preact';
import Router from 'preact-router';
import { createHashHistory } from 'history';
import { Provider } from 'react-redux';

// main file have to be here
import './scss/_index.scss';

import { store } from './store';
import { updateInternetStatus, browserDetect } from './helpers/utils';
import background from './images/background.png';
import {
  Header,
  Help,
  Msg,
} from './components';
import {
  Welcome,
  Email,
  GenderContainer,
  HeightContainer,
  WeightContainer,
  QRCodeContainer,
  Tutorial,
  Upload,
  QRCodeHelp,
  Results,
  HardValidation,
  NotFound,
  MobileFlow,
  Browser,
  CameraModeSelection,
  HowToTakePhotos,
  SmbFlow,
} from './containers';

import landscapeView from './images/landscape-view.svg';

console.log(`%cVERSION: ${VERSION}, COMMITHASH: ${COMMITHASH}, BRANCH: ${BRANCH}`, 'background: #f00; color: #fff; font-size: 20px;');

class App extends Component {
  componentDidMount() {
    const isSafari = browserDetect() === 'safari';
    window.addEventListener('online', updateInternetStatus);
    window.addEventListener('offline', updateInternetStatus);

    this.setAppHeight();
    window.addEventListener('resize', this.setAppHeight);
    window.addEventListener('orientationchange', this.setAppHeight);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.setAppHeight);
      window.visualViewport.addEventListener('scroll', this.setAppHeight);
    }

    // iphone bug when portrait after landscape
    if (isSafari) {
      window.addEventListener('resize', () => {
        if (window.matchMedia('(orientation: portrait)').matches) {
          document.getElementsByTagName('html')[0].style.height = '100vh';

          setTimeout(() => {
            document.getElementsByTagName('html')[0].style.height = '100%';
          }, 500);
        }
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('online', updateInternetStatus);
    window.removeEventListener('offline', updateInternetStatus);
    window.removeEventListener('resize', this.setAppHeight);
    window.removeEventListener('orientationchange', this.setAppHeight);

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.setAppHeight);
      window.visualViewport.removeEventListener('scroll', this.setAppHeight);
    }
  }

  setAppHeight = () => {
    const isKeyboardOpen = window.visualViewport
      && window.innerHeight - window.visualViewport.height > 120;

    if (isKeyboardOpen) {
      return;
    }

    const height = window.innerHeight;

    document.documentElement.style.setProperty('--app-height', `${height}px`);
  }

  render() {
    return (
      <Provider store={store}>
        <div className="landscape-view">
          <figure className="landscape-view__img">
            <img src={landscapeView} alt="landscapeView" />
          </figure>
          <p className="landscape-view__txt">Please turn your device</p>
        </div>
        <div className="widget-container" style={{ backgroundImage: `url(${background})` }}>
          <Header />
          <Help />

          <Router history={createHashHistory()}>
            <Welcome path="/" />
            <Email path="/email" />
            <GenderContainer path="/gender" />
            <HeightContainer path="/height" />
            <WeightContainer path="/weight" />
            <QRCodeContainer path="/qrcode" />
            <QRCodeHelp path="/qrcode-help" />
            <CameraModeSelection path="/camera-mode-selection" />
            <HowToTakePhotos path="/how-to-take-photos" />
            <Upload path="/upload" />
            <Tutorial path="/tutorial" />
            <HardValidation path="/hard-validation" />
            <NotFound path="/not-found" />
            <Results path="/results" />
            <MobileFlow path="/mobile/:id" />
            <SmbFlow path="/smb/:id" />
            <Browser path="/browser" />
            <Msg path="/contact-your-dealer" />
          </Router>
        </div>
      </Provider>
    );
  }
}

render(<App />, document.body);

export default App;
