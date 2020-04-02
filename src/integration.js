import SaiaMTMButton from './button';

(async () => {
  const saiaCont = document.querySelector('.saia-widget-container');
  const scriptTag = document.getElementById('saia-mtm-integration');
  const key = scriptTag.getAttribute('data-api-key');

  if (!saiaCont) {
    const cartAdd = document.querySelector("form[action='/cart/add']");
    const cont = document.createElement('div');
    cont.className = 'saia-widget-container';
    const parentDiv = cartAdd.parentNode;
    parentDiv.insertBefore(cont, cartAdd);
  }

  const button = new SaiaMTMButton({
    key,
    widgetUrl: WIDGET_HOST,
  });

  button.init();
})();
