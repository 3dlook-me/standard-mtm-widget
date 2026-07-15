import {
  h,
  Fragment,
} from 'preact';

import feet from '../../../images/clothing/feet.png';
import hair from '../../../images/clothing/hair.png';
import leggins from '../../../images/clothing/leggins.png';
import legginsMen from '../../../images/clothing/leggins_men.png';
import longSleeve from '../../../images/clothing/long_sleeve.png';
import shoes from '../../../images/clothing/shoes.png';
import shorts from '../../../images/clothing/shorts.png';
import shortsMen from '../../../images/clothing/shorts_men.png';
import tshirt from '../../../images/clothing/t-shirt.png';
import tshirtMen from '../../../images/clothing/t-shirt_men.png';

const femaleClothingItems = [
  {
    id: 'hair',
    image: hair,
    label: ['Hair pulled', 'back'],
  },
  {
    id: 'tshirt',
    image: tshirt,
    label: ['Form-fitting', 't-shirt'],
  },
  {
    id: 'leggins',
    image: leggins,
    label: ['Form-fitting', 'leggings'],
  },
  {
    id: 'shorts',
    image: shorts,
    label: ['Form-fitting', 'shorts'],
    showOrBefore: true,
  },
  {
    id: 'shoes',
    image: shoes,
    label: ['Flat shoes'],
  },
  {
    id: 'feet',
    image: feet,
    label: ['Bare feet'],
    showOrBefore: true,
  },
];

const maleClothingItems = [
  {
    id: 'long-sleeve',
    image: longSleeve,
    label: ['Form-fitting', 'long-sleeve shirt'],
  },
  {
    id: 'tshirt',
    image: tshirtMen,
    label: ['Form-fitting', 't-shirt'],
    showOrBefore: true,
  },
  {
    id: 'leggins',
    image: legginsMen,
    label: ['Form-fitting', 'leggings'],
  },
  {
    id: 'shorts',
    image: shortsMen,
    label: ['Form-fitting', 'shorts'],
    showOrBefore: true,
  },
  {
    id: 'shoes',
    image: shoes,
    label: ['Flat shoes'],
  },
  {
    id: 'feet',
    image: feet,
    label: ['Bare feet'],
    showOrBefore: true,
  },
];

const clothingItemsByGender = {
  female: femaleClothingItems,
  male: maleClothingItems,
};

export default function ClothingRequirements({ gender } = {}) {
  const clothingItems = clothingItemsByGender[gender] || femaleClothingItems;

  return (
    <Fragment>
      <h3 className="screen__label">Clothing requirements</h3>
      <div className="clothing-requirements">
        {clothingItems.map((item) => (
          <Fragment key={item.id}>
            {item.showOrBefore && (
              <span className={`clothing-requirements__or clothing-requirements__or--${item.id}`}>
                or
              </span>
            )}
            <div className="clothing-requirements__item">
              <img
                className="clothing-requirements__image"
                src={item.image}
                alt=""
              />
              <p className="clothing-requirements__label">
                {item.label.map((line, lineIndex) => (
                  <Fragment key={`${item.id}-${line}`}>
                    {line}
                    {lineIndex < item.label.length - 1 && <br />}
                  </Fragment>
                ))}
              </p>
            </div>
          </Fragment>
        ))}
      </div>
    </Fragment>
  );
}
