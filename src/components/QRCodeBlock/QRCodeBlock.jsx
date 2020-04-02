import { h, Component } from 'preact';
import classNames from 'classnames';
import QRCode from 'qrcode';

import './QRCodeBlock.scss';

/**
 * QR code block component
 */
export default class QRCodeBlock extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageData: null,
      error: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps;

    this.drawQrCode(data);
  }

  componentDidMount() {
    const { data } = this.props;

    this.drawQrCode(data);
  }

  drawQrCode(data) {
    if (data) {
      QRCode.toDataURL(data, {
        width: 140,
        margin: 0,
      })
        .then((imageData) => {
          this.setState({
            imageData,
          });
        })
        .catch((err) => this.setState({ error: err.message }));
    }
  }

  render() {
    const {
      className,
    } = this.props;

    const {
      imageData,
      error,
    } = this.state;

    return (
      <div className={classNames(className, 'qrcode')}>
        <div className="qrcode__img">
          {(!error)
            ? <img src={imageData} alt="QR Code" />
            : <p>{error}</p>}
        </div>
      </div>
    );
  }
}
