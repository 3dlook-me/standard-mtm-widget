import {
  // eslint-disable-next-line no-unused-vars
  h,
  Component,
  Fragment,
} from 'preact';
import { connect } from 'react-redux';
import { route } from 'preact-router';
import classNames from 'classnames';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { mobileFlowStatusUpdate } from '../../helpers/utils';
import analyticsService, {
  HOW_TO_TAKE_PHOTOS_PAGE_ENTER,
  HOW_TO_TAKE_PHOTOS_PAGE_LEAVE,
} from '../../services/analyticsService';

import Pose from './steps/Pose';
import BeforeStart from './steps/BeforeStart';
import BackgroundRequirements from './steps/BackgroundRequirements';
import ClothingRequirements from './steps/ClothingRequirements';
import ClothingVerification from './steps/ClothingVerification';
import LightingRequirements from './steps/LightingRequirements';
import './HowToTakePhotos.scss';

class HowToTakePhotos extends Component {
  historyStateKey = 'howToTakePhotosStep';

  constructor(props) {
    super(props);

    this.state = {
      currentStep: 0
    };

    const { setPageReloadStatus } = props;

    this.reloadListener = () => {
      setPageReloadStatus(true);
    };

    window.addEventListener('unload', this.reloadListener);

  };

  getUseRtpvCamera = () => {

    const { settings } = this.props;

    return !(settings && settings.is_rtpv_disabled);
  };

  getSteps = () => [
    { id: 'clothing' },
    { id: 'background' },
    { id: 'lighting' },
    { id: 'verify' },
    { id: 'before-start' },
  ];

  getStepComponent = (step) => {
    if (step.id === 'before-start') return BeforeStart;
    if (step.id === 'background') return BackgroundRequirements;
    if (step.id === 'lighting') {
      return this.getUseRtpvCamera() ? Pose : LightingRequirements;
    }
    if (step.id === 'clothing') return ClothingRequirements;
    if (step.id === 'verify') return ClothingVerification;
  };


  nextStep = () => {
    const steps = this.getSteps();

    if (this.state.currentStep < steps.length - 1) {
      const nextStep = this.state.currentStep + 1;

      this.setState({ currentStep: nextStep }, () => {
        this.updateHistoryStep(nextStep, false);
      });
    } else {
      route('/upload', false);
    }
  };

  updateHistoryStep = (stepIndex, shouldReplace = false) => {
    const historyState = {
      ...(window.history.state || {}),
      [this.historyStateKey]: stepIndex,
    };

    if (shouldReplace) {
      window.history.replaceState(historyState, '');
    } else {
      window.history.pushState(historyState, '');
    }
  };

  onPopState = (event) => {
    const stepIndex = event.state && event.state[this.historyStateKey];

    if (typeof stepIndex === 'number') {
      this.setState({ currentStep: stepIndex });
    }
  };

  setConfirmed = (isConfirmed) => {
    const { setIsClothingFormFittingConfirmed} = this.props;

    setIsClothingFormFittingConfirmed(isConfirmed);
    this.nextStep();
  };

  componentDidMount = () => {
    this.widgetContainer = document.querySelector('.widget-container');
    this.widgetContainer.classList.add('widget-container--no-bg');
    window.addEventListener('popstate', this.onPopState);

    const historyStep = window.history.state && window.history.state[this.historyStateKey];

    if (typeof historyStep === 'number') {
      this.setState({ currentStep: historyStep });
    } else {
      this.updateHistoryStep(this.state.currentStep, true);
    }

    const {
      isFromDesktopToMobile,
      pageReloadStatus,
      token,
      flowId,
      isDemoWidget,
      isTableFlow,
    } = this.props;

    analyticsService({
      uuid: token,
      event: HOW_TO_TAKE_PHOTOS_PAGE_ENTER,
      data: {
        value: isTableFlow ? 'hands-free' : 'with-friend',
      },
    });

    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);

    // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
    if ((pageReloadStatus && isFromDesktopToMobile) || (pageReloadStatus && isDemoWidget)) {
      const { flowState } = this.props;
      mobileFlowStatusUpdate(this.flow, flowState);
    }
  }

  componentWillUnmount = () => {
    this.widgetContainer.classList.remove('widget-container--no-bg');
    window.removeEventListener('popstate', this.onPopState);

    const { token, isTableFlow } = this.props;

    analyticsService({
      uuid: token,
      event: HOW_TO_TAKE_PHOTOS_PAGE_LEAVE,
      data: {
        value: isTableFlow ? 'hands-free' : 'with-friend',
      },
    });
  }

  render() {
    const { gender, isTableFlow } = this.props;
    const useRtpvCamera = this.getUseRtpvCamera();
    const step = this.getSteps()[this.state.currentStep];
    const Step = this.getStepComponent(step);

    return (
      <div
        className={classNames(
          'screen',
          'active',
          `step--${step.id}`,
          {
            'step--self': isTableFlow,
            'step--friend': !isTableFlow,
            'step--male': gender === 'male',
            'step--female': gender === 'female',
            'step--rtpv': useRtpvCamera,
            'step--without-rtpv': !useRtpvCamera,
          }
        )}
      >
        <div className="screen__content how-to-take-photos">
          <div className="how-to-take-photos__content">
            <Step
              gender={gender}
              isTableFlow={isTableFlow}
              useRtpvCamera={useRtpvCamera}
              onNext={this.nextStep}
            />
          </div>
        </div>

        <div className="screen__footer">
          {step.id !== 'verify' ? <button className="button" onClick={this.nextStep}>
            Continue
     </button>
            : <Fragment>
              <button className="button" onClick={() => this.setConfirmed(true)}>
                Yes, my clothes are form-fitting
      </button>

              <button className="button button_verify" onClick={() => this.setConfirmed(false)}>
                No, but I wish to proceed
                <span>(I understand results may be less accurate)</span>
      </button>
              </Fragment>
            }
        </div>
      </div>
    );
  }
   
}

export default connect((state) => state, actions)(HowToTakePhotos);
