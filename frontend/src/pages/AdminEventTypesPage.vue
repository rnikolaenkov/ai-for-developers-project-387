<template>
  <section class="page">
    <div class="page-intro">
      <h2>Admin event types</h2>
      <p>Внутренний экран для просмотра и создания типов событий через `/admin/event-types`.</p>
    </div>

    <n-grid cols="1 s:1 m:2" responsive="screen" x-gap="20" y-gap="20">
      <n-grid-item>
        <PageState
          :loading="loading"
          :error="loadError"
          :empty="!loading && eventTypes.length === 0"
          loading-text="Загружаем типы событий"
          empty-text="Список пока пуст"
          @retry="loadEventTypes"
        >
          <div class="event-type-grid">
            <EventTypeCard
              v-for="eventType in eventTypes"
              :key="eventType.id"
              :event-type="eventType"
              button-text="Уже доступно"
            />
          </div>
        </PageState>
      </n-grid-item>

      <n-grid-item>
        <n-card title="Create event type">
          <n-form data-testid="event-type-form" label-placement="top" @submit.prevent="submitEventType">
            <n-space vertical size="large">
              <n-form-item label="ID">
                <n-input v-model:value="form.id" placeholder="strategy-session" />
              </n-form-item>

              <n-form-item label="Название">
                <n-input v-model:value="form.name" placeholder="Strategy Session" />
              </n-form-item>

              <n-form-item label="Описание">
                <n-input v-model:value="form.description" type="textarea" placeholder="45 минут на синхронизацию и разбор задач" />
              </n-form-item>

              <n-form-item label="Длительность, минут">
                <div data-testid="event-type-duration">
                  <n-input-number v-model:value="form.durationMinutes" :min="1" :max="1440" :step="10" />
                </div>
              </n-form-item>

              <div v-if="submitState === 'success'" data-testid="event-type-success">
                <n-result
                  status="success"
                  title="Тип события создан"
                  description="Новый тип события добавлен в список."
                />
              </div>

              <div v-if="submitError" data-testid="event-type-error">
                <n-result
                  status="warning"
                  title="Не удалось создать тип события"
                  :description="submitError"
                />
              </div>

              <n-button
                attr-type="submit"
                type="primary"
                :loading="submitting"
                :disabled="!form.id || !form.name || !form.description || !form.durationMinutes"
              >
                Создать тип события
              </n-button>
            </n-space>
          </n-form>
        </n-card>
      </n-grid-item>
    </n-grid>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api, ApiClientError } from "../shared/api/client";
import type { EventType } from "../shared/api/types";
import EventTypeCard from "../shared/ui/EventTypeCard.vue";
import PageState from "../shared/ui/PageState.vue";

const eventTypes = ref<EventType[]>([]);
const loading = ref(false);
const loadError = ref("");
const submitting = ref(false);
const submitError = ref("");
const submitState = ref<"idle" | "success">("idle");
const form = ref({
  id: "",
  name: "",
  description: "",
  durationMinutes: 30,
});

async function loadEventTypes() {
  loading.value = true;
  loadError.value = "";

  try {
    eventTypes.value = await api.listEventTypes();
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "Не удалось загрузить типы событий";
  } finally {
    loading.value = false;
  }
}

async function submitEventType() {
  submitting.value = true;
  submitError.value = "";
  submitState.value = "idle";

  try {
    const created = await api.createEventType({
      id: form.value.id,
      name: form.value.name,
      description: form.value.description,
      durationMinutes: form.value.durationMinutes,
    });

    eventTypes.value = [created, ...eventTypes.value.filter((item) => item.id !== created.id)];
    submitState.value = "success";
    form.value = { id: "", name: "", description: "", durationMinutes: 30 };
  } catch (error) {
    if (error instanceof ApiClientError) {
      submitError.value = `${error.code}: ${error.message}`;
    } else {
      submitError.value = "Не удалось создать тип события";
    }
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  void loadEventTypes();
});
</script>
