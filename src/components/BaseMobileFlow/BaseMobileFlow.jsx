import { h, Component } from 'preact';

import { isMobileDevice, parseGetParams } from '../../helpers/utils';
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
      setRecommendations,
      setBodyType,
      setFakeSize,
      setEmail,
      setPhoneNumber,
      setProductId,
      setUnits,
    } = this.props;

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
      });
  }
}

export default BaseMobileFlow;
