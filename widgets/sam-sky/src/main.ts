import widgetCss from "./widget.css?inline";
import { createApp } from "vue";
import App from "./App.vue";
import type { WidgetSDK } from "./types";

let currentCss = widgetCss;
const styles = new Set<HTMLStyleElement>();

if (import.meta.hot) {
  import.meta.hot.accept("./widget.css?inline", (mod) => {
    if (typeof mod?.default === "string") currentCss = mod.default;
    styles.forEach((s) => (s.textContent = currentCss));
  });
}

export async function init(sdk: WidgetSDK) {
  await sdk.whenReady();
  const style = document.createElement("style");
  style.textContent = currentCss;
  styles.add(style);
  sdk.shadowRoot.insertBefore(style, sdk.shadowRoot.firstChild);
  const app = createApp(App, { sdk });
  app.mount(sdk.getContainer());
  sdk.on("destroy", () => {
    styles.delete(style);
    style.remove();
    app.unmount();
  });
}
