import { h, Component } from 'preact';

import FlowService from '../../services/flowService';
import { isMobileDevice, parseGetParams } from '../../helpers/utils';

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
      setMeasurements,
      setBodyType,
      setFakeSize,
      setEmail,
      setPhoneNumber,
      setProductId,
      setUnits,
      setWeight,
      setFlowState,
      flowState,
      setSettings,
      setSource,
      setMtmClientId,
      setFirstName,
      setNotes,
      resetState,
      setIsPhotosFromGallery,
      setWidgetId,
    } = this.props;

    if (!isMobileDevice()) {
      setIsMobile(false);

      return;
    }

    const token = matches.key || API_KEY || parseGetParams().key;
    setToken(token);

    if (!matches.id) { return; }

    this.flow = new FlowService(token);

    resetState();

    this.flow.resetGlobalState();

    setToken(token);
    setFlowId(matches.id);

    this.flow.setFlowId(matches.id);

    return this.flow.get()
      .then((flowStateResult) => {
        const brand = flowStateResult.state.brand || TEST_BRAND;
        const bodyPart = flowStateResult.state.bodyPart || TEST_BODY_PART;
        const photosFromGallery = flowStateResult.state.photosFromGallery || false;

        if (photosFromGallery) {
          setIsPhotosFromGallery(true);
        }

        // FOR PAGE RELOAD
        if (!flowState) {
          setFlowState(flowStateResult.state);
        }

        setMeasurements(flowStateResult.state.measurements);
        setPersonId(flowStateResult.person || flowStateResult.state.personId);
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
        setReturnUrl(flowStateResult.state.returnUrl);
        setSettings(flowStateResult.state.settings);
        setWidgetUrl(flowStateResult.state.widgetUrl);
        setBodyType(flowStateResult.state.bodyType);
        setFakeSize(flowStateResult.state.fakeSize);
        setEmail(flowStateResult.state.email);
        setPhoneNumber(flowStateResult.state.phoneNumber);
        setProductId(flowStateResult.state.productId);
        setUnits(flowStateResult.state.units || 'in');
        setSource(flowStateResult.state.source);
        setMtmClientId(flowStateResult.state.mtmClientId || flowStateResult.mtm_client);
        setFirstName(flowStateResult.state.firstName);
        setNotes(flowStateResult.state.notes);
        setWidgetId(flowStateResult.id);
      });
  }
}

export default BaseMobileFlow;
