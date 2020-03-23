import { h, Component } from 'preact';
import classNames from 'classnames';

/**
 * Gender component
 */
export default class Gender extends Component {
  state = {
    value: null,
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
    const { change } = this.props;

    const { value } = e.target;

    this.setState({
      value,
    }, () => change(value));
  }

  render() {
    const { className, isValid } = this.props;
    const { value } = this.state;

    return (
      <div className={classNames('gender', className, { 'gender--invalid': !isValid })}>
        <label className={classNames('gender__item', { checked: value === 'female' })} htmlFor="gender-female">
          <input type="radio" name="gender" id="gender-female" value="female" onChange={this.onGenderChange} checked={value === 'female'} />
          <span>Female</span>
        </label>

        <label className={classNames('gender__item', { checked: value === 'male' })} htmlFor="gender-male">
          <input type="radio" name="gender" id="gender-male" value="male" onChange={this.onGenderChange} checked={value === 'male'} />
          <span>Male</span>
        </label>
      </div>
    );
  }
}
