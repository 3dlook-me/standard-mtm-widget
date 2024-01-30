// eslint-disable-next-line no-unused-vars
import { h, Component } from 'preact';
import { connect } from 'react-redux';
import classNames from 'classnames';
import './Header.scss';

import FlowService from '../../services/flowService';
import
// analyticsService,
{
  WIDGET_CLOSE,
  analyticsServiceAsync,
  // FAQ_PAGE_OPEN,
  // FAQ_PAGE_CLOSE,
} from '../../services/analyticsService';
import {
  send,
  objectToUrlParams,
  isMobileDevice,
  parseGetParams,
} from '../../helpers/utils';
import actions from '../../store/actions';

/**
 * Widget header component
 */
class Header extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isExitModalActive: false,
    };

  }

  componentDidMount() {
    const { flowId, token } = this.props;

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);

    if (isMobileDevice()) {
      document.body.classList.add('mobile-device');
    }
  }

  // eslint-disable-next-line react/no-deprecated
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
    const {
      returnUrl,
      origin,
      resetState,
      measurements,
      isMobile,
      isSmbFlow,
      isDemoWidget,
      matches,
      isWidgetDeactivated,
      token,
    } = this.props;

    const uuid = (matches || {}).key || API_KEY || parseGetParams().key || token;

    if (isWidgetDeactivated || !/result/i.test(window.location.hash)) {
      try {
        await analyticsServiceAsync({
          uuid,
          event: WIDGET_CLOSE,
          data: { screen: window.location.hash },
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    }

    if (isMobile) {
      const isMeasurements = Object.entries(measurements.front_params).length !== 0;

      if (window.location.hash.includes('results')) {
        try {
          await this.flow.widgetDeactivate();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log(err);
        }
      }

      if (isMeasurements && !isSmbFlow && !isDemoWidget) {
        window.location = `${returnUrl}?${objectToUrlParams(measurements, returnUrl)}`;
      } else {
        window.location = returnUrl;
      }
    } else {
      window.location = returnUrl || 'https://3dlook.ai/mobile-tailor/';
    }
    resetState();
    send('close', {}, origin);
  };

  onShowExitModal = () => {
    this.setState((prevState) => ({ ...prevState, isExitModalActive: !prevState.isExitModalActive }));
  }

  /**
   * Help button click
   */
  // temporarily disable
  // onHelpButtonClick = () => {
  //   const {
  //     isHelpActive,
  //     setHelpIsActive,
  //     matches,
  //     token,
  //   } = this.props;
  //   const uuid = (matches || {}).key || API_KEY || parseGetParams().key || token;
  //
  //   analyticsService({
  //     uuid,
  //     event: !isHelpActive ? INFO_CLICK : FAQ_PAGE_CLOSE,
  //     data: { screen: window.location.hash },
  //   });
  //
  //   gaHelpOnClick();
  //   setHelpIsActive(!isHelpActive);
  // };

  render() {
    const {
      isHelpActive,
      camera,
      isTableFlow,
      frontImage,
      sideImage,
      isHeaderTranslucent,
    } = this.props;

    const {
      isExitModalActive
    } = this.state;

    return (
      <header
        className={classNames('header', {
          active: isHelpActive,
          'header--default': !camera,
          'header--white': camera && !isTableFlow,
          'header--table-flow-camera': (camera && isTableFlow) && !(frontImage && sideImage),
          'header--translucent': isHeaderTranslucent,
        })}
      >
        <div className="header__offline-status">Check your internet connection</div>

        {/* temporarily disable help button */}
        {/* <button className="header__help" onClick={this.onHelpButtonClick} type="button"> */}
        {/*  <svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg"> */}
        {/*    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> */}
        {/*      <g transform="translate(-29.000000, -19.000000)"> */}
        {/*        <g transform="translate(30.000000, 20.000000)"> */}
        {/* eslint-disable-next-line max-len */}
        {/*          <text fontFamily="Avenir-Black, Avenir" fontSize="12" fontWeight="700" letterSpacing="1" fill="#DDDDDD"> */}
        {/*            <tspan x="7.44" y="13">i</tspan> */}
        {/*          </text> */}
        {/* eslint-disable-next-line max-len */}
        {/*          <circle className="header__svg-fill header__svg-fill--circle" stroke="#DDDDDD" strokeWidth="1.5" cx="9" cy="9" r="9" /> */}
        {/*        </g> */}
        {/*      </g> */}
        {/*    </g> */}
        {/*  </svg> */}
        {/* </button> */}

        <button className="header__close" onClick={this.onShowExitModal} type="button">
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

        <div className={classNames('header__exit', { active: isExitModalActive })}>
          <svg className="_close_icon" width="40" height="35" xmlns="http://www.w3.org/2000/svg"><path d="M21.258.332a2.5 2.5 0 01.902.902l17.48 30.008A2.5 2.5 0 0137.48 35H2.52a2.5 2.5 0 01-2.16-3.758L17.84 1.234a2.5 2.5 0 013.418-.902zm.001 18.846H18.74v7.494h2.52v-7.494zm0-4.997H18.74v2.498h2.52v-2.498z" fill="#000000" fill-rule="evenodd" /></svg>
          <p>
            Are you sure that you want to close widget?
          </p>
          <button onClick={this.onShowExitModal} className="button"> No</button>
          <button onClick={this.onCloseButtonClick} className="button header__close_btn">Yes</button>
        </div>
      </header>
    );
  }
}

export default connect((state) => state, actions)(Header);

