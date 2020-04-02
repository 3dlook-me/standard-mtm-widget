import SaiaButton from './button';

/**
 * Get your fit button
 *
 * 1. check if we should display button
 * 2. check if we have a place to display widget button
 * 3. check if we already have presaved data in localstorage.
 *   if so, get recomended size from api
 * 4. display button
 */
(async () => {
  const saiaCont = document.querySelector('.saia-widget-container');

  if (!saiaCont) {
    const cartAdd = document.querySelector("form[action='/cart/add']");
    const cont = document.createElement('div');
    cont.className = 'saia-widget-container';
    const parentDiv = cartAdd.parentNode;
    parentDiv.insertBefore(cont, cartAdd);
  }

  const button = new SaiaButton({
    key: API_KEY,
    widgetUrl: WIDGET_HOST,
  });

  button.init();

})();
