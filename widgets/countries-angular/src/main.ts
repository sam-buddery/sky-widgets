import { createApplication } from "@angular/platform-browser";
import { provideZonelessChangeDetection } from "@angular/core";
import { AppComponent, WIDGET_SDK } from "./app/app.component";
import type { WidgetSDK } from "./types";

const initializedSDKs = new WeakSet();

export async function init(sdk: WidgetSDK) {
  if (initializedSDKs.has(sdk)) return;
  initializedSDKs.add(sdk);
  try {
    await sdk.whenReady();
    const host = document.createElement("countries-angular-root");
    const appRef = await createApplication({
      providers: [
        provideZonelessChangeDetection(),
        { provide: WIDGET_SDK, useValue: sdk },
      ],
    });
    appRef.bootstrap(AppComponent, host);
    sdk.getContainer().appendChild(host);
    sdk.on("destroy", () => {
      initializedSDKs.delete(sdk);
      appRef.destroy();
      host.remove();
    });
  } catch (e) {
    initializedSDKs.delete(sdk);
    throw e;
  }
}
