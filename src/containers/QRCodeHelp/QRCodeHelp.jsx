import { h, Component } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import { Stepper } from '../../components';
import actions from '../../store/actions';

import './QRCodeHelp.scss';

import appleIcon from '../../images/apple.svg';
import androidIcon from '../../images/android.svg';

/**
 * QRCodeHelp page component
 */
class QRCodeHelp extends Component {
  back = () => {
    route('/qrcode');
  }

  render() {
    return (
      <section className="screen active">
        <div className="screen__content qrcode-help">
          <Stepper steps="5" current="2" />
          <h3 className="screen__title qrcode-help__title">How to use QR code</h3>

          <div className="qrcode-help__wrapper">
            <div className="qrcode-help__block">
              <img className="qrcode-help__icon qrcode-help__icon--apple" src={appleIcon} alt="Apple icon" />
              <ol className="qrcode-help__list">
                <li>Launch the Camera app on your device</li>
                <li>Point it at the QR code</li>
                <li>Look for the notification banner at the top of the screen and then tap it. You’ll be redirected to the browser.</li>
              </ol>
            </div>
            <div className="qrcode-help__block">
              <img className="qrcode-help__icon qrcode-help__icon--android" src={androidIcon} alt="Apple icon" />
              <ol className="qrcode-help__list">
                <li>Download the QR Code reader on your phone</li>
                <li>Open it</li>
                <li>Hold your device over a QR Code so that it’s clearly visible within your smartphone’s screen.</li>
                <li>Then follow the instructions within the QR scanner app</li>
              </ol>
            </div>
          </div>
        </div>
        <div className="screen__footer">
          <button className="button" onClick={this.back} type="button">Back</button>
        </div>
      </section>
    );
  }
}

export default connect(state => state, actions)(QRCodeHelp);
