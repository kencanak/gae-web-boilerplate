/**
 * @fileoverview A very basic PubSub module.
 */

/* eslint-disable  @typescript-eslint/no-explicit-any */

const subscriptions = (window as { [key: string]: any })['PUBSUB_SUBSCRIPTIONS'];

const subscribe = (topic: string, callback: (args: any) => void) => {
  if (!topic || !callback) {
    return;
  }

  subscriptions.set(topic, [
    // Get all the current callbacks, but remove any copy of the one
    // that is being added (avoid duplicate callbacks)
    ...(subscriptions.get(topic) || []).filter((cb: () => void) => cb !== callback),
    // And then appaned the new subscribed callback
    callback,
  ]);
};

const unsubscribe = (topic: string, callback: () => void) => {
  if (!topic || !callback) {
    return;
  }

  if (subscriptions.get(topic)) {
    // Remove the callback that is being unsubribed.
    subscriptions.set(topic, (subscriptions.get(topic) || [])
      .filter((cb: () => void) => cb !== callback));
  }
};

const publish = (topic: string, ...args: any) => {
  if (!topic) {
    return;
  }

  (subscriptions.get(topic) || []).forEach((cb: (...args: any) => void) => cb(...args));
};

export {
  subscribe,
  unsubscribe,
  publish,
};
/* eslint-enable  @typescript-eslint/no-explicit-any */
