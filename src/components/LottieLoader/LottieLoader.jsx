
import { h, Component } from 'preact';
import Lottie from "lottie-react";

import './LottieLoader.scss';
import loader from '../../images/loader.json';


class LottieLoader extends Component {
  constructor() {
    super();

    this.state = {
      value: 0,
    };
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({
        value: this.state.value + 1.2,
      })
    }, 1000);
  }


  render() {
    const { value } = this.state;
    const {
      isMobile
    } = this.props;
    return (
      <div class="lottie-loader-wrapper">
        <Lottie class="lottie-loader" animationData={loader} />


        {isMobile ? (
          <div class="progress-bar-wrapper">
            <div class="progress-bar" style={{ width: `${value}%` }}></div>
          </div >
        ) : null}





      </div >)
  }
}
export default LottieLoader;
