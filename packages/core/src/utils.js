/** @type {import('./utils').createIframeRpc} */
export function createIframeRpc(iframe) {
  const nameToCallbacks = new Map()

  const handler = (e) => {
    if (nameToCallbacks.has(e.data.name)) {
      const callbacks = nameToCallbacks.get(e.data.name)
      for (const callback of callbacks) {
        callback.apply(e.target, e.data.payload)
      }
    }
  }

  if (iframe) {
    iframe.contentWindow.addEventListener('message', handler)
  } else {
    window.addEventListener('message', handler)
  }

  return {
    send(name, payload) {
      if (iframe) {
        iframe.contentWindow.postMessage({ name, payload })
      } else {
        window.parent.postMessage({ name, payload })
      }
    },
    on(name, callback) {
      if (!nameToCallbacks.has(name)) {
        nameToCallbacks.set(name, [])
      }
      nameToCallbacks.get(name).push(callback)
    },
    teardown() {
      if (iframe) {
        iframe.contentWindow.removeEventListener('message', handler)
      } else {
        window.removeEventListener('message', handler)
      }
    }
  }
}

/** @type {import('./utils').getWhyframeSource} */
export function getWhyframeSource(iframe) {
  return iframe.dataset.whySource
}
