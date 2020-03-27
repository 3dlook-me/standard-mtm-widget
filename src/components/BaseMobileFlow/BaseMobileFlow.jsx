import { h, Component } from 'preact';

import {
  isMobileDevice, parseGetParams, browserValidation, activeFlowInMobile,
} from '../../helpers/utils';
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
      setFlowState,
      flowState,
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
      .then((flowStateResult) => {
        const brand = flowStateResult.state.brand || TEST_BRAND;
        const bodyPart = flowStateResult.state.bodyPart || TEST_BODY_PART;

        // FOR PAGE RELOAD
        if (!flowState) {
          setFlowState(flowStateResult.state);
        }

        setPersonId(flowStateResult.person);
        setBrand(brand);
        setBodyPart(bodyPart);
        setProductUrl(flowStateResult.state.productUrl);
        setIsMobile(isMobileDevice());
        addHeight(flowStateResult.state.height);
        setWeight(flowStateResult.state.weight);
        addGender(flowStateResult.state.gender);
        addFrontImage(flowStateResult.state.frontImage);
        addSideImage(flowStateResult.state.sideImage);
        setIsFromDesktopToMobile(true);
        setWidgetUrl(flowStateResult.state.widgetUrl);
        setReturnUrl(flowStateResult.state.returnUrl);
        setRecommendations(flowStateResult.state.recommendations);
        setBodyType(flowStateResult.state.bodyType);
        setFakeSize(flowStateResult.state.fakeSize);
        setEmail(flowStateResult.state.email);
        setPhoneNumber(flowStateResult.state.phoneNumber);
        setProductId(flowStateResult.state.productId);
        setUnits(flowStateResult.state.units);

        if (!browserValidation()) {
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
