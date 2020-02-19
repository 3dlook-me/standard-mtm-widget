import { h, Component } from 'preact';
import classNames from 'classnames';
import './Slider.scss';

// TODO *** DO WE NEED

/**
 * Slider component
 */
export default class Slider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      index: 0,
      timer: null,
    };
  }

  componentDidMount() {
    const timer = setInterval(() => {
      this.nextSlide();
    }, 3000);

    this.setState({
      timer,
    });
  }

  componentWillUnmount() {
    const { timer } = this.state;

    clearInterval(timer);
  }

  /**
   * Display next slide
   */
  nextSlide = () => {
    const { index } = this.state;
    const { children } = this.props;

    let i = index + 1;

    if (i >= children.length) {
      i = 0;
    }

    this.setState({
      index: i,
    });
  }

  render({ children, className }, { index }) {
    // slides
    const slides = children.map((image, i) => {
      const imageCopy = {
        ...image,
      };

      if (!imageCopy.attributes) {
        imageCopy.attributes = {};
      }

      imageCopy.attributes.className = classNames('slider__slide', { active: index === i });

      return imageCopy;
    });

    // bullets
    const bullets = children.map((_, i) => (
      <div className={classNames('slider__bullet', { active: index === i })} />
    ));

    return (
      <div className={classNames('slider', className)}>
        <div className="slider__slides">
          {slides}
        </div>

        <div className="slider__bullets">
          {bullets}
        </div>
      </div>
    );
  }
}
