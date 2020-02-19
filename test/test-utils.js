export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const dispatchEvent = (el, event) => {
  const e = new Event(event);
  el.dispatchEvent(e);
};

export const keyboardEvent = (el, event, options) => {
  const e = new KeyboardEvent(event, {
    bubbles: true,
    cancelable: true,
    ...options,
  });

  el.dispatchEvent(e);
};

export const getBlob = url => fetch(url)
  .then(r => r.blob());
