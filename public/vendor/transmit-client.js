var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});

// src/subscription_status.ts
var SubscriptionStatus = {
  Pending: 0,
  Created: 1,
  Deleted: 2
};

// src/transmit_status.ts
var TransmitStatus = {
  Initializing: "initializing",
  Connecting: "connecting",
  Connected: "connected",
  Disconnected: "disconnected",
  Reconnecting: "reconnecting"
};

// src/subscription.ts
var _httpClient, _hooks, _onDelete, _channel, _getEventSourceStatus, _handlers, _createPending, _status;
var Subscription = class {
  constructor(options) {
    /**
     * HTTP client instance.
     */
    __privateAdd(this, _httpClient);
    /**
     * Hook instance.
     */
    __privateAdd(this, _hooks);
    /**
     * Callback to call when the subscription is deleted.
     */
    __privateAdd(this, _onDelete);
    /**
     * Channel name.
     */
    __privateAdd(this, _channel);
    /**
     * Event source status getter.
     */
    __privateAdd(this, _getEventSourceStatus);
    /**
     * Registered message handlers.
     */
    __privateAdd(this, _handlers, /* @__PURE__ */ new Set());
    /**
     * Pending create retry promise to avoid stacking timeouts.
     */
    __privateAdd(this, _createPending, null);
    /**
     * Current status of the subscription.
     */
    __privateAdd(this, _status, SubscriptionStatus.Pending);
    __privateSet(this, _channel, options.channel);
    __privateSet(this, _httpClient, options.httpClient);
    __privateSet(this, _hooks, options.hooks);
    __privateSet(this, _onDelete, options.onDelete);
    __privateSet(this, _getEventSourceStatus, options.getEventSourceStatus);
  }
  /**
   * Returns if the subscription is created or not.
   */
  get isCreated() {
    return __privateGet(this, _status) === SubscriptionStatus.Created;
  }
  /**
   * Returns if the subscription is deleted or not.
   */
  get isDeleted() {
    return __privateGet(this, _status) === SubscriptionStatus.Deleted;
  }
  /**
   * Returns the number of registered handlers.
   */
  get handlerCount() {
    return __privateGet(this, _handlers).size;
  }
  /**
   * Run all registered handlers for the subscription.
   */
  $runHandler(message) {
    for (const handler of __privateGet(this, _handlers)) {
      try {
        handler(message);
      } catch (error) {
        console.error(error);
      }
    }
  }
  async create() {
    if (this.isCreated) {
      return;
    }
    if (__privateGet(this, _getEventSourceStatus).call(this) !== TransmitStatus.Connected && __privateGet(this, _createPending)) {
      return __privateGet(this, _createPending);
    }
    return this.forceCreate();
  }
  async forceCreate() {
    if (__privateGet(this, _getEventSourceStatus).call(this) !== TransmitStatus.Connected) {
      if (__privateGet(this, _createPending)) {
        return __privateGet(this, _createPending);
      }
      __privateSet(this, _createPending, new Promise((resolve) => {
        setTimeout(() => {
          __privateSet(this, _createPending, null);
          resolve(this.create());
        }, 100);
      }));
      return __privateGet(this, _createPending);
    }
    __privateSet(this, _createPending, null);
    const request = __privateGet(this, _httpClient).createRequest("/__transmit/subscribe", {
      channel: __privateGet(this, _channel)
    });
    __privateGet(this, _hooks)?.beforeSubscribe(request);
    try {
      const response = await __privateGet(this, _httpClient).send(request);
      void response.text();
      if (!response.ok) {
        __privateGet(this, _hooks)?.onSubscribeFailed(response);
        return;
      }
      __privateSet(this, _status, SubscriptionStatus.Created);
      __privateGet(this, _hooks)?.onSubscription(__privateGet(this, _channel));
    } catch (error) {
    }
  }
  async delete() {
    var _a;
    if (this.isDeleted || !this.isCreated) {
      return;
    }
    const request = __privateGet(this, _httpClient).createRequest("/__transmit/unsubscribe", {
      channel: __privateGet(this, _channel)
    });
    __privateGet(this, _hooks)?.beforeUnsubscribe(request);
    try {
      const response = await __privateGet(this, _httpClient).send(request);
      void response.text();
      if (!response.ok) {
        return;
      }
      __privateSet(this, _status, SubscriptionStatus.Deleted);
      __privateGet(this, _hooks)?.onUnsubscription(__privateGet(this, _channel));
      (_a = __privateGet(this, _onDelete)) == null ? void 0 : _a.call(this);
    } catch (error) {
    }
  }
  onMessage(handler) {
    __privateGet(this, _handlers).add(handler);
    return () => {
      __privateGet(this, _handlers).delete(handler);
    };
  }
  onMessageOnce(handler) {
    const deleteHandler = this.onMessage((message) => {
      handler(message);
      deleteHandler();
    });
  }
};
_httpClient = new WeakMap();
_hooks = new WeakMap();
_onDelete = new WeakMap();
_channel = new WeakMap();
_getEventSourceStatus = new WeakMap();
_handlers = new WeakMap();
_createPending = new WeakMap();
_status = new WeakMap();

// src/http_client.ts
var _options, _HttpClient_instances, retrieveXsrfToken_fn;
var HttpClient = class {
  constructor(options) {
    __privateAdd(this, _HttpClient_instances);
    __privateAdd(this, _options);
    __privateSet(this, _options, options);
  }
  send(request) {
    return fetch(request);
  }
  createRequest(path, body) {
    return new Request(`${__privateGet(this, _options).baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": __privateMethod(this, _HttpClient_instances, retrieveXsrfToken_fn).call(this) ?? ""
      },
      body: JSON.stringify({ uid: __privateGet(this, _options).uid, ...body }),
      credentials: "include"
    });
  }
};
_options = new WeakMap();
_HttpClient_instances = new WeakSet();
retrieveXsrfToken_fn = function() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(XSRF-TOKEN)=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
};

// src/hook_event.ts
var HookEvent = {
  BeforeSubscribe: "beforeSubscribe",
  BeforeUnsubscribe: "beforeUnsubscribe",
  OnReconnectAttempt: "onReconnectAttempt",
  OnReconnectFailed: "onReconnectFailed",
  OnSubscribeFailed: "onSubscribeFailed",
  OnSubscription: "onSubscription",
  OnUnsubscription: "onUnsubscription"
};

// src/hook.ts
var _handlers2;
var Hook = class {
  constructor() {
    __privateAdd(this, _handlers2, /* @__PURE__ */ new Map());
  }
  register(event, handler) {
    if (!__privateGet(this, _handlers2).has(event)) {
      __privateGet(this, _handlers2).set(event, /* @__PURE__ */ new Set());
    }
    __privateGet(this, _handlers2).get(event)?.add(handler);
    return this;
  }
  beforeSubscribe(request) {
    __privateGet(this, _handlers2).get(HookEvent.BeforeSubscribe)?.forEach((handler) => handler(request));
    return this;
  }
  beforeUnsubscribe(request) {
    __privateGet(this, _handlers2).get(HookEvent.BeforeUnsubscribe)?.forEach((handler) => handler(request));
    return this;
  }
  onReconnectAttempt(attempt) {
    __privateGet(this, _handlers2).get(HookEvent.OnReconnectAttempt)?.forEach((handler) => handler(attempt));
    return this;
  }
  onReconnectFailed() {
    __privateGet(this, _handlers2).get(HookEvent.OnReconnectFailed)?.forEach((handler) => handler());
    return this;
  }
  onSubscribeFailed(response) {
    __privateGet(this, _handlers2).get(HookEvent.OnSubscribeFailed)?.forEach((handler) => handler(response));
    return this;
  }
  onSubscription(channel) {
    __privateGet(this, _handlers2).get(HookEvent.OnSubscription)?.forEach((handler) => handler(channel));
    return this;
  }
  onUnsubscription(channel) {
    __privateGet(this, _handlers2).get(HookEvent.OnUnsubscription)?.forEach((handler) => handler(channel));
    return this;
  }
};
_handlers2 = new WeakMap();

// src/transmit.ts
var _uid, _options2, _subscriptions, _httpClient2, _hooks2, _status2, _eventSource, _eventTarget, _reconnectAttempts, _Transmit_instances, changeStatus_fn, connect_fn, onMessage_fn, onError_fn;
var Transmit = class {
  constructor(options) {
    __privateAdd(this, _Transmit_instances);
    /**
     * Unique identifier for this client.
     */
    __privateAdd(this, _uid);
    /**
     * Options for this client.
     */
    __privateAdd(this, _options2);
    /**
     * Registered subscriptions.
     */
    __privateAdd(this, _subscriptions, /* @__PURE__ */ new Map());
    /**
     * HTTP client instance.
     */
    __privateAdd(this, _httpClient2);
    /**
     * Hook instance.
     */
    __privateAdd(this, _hooks2);
    /**
     * Current status of the client.
     */
    __privateAdd(this, _status2, TransmitStatus.Initializing);
    /**
     * EventSource instance.
     */
    __privateAdd(this, _eventSource);
    /**
     * EventTarget instance.
     */
    __privateAdd(this, _eventTarget);
    /**
     * Number of reconnect attempts.
     */
    __privateAdd(this, _reconnectAttempts, 0);
    if (typeof options.uidGenerator === "undefined") {
      options.uidGenerator = () => crypto.randomUUID();
    }
    if (typeof options.eventSourceFactory === "undefined") {
      options.eventSourceFactory = (...args) => new EventSource(...args);
    }
    if (typeof options.eventTargetFactory === "undefined") {
      options.eventTargetFactory = () => new EventTarget();
    }
    if (typeof options.httpClientFactory === "undefined") {
      options.httpClientFactory = (baseUrl, uid) => new HttpClient({ baseUrl, uid });
    }
    if (typeof options.maxReconnectAttempts === "undefined") {
      options.maxReconnectAttempts = 5;
    }
    __privateSet(this, _uid, options.uidGenerator());
    __privateSet(this, _eventTarget, options.eventTargetFactory());
    __privateSet(this, _hooks2, new Hook());
    __privateSet(this, _httpClient2, options.httpClientFactory(options.baseUrl, __privateGet(this, _uid)));
    if (options.beforeSubscribe) {
      __privateGet(this, _hooks2).register(HookEvent.BeforeSubscribe, options.beforeSubscribe);
    }
    if (options.beforeUnsubscribe) {
      __privateGet(this, _hooks2).register(HookEvent.BeforeUnsubscribe, options.beforeUnsubscribe);
    }
    if (options.onReconnectAttempt) {
      __privateGet(this, _hooks2).register(HookEvent.OnReconnectAttempt, options.onReconnectAttempt);
    }
    if (options.onReconnectFailed) {
      __privateGet(this, _hooks2).register(HookEvent.OnReconnectFailed, options.onReconnectFailed);
    }
    if (options.onSubscribeFailed) {
      __privateGet(this, _hooks2).register(HookEvent.OnSubscribeFailed, options.onSubscribeFailed);
    }
    if (options.onSubscription) {
      __privateGet(this, _hooks2).register(HookEvent.OnSubscription, options.onSubscription);
    }
    if (options.onUnsubscription) {
      __privateGet(this, _hooks2).register(HookEvent.OnUnsubscription, options.onUnsubscription);
    }
    __privateSet(this, _options2, options);
    __privateMethod(this, _Transmit_instances, connect_fn).call(this);
  }
  /**
   * Returns the unique identifier of the client.
   */
  get uid() {
    return __privateGet(this, _uid);
  }
  subscription(channel) {
    if (__privateGet(this, _subscriptions).has(channel)) {
      return __privateGet(this, _subscriptions).get(channel);
    }
    const subscription = new Subscription({
      channel,
      httpClient: __privateGet(this, _httpClient2),
      hooks: __privateGet(this, _hooks2),
      getEventSourceStatus: () => __privateGet(this, _status2),
      onDelete: () => __privateGet(this, _subscriptions).delete(channel)
    });
    __privateGet(this, _subscriptions).set(channel, subscription);
    return subscription;
  }
  on(event, callback) {
    __privateGet(this, _eventTarget)?.addEventListener(event, callback);
  }
  off(event, callback) {
    __privateGet(this, _eventTarget)?.removeEventListener(event, callback);
  }
  close() {
    __privateGet(this, _eventSource)?.close();
  }
};
_uid = new WeakMap();
_options2 = new WeakMap();
_subscriptions = new WeakMap();
_httpClient2 = new WeakMap();
_hooks2 = new WeakMap();
_status2 = new WeakMap();
_eventSource = new WeakMap();
_eventTarget = new WeakMap();
_reconnectAttempts = new WeakMap();
_Transmit_instances = new WeakSet();
changeStatus_fn = function(status) {
  __privateSet(this, _status2, status);
  __privateGet(this, _eventTarget)?.dispatchEvent(new CustomEvent(status));
};
connect_fn = function() {
  __privateMethod(this, _Transmit_instances, changeStatus_fn).call(this, TransmitStatus.Connecting);
  const url = new URL(`${__privateGet(this, _options2).baseUrl}/__transmit/events`);
  url.searchParams.append("uid", __privateGet(this, _uid));
  __privateSet(this, _eventSource, __privateGet(this, _options2).eventSourceFactory(url, {
    withCredentials: true
  }));
  __privateGet(this, _eventSource).addEventListener("message", __privateMethod(this, _Transmit_instances, onMessage_fn).bind(this));
  __privateGet(this, _eventSource).addEventListener("error", __privateMethod(this, _Transmit_instances, onError_fn).bind(this));
  __privateGet(this, _eventSource).addEventListener("open", () => {
    __privateMethod(this, _Transmit_instances, changeStatus_fn).call(this, TransmitStatus.Connected);
    __privateSet(this, _reconnectAttempts, 0);
    for (const subscription of __privateGet(this, _subscriptions).values()) {
      if (subscription.isCreated) {
        void subscription.forceCreate();
      }
    }
  });
};
onMessage_fn = function(event) {
  const data = JSON.parse(event.data);
  const subscription = __privateGet(this, _subscriptions).get(data.channel);
  if (typeof subscription === "undefined") {
    return;
  }
  try {
    subscription.$runHandler(data.payload);
  } catch (error) {
    console.error(error);
  }
};
onError_fn = function() {
  if (__privateGet(this, _status2) !== TransmitStatus.Reconnecting) {
    __privateMethod(this, _Transmit_instances, changeStatus_fn).call(this, TransmitStatus.Disconnected);
  }
  __privateMethod(this, _Transmit_instances, changeStatus_fn).call(this, TransmitStatus.Reconnecting);
  __privateGet(this, _hooks2).onReconnectAttempt(__privateGet(this, _reconnectAttempts) + 1);
  if (__privateGet(this, _options2).maxReconnectAttempts && __privateGet(this, _reconnectAttempts) >= __privateGet(this, _options2).maxReconnectAttempts) {
    __privateGet(this, _eventSource).close();
    __privateGet(this, _hooks2).onReconnectFailed();
    return;
  }
  __privateWrapper(this, _reconnectAttempts)._++;
};
export {
  Subscription,
  Transmit
};
