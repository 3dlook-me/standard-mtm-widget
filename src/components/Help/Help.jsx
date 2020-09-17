import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import classNames from 'classnames';
import { connect } from 'react-redux';
import analyticsService, {
  FAQ_PAGE_CLOSE,
} from '../../services/analyticsService';
import { parseGetParams } from '../../helpers/utils';
import './Help.scss';

import actions from '../../store/actions';

/**
 * Help component.
 * Displays help information
 */
const Help = ({ setHelpIsActive, isHelpActive, matches, token }) => {
  const onClickBack = useCallback(() => {
    const uuid = (matches || {}).key || API_KEY || parseGetParams().key || token;

    analyticsService({
      uuid,
      event: FAQ_PAGE_CLOSE,
    });
    setHelpIsActive(!isHelpActive);
  }, [setHelpIsActive, isHelpActive, matches]);

  return (
  <div className={classNames('help', { active: isHelpActive })}>
    <div className="help__content">
      <h2>DO YOU STORE MY PHOTOS? WHERE DO THEY GO AFTER I UPLOAD THEM?</h2>
      <p>No, we don't store the photos you upload. Photos are uploaded to our server via a secure channel, processed and then deleted. The only information we keep is your measurements - we use them to make size and fit recommendations.</p>

      <h2>HOW ACCURATE IS 3DLOOK?</h2>
      <p>Our technology allows us to measure the human body with up to 98% of accuracy. But there might be some issues that decrease accuracy. Thus we advise keeping in mind our recommendations while taking photos.</p>

      <h2>3DLOOK COULD NOT DETECT MY BODY. WHAT AM I DOING WRONG?</h2>
      <p>Most likely you either didn't fully fit in the frame or took a wrong pose while taking photos. Please check our video guide once again and try to take photos according to our guidelines. Please note that poor lighting might also affect the results.</p>

      <h2>HOW ARE YOU GOING TO USE MY DATA?</h2>
      <p>All data you provide is transferred to the website owner into their 3DLOOK admin panel. They will use this data to provide you the best offer they can. Note: website owner may use your contact data to reach out to you if they consider it necessary.</p>
    </div>
    <div className="help__footer">
      <button className="help__close button" type="button" onClick={onClickBack}>
        <span>Back</span>
      </button>
    </div>
  </div>
);
  }

export default connect((state) => state, actions)(Help);
