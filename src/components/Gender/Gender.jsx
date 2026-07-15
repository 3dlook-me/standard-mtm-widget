import { h, Component } from 'preact';
import classNames from 'classnames';

import analyticsService, {
  GENDER_PAGE_MALE_GENDER_SELECTED,
  GENDER_PAGE_FEMALE_GENDER_SELECTED,
} from '../../services/analyticsService';

/**
 * Gender component
 */
class Gender extends Component {
  constructor() {
    super();

    this.state = {
      value: null,
    };
  }

  componentDidMount() {
    const { gender } = this.props;

    if (gender) {
      this.setState({
        value: gender,
      });
    }
  }

  /**
   * Gender change event handler
   */
  onGenderChange = (e) => {
    const { change, token } = this.props;
    const { value } = e.target;

    analyticsService({
      uuid: token,
      event: value === 'male'
        ? GENDER_PAGE_MALE_GENDER_SELECTED
        : GENDER_PAGE_FEMALE_GENDER_SELECTED,
    });

    this.setState({ value }, () => change(value));
  }

  render() {
    const { className, isValid } = this.props;
    const { value } = this.state;

    return (
      <div className={classNames('gender', className, { 'gender--invalid': !isValid })}>
        <label className={classNames('gender__item', { checked: value === 'female' })} htmlFor="gender-female">
          <input type="radio" name="gender" id="gender-female" value="female" onChange={this.onGenderChange} checked={value === 'female'} />
          <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 51 55" fill="none">
            <path d="M50.9994 33.9058C51.0138 31.3301 50.1116 29.5551 48.9329 28.3746C48.675 28.1171 48.4042 27.8888 48.1262 27.6864V21.4992C48.1262 9.62419 37.9968 0 25.4998 0C13.0042 0 2.87334 9.62419 2.87334 21.4985V27.6857C2.59535 27.8881 2.32456 28.1164 2.06669 28.3739C0.887956 29.5551 -0.0127919 31.3301 0.000137448 33.9058C0.0145034 36.6309 1.29236 38.6878 2.87334 40.2017V51.9314H15.7632C16.8953 52.6891 18.0711 53.3144 19.2843 53.7966C21.2747 54.5879 23.3628 55.0007 25.4991 55.0007C27.6353 55.0007 29.7234 54.5886 31.7138 53.7966C32.927 53.3137 34.1043 52.6884 35.2349 51.9314H48.1262V40.201C49.7072 38.6871 50.9851 36.6302 50.9994 33.9058ZM25.4998 50.7073C24.821 50.7073 24.1458 50.6501 23.4785 50.537C18.8081 49.745 14.4911 46.2272 11.4103 40.6145C11.35 40.505 11.2782 40.4042 11.2013 40.3083C10.9305 39.9713 10.5627 39.7173 10.1447 39.5893C10.0872 39.5721 4.32933 37.7677 4.30994 33.8829C4.29557 31.1806 6.09563 30.7077 6.61352 30.6319C7.65865 30.5167 8.46674 29.666 8.52707 28.62C8.60537 27.2349 8.80362 25.9092 9.10243 24.6464H13.2959C14.2684 20.1913 17.1129 15.302 19.0351 13.3889C17.6236 17.102 17.4498 22.098 17.4663 24.6464H41.8971C42.1974 25.9092 42.3935 27.2349 42.4739 28.62C42.5328 29.666 43.3423 30.516 44.3875 30.6319C44.4169 30.6354 44.4744 30.6433 44.5541 30.6598C45.1108 30.7778 46.7018 31.3359 46.6896 33.8829C46.6796 35.8253 45.2365 37.2476 43.787 38.1863C42.3389 39.1249 40.8872 39.5793 40.8606 39.5871C40.3176 39.7502 39.8615 40.118 39.5892 40.6145C36.5099 46.2272 32.1915 49.745 27.5211 50.537C26.8538 50.6501 26.1786 50.7073 25.4998 50.7073Z" fill="url(#paint0_linear_1472_1003)" />
            <defs>
              <linearGradient id="paint0_linear_1472_1003" x1="25" y1="0" x2="25" y2="62" gradientUnits="userSpaceOnUse">
                <stop stop-color="#5F83FF" />
                <stop offset="1" stop-color="#C5D2FF" />
              </linearGradient>
            </defs>
          </svg>
          <span>Female</span>
        </label>

        <label className={classNames('gender__item', { checked: value === 'male' })} htmlFor="gender-male">
          <input type="radio" name="gender" id="gender-male" value="male" onChange={this.onGenderChange} checked={value === 'male'} />
          <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 51 55" fill="none"><path fill="url(#a)" d="M47.874 22.47C47.062 2.234 32.754 0 26.5 0 16.51 0 5.859 5.946 5.129 22.468c-3 .974-5.129 3.98-5.129 7.629 0 4.099 2.5 7.563 7.068 9.835C10.8 50.206 20.75 55 26.5 55c5.75 0 15.7-4.796 19.432-15.07C50.499 37.66 53 34.196 53 30.098c0-3.648-2.128-6.652-5.126-7.628Zm-4.57 13.906a2.164 2.164 0 0 0-1.194 1.33c-2.867 9.045-11.724 12.96-15.61 12.96-3.886 0-12.743-3.914-15.61-12.96a2.166 2.166 0 0 0-1.194-1.33c-3.456-1.52-5.36-3.75-5.36-6.28 0-1.759 1.024-3.628 2.921-3.628.171 0 .337-.024.497-.063v3.31l2.998 1.987c0-5.485-.449-14.834 3.646-19.65 3.065 3.27 7.417 5.32 12.255 5.32 4.742 0 9.019-1.97 12.073-5.13 3.92 4.871 3.48 14.048 3.48 19.46l2.997-1.988v-3.322c.173.045.351.076.538.076 1.898 0 2.922 1.869 2.922 3.628 0 2.53-1.903 4.76-5.36 6.28Z" /><defs><linearGradient id="a" x1="25" x2="25" y1="0" y2="62" gradientUnits="userSpaceOnUse"><stop stop-color="#5F83FF" /><stop offset="1" stop-color="#C5D2FF" /></linearGradient></defs></svg>
          <span>Male</span>
        </label>

      </div>
    );
  }
}

export default Gender;
