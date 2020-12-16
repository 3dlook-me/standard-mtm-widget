import { Component, h } from 'preact';
import classNames from 'classnames';

import analyticsService, {
  FRONT_PHOTO_PAGE_EXAMPLE_OPEN,
  SIDE_PHOTO_PAGE_EXAMPLE_OPEN,
  FRONT_PHOTO_PAGE_EXAMPLE_CLOSE,
  SIDE_PHOTO_PAGE_EXAMPLE_CLOSE,
} from '../../services/analyticsService';

import './Tabs.scss';
import frontExample from '../../images/ai_front.png';
import sideExample from '../../images/ai_side.png';

/**
 * Preloader component
 */
class Tabs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: props.activeTab || 'front',
    };
  }

  componentDidMount() {
    const { token } = this.props;
    const { activeTab } = this.state;

    this.tabTimer = setTimeout(() => {
      this.setState({
        activeTab: 'side',
      });
    }, 4000);

    analyticsService({
      uuid: token,
      event: activeTab === 'front'
        ? FRONT_PHOTO_PAGE_EXAMPLE_OPEN
        : SIDE_PHOTO_PAGE_EXAMPLE_OPEN,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { token, isFrontImage, isSideImage } = this.props;
    const { activeTab } = this.state;

    if (
        isFrontImage && !prevProps.isFrontImage || 
        isSideImage && !prevProps.isSideImage
      ) {
      analyticsService({
        uuid: token,
        event: activeTab === 'front'
          ? FRONT_PHOTO_PAGE_EXAMPLE_CLOSE
          : SIDE_PHOTO_PAGE_EXAMPLE_CLOSE,
      });
    }

    if (activeTab !== prevState.activeTab) {
      analyticsService({
        uuid: token,
        event: activeTab === 'front'
          ? SIDE_PHOTO_PAGE_EXAMPLE_CLOSE
          : FRONT_PHOTO_PAGE_EXAMPLE_CLOSE,
      });

      analyticsService({
        uuid: token,
        event: activeTab === 'front'
          ? FRONT_PHOTO_PAGE_EXAMPLE_OPEN
          : SIDE_PHOTO_PAGE_EXAMPLE_OPEN,
      });
    }
  }

  changeTab = (e) => {
    this.setState({
      activeTab: e.target.name,
    });

    clearTimeout(this.tabTimer);
  }

  render() {
    const { activeTab } = this.state;

    return (
      <div className="tabs">
        <div className="tabs__btn-wrap">
          <button
            className={classNames('tabs__btn', {
              'tabs__btn--active': activeTab === 'front',
            })}
            type="button"
            name="front"
            onClick={this.changeTab}
          >
            front photo
          </button>
          <button
            className={classNames('tabs__btn', {
              'tabs__btn--active': activeTab === 'side',
            })}
            type="button"
            name="side"
            onClick={this.changeTab}
          >
            side photo
          </button>
        </div>
        <div
          className={classNames('tabs__photo', {
            'tabs__photo--active': activeTab === 'front',
          })}
          style={{ backgroundImage: `url(${frontExample})` }}
        />
        <div
          className={classNames('tabs__photo', {
            'tabs__photo--active': activeTab === 'side',
          })}
          style={{ backgroundImage: `url(${sideExample})` }}
        />
      </div>
    );
  }
}

export default Tabs;
