let rtpvPromise;

export function loadRtpvCamera() {
  if (!rtpvPromise) {
    rtpvPromise = import('@3dlook-me/camera-rpv-client').then((m) => {
      import('@3dlook-me/camera-rpv-client/dist/style.css');
      return m.default || m;
    });
  }
  return rtpvPromise;
}

export function loadDefaultCamera() {
  return loadRtpvCamera();
}

export function preloadRtpvCamera() {
  return loadRtpvCamera();
}

export function preloadDefaultCamera() {
  return loadDefaultCamera();
}
