import SaiaMTMButton from './button';
import FlowService from './services/flowService';

(async () => {
  try {
    const saiaCont = document.querySelector('.saia-widget-container');
    const scriptTag = document.getElementById('saia-mtm-integration');
    const publicKey = scriptTag.getAttribute('data-public-key');

    const flowService = new FlowService(publicKey);
    const widget = await flowService.create();
    const { uuid } = widget;

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
