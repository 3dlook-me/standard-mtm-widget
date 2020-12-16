import SaiaMTMButton from './button';

(async () => {
  try {
    const saiaCont = document.querySelector('.saia-widget-container');
    const scriptTag = document.getElementById('saia-mtm-integration');
    const publicKey = scriptTag.getAttribute('data-public-key');
    const buttonTitle = scriptTag.getAttribute('data-button-title');

    const { uuid, widget_settings } = await SaiaMTMButton.createWidget(publicKey);

    if (!saiaCont) {
      const cartAdd = document.querySelector("form[action='/cart/add']");
      const cont = document.createElement('div');
      cont.className = 'saia-widget-container';
      const parentDiv = cartAdd.parentNode;
      parentDiv.insertBefore(cont, cartAdd);
    }

    const button = new SaiaMTMButton({
      key: uuid,
      widgetUrl: WIDGET_HOST,
      buttonTitle: buttonTitle || 'GET MEASURED',
      customSettings: widget_settings,
    });

    button.init();
  } catch (err) {
    if (err && err.response && err.response.data) {
      console.error(err.response.data.detail);
    } else {
      console.error(err.message);
    }
  }
})();
