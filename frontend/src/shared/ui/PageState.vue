<template>
  <n-card>
    <div v-if="loading" class="meta-line">
      <n-spin size="small" />
      <span>{{ loadingText }}</span>
    </div>

    <n-result
      v-else-if="error"
      status="error"
      :title="errorTitle"
      :description="error"
    >
      <template #footer>
        <n-button secondary @click="$emit('retry')">Повторить</n-button>
      </template>
    </n-result>

    <n-empty v-else-if="empty" :description="emptyText" />

    <slot v-else />
  </n-card>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean;
  error?: string;
  empty?: boolean;
  loadingText?: string;
  emptyText?: string;
  errorTitle?: string;
}>();

defineEmits<{
  retry: [];
}>();
</script>
