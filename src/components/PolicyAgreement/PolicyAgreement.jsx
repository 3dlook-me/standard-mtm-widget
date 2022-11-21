import { h } from 'preact';
import { useDispatch } from 'react-redux';

import classNames from 'classnames';

import analyticsService, {
  analyticsServiceAsync,
  CHECK_TERMS_AND_POLICY,
  CLICK_PRIVACY_POLICY,
  CLICK_TERMS_CONDITIONS,
} from '../../services/analyticsService';
import { addAgree } from '../../store/actions';

import './PolicyAgreement.scss';

const PolicyAgreement = ({
  token, agree, isAgreeValid, changeAgreeState,
}) => {
  const dispatch = useDispatch();

  const onClickTermsOrPrivacy = (type) => async (event) => {
    if (event.button === 0 || event.button === 1) {
      await analyticsServiceAsync({
        uuid: token,
        event: type === 'terms'
          ? CLICK_TERMS_CONDITIONS
          : CLICK_PRIVACY_POLICY,
      });
    }
  };

  const openWindow = (type) => {
    window.open(
      type === 'terms'
        ? 'https://3dlook.me/terms-of-service/'
        : 'https://3dlook.me/privacy-policy/',
      '_blank',
    );
  };

  const changeAgree = (e) => {
    if (e.target.checked) {
      analyticsService({
        uuid: token,
        event: CHECK_TERMS_AND_POLICY,
        data: {
          value: e.target.checked,
        },
      });
    }

    dispatch(addAgree(e.target.checked));
    changeAgreeState(e.target.checked);
  };

  return (
    <div className={classNames('PolicyAgreement', 'checkbox', {
      checked: agree,
      'checkbox--invalid': !isAgreeValid,
    })}
    >
      <label htmlFor="agree">
        <input
          type="checkbox"
          name="agree"
          id="agree"
          onChange={changeAgree}
          checked={agree}
        />
        <span className="checkbox__icon" />
        { 'I accept ' }
        <button
          type="button"
          className="PolicyAgreement__link"
          onMouseDown={onClickTermsOrPrivacy('terms')}
          onClick={() => openWindow('terms')}
        >
          Terms of Use
        </button>
        { ' and ' }
        <button
          type="button"
          className="PolicyAgreement__link"
          onMouseDown={onClickTermsOrPrivacy('privacy')}
          onClick={() => openWindow('privacy')}
        >
          Privacy Policy
        </button>
      </label>
    </div>
  );
};

export default PolicyAgreement;
