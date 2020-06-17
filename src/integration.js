import SaiaMTMButton from './button';
import UserService from './services/userService';

(async () => {
  const saiaCont = document.querySelector('.saia-widget-container');
  const scriptTag = document.getElementById('saia-mtm-integration');
  const key = scriptTag.getAttribute('data-api-key');

  const user = new UserService(key);

  const currentUser = await user.get();

  if (!currentUser.has_active_subscription) {
    return;
  }

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
