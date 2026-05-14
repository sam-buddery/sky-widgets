declare global {
  interface Window {
    __vite_plugin_react_preamble_installed__: boolean;
    $RefreshReg$: () => void;
    $RefreshSig$: () => (type: unknown) => unknown;
  }
}

if (import.meta.env.DEV) {
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
  window.__vite_plugin_react_preamble_installed__ = true;
}
