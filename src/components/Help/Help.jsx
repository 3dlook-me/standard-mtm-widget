import { h } from 'preact';
import classNames from 'classnames';
import { connect } from 'react-redux';
import './Help.scss';

import actions from '../../store/actions';

/**
 * Help component.
 * Displays help information
 */
const Help = ({ setHelpIsActive, isHelpActive }) => (
  <div className={classNames('help', { active: isHelpActive })}>
    <div className="help__content">
      <h2>THE PERFECT FIT WIDGET COULD NOT DETECT MY BODY. WHAT AM I DOING WRONG?</h2>
      <p>Most likely you either didn't fully fit in the frame or took a wrong pose while taking photos. Please check our video guide once again and try to take photos according to our guidelines. Please note that poor lighting might also affect the results.</p>

      <h2>HOW ACCURATE IS THE PERFECT FIT WIDGET?</h2>
      <p>Our technology allows us to measure the human body with up to 98% of accuracy. But there might be some issues that decrease accuracy. Thus we advise keeping in mind our recommendations while taking photos.</p>

      <h2>WILL THE GARMENT THAT THE WIDGET RECOMMENDS FIT ME?</h2>
      <p>While our body measuring technology is accurate, we cannot guarantee that the garment will 100% fit you, because there's always some difference in garment production or inaccuracy in size charts.</p>

      <h2>HOW DO YOU CALCULATE MY SIZE?</h2>
      <p>We match your body measurements determined by the Perfect Fit technology with the size chart of the item you've selected.</p>

      <h2>WHAT IF MY MEASUREMENTS COME IN BETWEEN TWO SIZES?</h2>
      <p>In this case, SAIA will recommend a bigger size.</p>

      <h2>DO I NEED TO UPLOAD PHOTOS FOR EVERY ITEM I WANT TO KNOW MY SIZE OF?</h2>
      <p>No. We keep your measurements and detect your size for every item, so you don't need to upload your photos. However, we recommend updating your measurements once in a while, especially if your physical form has changed.</p>

      <h2>DO YOU STORE MY PHOTOS? WHERE DO THEY GO AFTER I UPLOAD THEM?</h2>
      <p>No, we don't store the photos you upload. Photos are uploaded to our server via a secure channel, processed and then deleted. The only information we keep is your measurements - we use them to make size and fit recommendations.</p>

      <h2>I DON'T SEE THE PERFECT FIT BUTTON ON SOME STORE PAGES.</h2>
      <p>This means that the seller decided not to use Perfect Fit technology for those items.</p>
    </div>
    <div className="help__footer">
      <button className="help__close button" type="button" onClick={() => setHelpIsActive(!isHelpActive)}>
        <span>Back</span>
      </button>
    </div>
  </div>
);

export default connect(state => state, actions)(Help);
