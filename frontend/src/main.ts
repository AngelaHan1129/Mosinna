// main.ts
import { createApp } from "vue";
import { createPinia } from "pinia"; // 引入 Pinia
import App from "./App.vue";
import router from "./router";
import "./index.css";
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Vue3SocialSharingPlugin from "vue3-social-sharing";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Vue3SocialSharingPlugin);
app.use(Vue3Toastify, {
  theme: "light",
  position: "bottom-right",
  autoClose: 3000,
  clearOnUrlChange: false,
  newestOnTop: true,
  multiple: true,
  limit: 3,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  closeOnClick: true,
  // dangerouslyHTMLString: true,
} as ToastContainerOptions);

app.mount("#app");
