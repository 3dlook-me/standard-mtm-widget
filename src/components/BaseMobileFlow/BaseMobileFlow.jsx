import { h, Component } from 'preact';

import { route } from 'preact-router';
import { isMobileDevice, parseGetParams, browserValidation } from '../../helpers/utils';
import FlowService from '../../services/flowService';

/**
 * Mobile flow page component
 */
class BaseMobileFlow extends Component {
  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  componentDidMount() {
    const {
      setFlowId,
      setBrand,
      setBodyPart,
      setProductUrl,
      setToken,
      setIsMobile,
      matches,
      addHeight,
      addGender,
      addFrontImage,
      addSideImage,
      setPersonId,
      setIsFromDesktopToMobile,
      setReturnUrl,
      setWidgetUrl,
      setRecommendations,
      setBodyType,
      setFakeSize,
      setEmail,
      setPhoneNumber,
      setProductId,
      setUnits,
      setWeight,
    } = this.props;

    if (!isMobileDevice()) {
      setIsMobile(false);

      return;
    }

    const token = matches.key || API_KEY || parseGetParams().key;
    setToken(token);

    if (!matches.id) { return; }

    this.flow = new FlowService(token);
    setFlowId(matches.id);
    this.flow.setFlowId(matches.id);

    return this.flow.get()
      .then((flowState) => {
        const brand = flowState.state.brand || TEST_BRAND;
        const bodyPart = flowState.state.bodyPart || TEST_BODY_PART;

        setPersonId(flowState.person);
        setBrand(brand);
        setBodyPart(bodyPart);
        setProductUrl(flowState.state.productUrl);
        setIsMobile(isMobileDevice());
        addHeight(flowState.state.height);
        setWeight(flowState.state.weight);
        addGender(flowState.state.gender);
        addFrontImage(flowState.state.frontImage);
        addSideImage(flowState.state.sideImage);
        setIsFromDesktopToMobile(true);
        setReturnUrl(flowState.state.returnUrl);
        setRecommendations(flowState.state.recommendations);
        setBodyType(flowState.state.bodyType);
        setFakeSize(flowState.state.fakeSize);
        setEmail(flowState.state.email);
        setPhoneNumber(flowState.state.phoneNumber);
        setProductId(flowState.state.productId);
        setUnits(flowState.state.units);

        if (!browserValidation()) {
          setWidgetUrl(window.location.href);

          return;
        }

        setInterval(() => {
          this.flow.updateState({
            lastActiveDate: Date.now(),
          });
        }, 3000);
      });
  }
}

export default BaseMobileFlow;
