const newProto = navigator.__proto__;
delete newProto.webdriver;
navigator.__proto__ = newProto;

window.console.debug = () => {
  return null;
};

// We can mock this in as much depth as we need for the test.
window.chrome = {
  runtime: {},
};

if (!window.Notification) {
  window.Notification = {
    permission: "denied",
  };
}

// Pass the Permissions Test.
const originalQuery = window.navigator.permissions.query;
window.navigator.permissions.__proto__.query = parameters =>
  parameters.name === "notifications"
    ? Promise.resolve({
        state: Notification.permission,
      })
    : originalQuery(parameters);

// Inspired by: https://github.com/ikarienator/phantomjs_hide_and_seek/blob/master/5.spoofFunctionBind.js
const oldCall = Function.prototype.call;

function call() {
  return oldCall.apply(this, arguments);
}
Function.prototype.call = call;

const nativeToStringFunctionString = Error.toString().replace(/Error/g, "toString");
const oldToString = Function.prototype.toString;

function functionToString() {
  if (this === window.navigator.permissions.query) {
    return "function query() { [native code] }";
  }
  if (this === functionToString) {
    return nativeToStringFunctionString;
  }
  return oldCall.call(oldToString, this);
}
Function.prototype.toString = functionToString;

// Overwrite the "plugins" property to use a custom getter.
Object.defineProperty(navigator, "plugins", {
  get: () => {
    const ChromiumPDFPlugin = {};
    ChromiumPDFPlugin.__proto__ = Plugin.prototype;
    const plugins = {
      0: ChromiumPDFPlugin,
      description: "Portable Document Format",
      filename: "internal-pdf-viewer",
      length: 1,
      name: "Chromium PDF Plugin",
      __proto__: PluginArray.prototype,
    };
    return plugins;
  },
});

const elementDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");

// redefine the property with a patched descriptor
Object.defineProperty(HTMLDivElement.prototype, "offsetHeight", {
  ...elementDescriptor,
  get: function () {
    if (this.id === "modernizr") {
      return 1;
    }
    // @ts-ignore
    return elementDescriptor.get.apply(this);
  },
});

// Overwrite the languages property to use a custom getter.
Object.defineProperty(navigator, "languages", {
  get: () => ["en-US", "en"],
});

Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", {
  get: function () {
    return window;
  },
});
