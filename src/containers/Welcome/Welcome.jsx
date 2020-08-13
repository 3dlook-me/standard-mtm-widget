import { h, Component, Fragment } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import {
  browserValidation,
  isMobileDevice,
  parseGetParams,
} from '../../helpers/utils';
import { gaWelcomeOnContinue } from '../../helpers/ga';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { Browser } from '..';

import './Welcome.scss';
import mobileBg from '../../images/img_mtm_mobile.png';
import desktopBg from '../../images/img_mtm.png';
import loader from '../../images/sms-sending.svg';

/**
 * Welcome page component
 */
class Welcome extends Component {
  constructor() {
    super();

    this.state = {
      isButtonDisabled: false,
      invalidBrowser: false,
    };
  }

  componentDidMount() {
    const {
      isSmbFlow,
      setFlowId,
      setWidgetId,
      setBrand,
      setBodyPart,
      setProductUrl,
      setToken,
      setIsMobile,
      setOrigin,
      matches,
      setReturnUrl,
      setFakeSize,
      setIsOpenReturnUrlDesktop,
      setIsFromDesktopToMobile,
      setProductId,
      setWidgetUrl,
      resetState,
      setSettings,
      setIsPhotosFromGallery,
    } = this.props;

    const token = matches.key || API_KEY || parseGetParams().key;
    const brand = matches.brand || TEST_BRAND;
    const bodyPart = matches.body_part || TEST_BODY_PART;
    const photosFromGallery = matches.photosFromGallery || false;

    this.widgetContainer = document.querySelector('.widget-container');

    if (isMobileDevice()) {
      if (!browserValidation()) {
        setIsMobile(true);
        setWidgetUrl(window.location.href);
        setReturnUrl(matches.returnUrl);
        setToken(token);
        setIsFromDesktopToMobile(false);

        this.setState({
          invalidBrowser: true,
        });

        return;
      }
    }

    this.widgetContainer.classList.remove('widget-container--no-bg');

    window.addEventListener('load', () => {
      this.setState({
        isButtonDisabled: true,
      });

      resetState();

      if (photosFromGallery) {
        setIsPhotosFromGallery(true);
      }

      if (!isSmbFlow) {
        setToken(token);
        setBrand(brand);
        setBodyPart(bodyPart);
        setProductUrl(matches.product);
        setOrigin(matches.origin);
        setIsMobile(isMobileDevice());
        setReturnUrl(matches.returnUrl);
        setIsOpenReturnUrlDesktop(!!matches.returnUrlDesktop);
        setFakeSize(!!matches.fakeSize);
        setProductId(parseInt(matches.productId, 10));

        this.flow = new FlowService(token);
        this.flow.setFlowId(token);
        this.flow.updateState({
          status: 'created',
          productUrl: matches.product,
          brand,
          bodyPart,
          returnUrl: matches.returnUrl,
          fakeSize: !!matches.fakeSize,
          productId: parseInt(matches.productId, 10),
          ...(photosFromGallery && { photosFromGallery: true }),
        })
          .then((res) => {
            setFlowId(res.uuid);
            setWidgetId(res.id);
            setSettings(res.settings);

            this.setState({
              isButtonDisabled: false,
            });
          })
          .catch((err) => {
            this.widgetIframe = window.parent.document.querySelector('.saia-pf-drop iframe');

            // condition for preventing appearing the error alert in safari
            // after the widget closes quickly after it is opened
            if (this.widgetIframe.getAttribute('src') !== '') {
              alert(err.message);
            }
          });
      }
    }, { once: true });
  }

  /**
   * On next screen event handler
   */
  onNextScreen = async () => {
    gaWelcomeOnContinue();

    const { isSmbFlow } = this.props;
    const routeUrl = (isSmbFlow) ? '/gender' : '/email';

    route(routeUrl, false);
  }

  componentWillUnmount() {
    this.widgetContainer.classList.add('widget-container--no-bg');
  }

  render() {
    const { isButtonDisabled, invalidBrowser } = this.state;

    return (
      <Fragment>
        { invalidBrowser ? (
          <Browser />
        ) : (
          <section className="screen active">
            <div className="screen__content welcome">
              <picture className="welcome__img">
                <source media="(max-width: 500px)" srcSet={mobileBg} />
                <img src={desktopBg} alt="photos_model_perfect-fit" />
              </picture>
              <div className="screen__intro">
                <h4 className="screen__intro-title">
                  Forget about measuring tape or appointments
                </h4>
                <p className="screen__intro-txt">
                  No quiz, no measuring tape, no return hassle – in under a minute!
                </p>
              </div>
            </div>
            <div className="screen__footer">
              <button className="button" type="button" onClick={this.onNextScreen} disabled={isButtonDisabled}>
                <img
                  className="screen__footer-loader"
                  src={loader}
                  alt="loader"
                />
                <span>next</span>
              </button>
            </div>
          </section>
        )}
      </Fragment>
    );
  }
}

export default connect((state) => state, actions)(Welcome);
