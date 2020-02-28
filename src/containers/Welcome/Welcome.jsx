import { h, Component } from 'preact';
import { Link, route } from 'preact-router';
import { connect } from 'react-redux';

import { browserValidation, isMobileDevice, parseGetParams } from '../../helpers/utils';
import { gaWelcomeOnContinue } from '../../helpers/ga';
import actions from '../../store/actions';
import FlowService from '../../services/flowService';

import './Welcome.scss';

/**
 * Welcome page component
 */
class Welcome extends Component {
  state = {
    isButtonDisabled: true,
  }

  componentDidMount() {
    const {
      setFlowId,
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
      setProductId,
      setWidgetUrl,
    } = this.props;

    this.widgetContainer = document.querySelector('.widget-container');
    this.widgetContainer.classList.remove('widget-container--no-bg');

    if (isMobileDevice()) {
      if (!browserValidation()) {
        setWidgetUrl(window.location.href);

        route('/browser', true);

        return;
      }
    }

    const token = matches.key || API_KEY || parseGetParams().key;
    const brand = matches.brand || TEST_BRAND;
    const bodyPart = matches.body_part || TEST_BODY_PART;

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
    this.flow.create({
      status: 'created',
      productUrl: matches.product,
      brand: matches.brand,
      bodyPart: matches.body_part,
      returnUrl: matches.returnUrl,
      fakeSize: !!matches.fakeSize,
      productId: parseInt(matches.productId, 10),
    })
      .then((res) => {
        setFlowId(res);
        this.setState({
          isButtonDisabled: false,
        });
      })
      .catch((err) => alert(err.message));
  }

  componentWillUnmount() {
    this.widgetContainer.classList.add('widget-container--no-bg');
  }

  render() {
    const { isButtonDisabled } = this.state;

    return (
      <section className="screen active">
        <div className="screen__content welcome">
          <div className="screen__intro">
            <h4 className="screen__intro-title">
              Never guess your size again
            </h4>
            <p className="screen__intro-txt">
              Get personalized size recommendation in under one minute. No measuring tape required
            </p>
          </div>
        </div>
        <div className="screen__footer">
          <Link className="button" href="/email" onClick={gaWelcomeOnContinue} disabled={isButtonDisabled}>
            <span>start</span>
          </Link>
        </div>
      </section>
    );
  }
}

export default connect((state) => state, actions)(Welcome);
