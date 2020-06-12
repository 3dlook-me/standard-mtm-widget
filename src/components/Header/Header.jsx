import { h, Component } from 'preact';
import { connect, Provider } from 'react-redux';
import classNames from 'classnames';
import './Header.scss';

import FlowService from '../../services/flowService';
import {
  send,
  objectToUrlParams,
  isMobileDevice,
} from '../../helpers/utils';
import { gaHelpOnClick, gaCloseOnClick } from '../../helpers/ga';
import actions from '../../store/actions';

/**
 * Widget header component
 */
class Header extends Component {
  componentDidMount() {
    if (isMobileDevice()) {
      document.body.classList.add('mobile-device');
    }
  }

  componentWillReceiveProps(nextProps) {
    const { flowId, token } = nextProps;

    if (flowId && token && !this.flow) {
      this.flow = new FlowService(token);
      this.flow.setFlowId(flowId);
    }
  }

  /**
   * Close button click
   */
  onCloseButtonClick = async () => {
    gaCloseOnClick();

    const {
      returnUrl,
      origin,
      resetState,
      measurements,
      isMobile,
    } = this.props;

    if (isMobile) {
      // if (confirm('Are you sure that you want to close widget? ')) {
      if (measurements) {
        window.location = `${returnUrl}?${objectToUrlParams(measurements)}`;
      } else {
        window.location = returnUrl;
      }
      // }
    } else {
      resetState();
      send('close', {}, origin);
    }
  };

  /**
   * Help button click
   */
  onHelpButtonClick = () => {
    const { isHelpActive, setHelpIsActive } = this.props;
    gaHelpOnClick();
    setHelpIsActive(!isHelpActive);
  };

  render() {
    const {
      isHelpActive,
      camera,
      isTableFlow,
    } = this.props;

    return (
      <header
        className={classNames('header', {
          active: isHelpActive,
          'header--default': !camera,
          'header--white': camera && !isTableFlow,
          'header--table-flow-camera': camera && isTableFlow,
        })}
      >
        <div className="header__offline-status">Check your internet connection</div>
        <button className="header__help" onClick={this.onHelpButtonClick} type="button">
          <svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <g transform="translate(-29.000000, -19.000000)">
                <g transform="translate(30.000000, 20.000000)">
                  <text fontFamily="Avenir-Black, Avenir" fontSize="12" fontWeight="700" letterSpacing="1" fill="#DDDDDD">
                    <tspan x="7.44" y="13">i</tspan>
                  </text>
                  <circle className="header__svg-fill header__svg-fill--circle" stroke="#DDDDDD" strokeWidth="1.5" cx="9" cy="9" r="9" />
                </g>
              </g>
            </g>
          </svg>
        </button>

        <button className="header__close" onClick={this.onCloseButtonClick} type="button">
          <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round">
              <g transform="translate(-567.000000, -20.000000)" stroke="#000000" strokeWidth="2">
                <g className="header__svg-fill" transform="translate(574.727922, 27.727922) rotate(-315.000000) translate(-574.727922, -27.727922) translate(565.727922, 18.727922)">
                  <path d="M18,9 L0,9" />
                  <path d="M9,0 L9,18" />
                </g>
              </g>
            </g>
          </svg>
        </button>
      </header>
    );
  }
}

export default connect((state) => state, actions)(Header);
