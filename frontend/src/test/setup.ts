import { config } from "@vue/test-utils";
import { afterEach, vi } from "vitest";
import {
  create,
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NEmpty,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NInputNumber,
  NResult,
  NSpace,
  NSpin,
  NTag,
  NText,
} from "naive-ui";

config.global.plugins = [
  create({
    components: [
      NButton,
      NCard,
      NDataTable,
      NDatePicker,
      NEmpty,
      NForm,
      NFormItem,
      NGrid,
      NGridItem,
      NInput,
      NInputNumber,
      NResult,
      NSpace,
      NSpin,
      NTag,
      NText,
    ],
  }),
];

afterEach(() => {
  vi.restoreAllMocks();
});
