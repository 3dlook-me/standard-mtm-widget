import SaiaMTMButton from './button';

(async () => {
  try {
    const saiaCont = document.querySelector('.saia-widget-container');
    const scriptTag = document.getElementById('saia-mtm-integration');
    const publicKey = scriptTag.getAttribute('data-public-key');
    const buttonTitle = scriptTag.getAttribute('data-button-title');

    const isWidgetAllowed = await SaiaMTMButton.isWidgetAllowed(publicKey);

    if (isWidgetAllowed) {
      if (!saiaCont) {
        const cartAdd = document.querySelector("form[action='/cart/add']");
        const cont = document.createElement('div');
        cont.className = 'saia-widget-container';
        const parentDiv = cartAdd.parentNode;
        parentDiv.insertBefore(cont, cartAdd);
      }

      const button = new SaiaMTMButton({
        publicKey,
        widgetUrl: WIDGET_HOST,
        buttonTitle: buttonTitle || 'GET MEASURED',
      });

      button.init(publicKey);
    }
  } catch (err) {
    if (err && err.response && err.response.data) {
      console.error(err.response.data.detail);
    } else {
      console.error(err.message);
    }
  }
})();
