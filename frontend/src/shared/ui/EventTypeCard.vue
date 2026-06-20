<template>
  <n-card :title="eventType.name" hoverable :segmented="{ content: true }">
    <template #header-extra>
      <n-tag type="info" round>{{ eventType.durationMinutes }} min</n-tag>
    </template>

    <n-space vertical>
      <n-text depth="3">{{ eventType.description }}</n-text>
      <n-button type="primary" secondary @click="$emit('select', eventType.id)">
        {{ buttonText }}
      </n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import type { EventType, PublicEventType } from "../api/types";

defineProps<{
  eventType: EventType | PublicEventType;
  buttonText?: string;
}>();

defineEmits<{
  select: [id: string];
}>();
</script>
