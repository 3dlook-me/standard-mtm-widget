import { Component, h } from 'preact';
import classNames from 'classnames';

import './Tabs.scss';
import frontExample from '../../images/img_front-example.png';
import sideExample from '../../images/img_side-example.png';

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
    this.tabTimer = setTimeout(() => {
      this.setState({
        activeTab: 'side',
      });
    }, 4000);
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
