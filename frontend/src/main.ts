import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import {
  create,
  NButton,
  NCard,
  NConfigProvider,
  NDataTable,
  NDatePicker,
  NEmpty,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NInputNumber,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NMessageProvider,
  NResult,
  NSpace,
  NSpin,
  NTag,
  NText,
} from "naive-ui";
import App from "./app/App.vue";
import { routes } from "./app/router";
import "./app/styles.css";

const naive = create({
  components: [
    NButton,
    NCard,
    NConfigProvider,
    NDataTable,
    NDatePicker,
    NEmpty,
    NForm,
    NFormItem,
    NGrid,
    NGridItem,
    NInput,
    NInputNumber,
    NLayout,
    NLayoutContent,
    NLayoutHeader,
    NMessageProvider,
    NResult,
    NSpace,
    NSpin,
    NTag,
    NText,
  ],
});

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(router).use(naive).mount("#app");
