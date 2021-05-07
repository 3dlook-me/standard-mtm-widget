import { h, Component } from 'preact';
import './Guide.scss';
import { VOLUMETRIC_PARAMS, LINEAR_PARAMS } from '../../helpers/bodyParametersInfo';

import { Loader } from '..';

class Guide extends Component {
  constructor() {
    super();

    this.state = {
      imageLoading: true,
    };
  }

  componentDidMount() {
    const { close } = this.props;

    window.addEventListener('popstate', close, { once: true });
  }

  handleLoad = () => {
    this.setState({
      imageLoading: false,
    });
  }

  render() {
    const { imageLoading } = this.state;
    const { measurementsType, gender, measurement } = this.props;
    const person = gender === 'female' ? 'women' : 'men';
    const type = measurementsType === 'volume_params' ? VOLUMETRIC_PARAMS : LINEAR_PARAMS;
    const parameter = type[measurement];

    return (
      <div className="guide">

        {imageLoading ? (
          <Loader />
        ) : null}


        <div className="guide__container">
          <h3 className="screen__title guide__main-title">{parameter.name}</h3>
          <figure className="guide__img">
            <img
              src={`${API_HOST}/docs/images/images-for-guide/${person}${parameter.imageURI}`}
              onLoad={this.handleLoad}
              alt="body part"
            />
          </figure>
          <div className="guide__data">
            <div className="guide__data-block">
              <h4 className="guide__title">Source</h4>
              <p>{parameter.source}</p>
            </div>
            <div className="guide__data-block">
              <h4 className="guide__title">Equipment:</h4>
              <p>{parameter.equipment}</p>
            </div>
          </div>
          <div className="guide__description">
            <h4 className="guide__title">Definition:</h4>
            <p className="guide__txt">
              {parameter.definition}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Guide;
