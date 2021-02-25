import { h } from 'preact';
import classNames from 'classnames';

import './SoftValidationItem.scss';

/**
 * SoftValidationItem component
 */
const SoftValidationItem = ({ className, image, children }) => (
  <div className={classNames('soft-validation-item', className)}>
    <div className="soft-validation-item__image-block">
      <img src={image} alt="" />
    </div>
    <div className="soft-validation-item__text-block">
      {children}
    </div>
  </div>
);

export default SoftValidationItem;
