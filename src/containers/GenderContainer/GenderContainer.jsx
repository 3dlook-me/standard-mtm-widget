import { h, Component } from 'preact';
import { route } from 'preact-router';
import { connect } from 'react-redux';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { mobileFlowStatusUpdate } from '../../helpers/utils';
import {
  gaDataMale,
  gaDataFemale,
  gaGenderOnContinue,
} from '../../helpers/ga';
import analyticsService, {
  GENDER_PAGE_ENTER,
  GENDER_PAGE_LEAVE,
} from '../../services/analyticsService';
import {
  Stepper,
  Gender,
  PolicyAgreement,
} from '../../components';

import './GenderContainer.scss';

/**
 * Select your gender page component
 */
class GenderContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAgreeValid: true,
      isGenderValid: true,
      buttonDisabled: true,
    };

    const { flowId, token } = this.props;
    this.flow = new FlowService(token);
    this.flow.setFlowId(flowId);

    const { setPageReloadStatus, isDemoWidget } = props;

    if (isDemoWidget) {
      this.reloadListener = () => {
        setPageReloadStatus(true);
      };

      window.addEventListener('unload', this.reloadListener);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('unload', this.reloadListener);
  }

  componentDidMount() {
    const {
      gender,
      pageReloadStatus,
      isDemoWidget,
      token,
    } = this.props;

    analyticsService({
      uuid: token,
      event: GENDER_PAGE_ENTER,
    });

    if (gender) {
      this.setState({
        buttonDisabled: false,
      });
    }

    // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
    if (pageReloadStatus && isDemoWidget) {
      const { setPageReloadStatus, flowState } = this.props;

      setPageReloadStatus(false);

      mobileFlowStatusUpdate(this.flow, flowState);
    }
  }

  componentDidUpdate() {
    this.checkButtonState();
  }

  /**
   * Change gender handler
   */
  changeGender = (gender) => {
    const { addGender } = this.props;

    if (gender === 'male') {
      gaDataMale();
    } else {
      gaDataFemale();
    }

    addGender(gender);

    this.setState({
      isGenderValid: gender === 'male' || gender === 'female',
    });
  }

  changeAgree = (state) => {
    this.setState({
      isAgreeValid: state,
    });
  }

  /**
   * Set Next button disabled state
   */
  checkButtonState() {
    const {
      gender,
      isSmbFlow,
      agree,
      isDemoWidget,
    } = this.props;

    const {
      buttonDisabled,
      isGenderValid,
      isAgreeValid,
    } = this.state;

    let isButtonDisabled;

    if (isSmbFlow || isDemoWidget) {
      isButtonDisabled = !gender || !isGenderValid || !isAgreeValid || !agree;
    } else {
      isButtonDisabled = !gender || !isGenderValid;
    }

    if (isButtonDisabled !== buttonDisabled) {
      this.setState({
        buttonDisabled: isButtonDisabled,
      });
    }
  }

  /**
   * Go to the next screen
   */
  next = async () => {
    const { token } = this.props;
    gaGenderOnContinue();
    analyticsService({
      uuid: token,
      event: GENDER_PAGE_LEAVE,
    });

    route('/height', false);
  }

  render() {
    const { buttonDisabled, isAgreeValid } = this.state;
    const {
      gender,
      agree,
      isSmbFlow,
      isDemoWidget,
      token,
      isSmbQRFlow,
    } = this.props;

    return (
      <section className="screen active">
        <div className="screen__content select-your-gender">
          <Stepper steps="9" current={2} />
          <div className="gender__control screen__control">
            <h3 className="screen__label">Select your gender</h3>
            <Gender
              className="select-your-gender__gender"
              change={this.changeGender}
              gender={gender}
              token={token}
            />
          </div>
        </div>
        <div className="screen__footer">
          {(isSmbFlow && !isSmbQRFlow) || isDemoWidget ? (
            <PolicyAgreement
              agree={agree}
              isAgreeValid={isAgreeValid}
              token={token}
              changeAgreeState={this.changeAgree}
            />
          ) : null }
          <button className="button" onClick={this.next} type="button" disabled={buttonDisabled}>Next</button>
        </div>
      </section>
    );
  }
}

export default connect((state) => state, actions)(GenderContainer);
