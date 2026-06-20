<template>
  <section class="page">
    <div class="page-intro">
      <h2>Public booking flow</h2>
      <p>Выберите тип события, затем свободный слот и отправьте бронирование только через API-контракт.</p>
    </div>

    <PageState
      :loading="eventTypesLoading"
      :error="eventTypesError"
      :empty="!eventTypesLoading && eventTypes.length === 0"
      loading-text="Загружаем доступные типы событий"
      empty-text="Типы событий пока не созданы"
      @retry="loadEventTypes"
    >
      <div class="event-type-grid">
        <EventTypeCard
          v-for="eventType in eventTypes"
          :key="eventType.id"
          :event-type="eventType"
          button-text="Показать слоты"
          @select="selectEventType"
        />
      </div>
    </PageState>

    <n-grid cols="1 s:1 m:2" responsive="screen" x-gap="20" y-gap="20">
      <n-grid-item>
        <PageState
          :loading="availabilityLoading"
          :error="availabilityError"
          :empty="Boolean(selectedEventType) && !availabilityLoading && availability?.slots.length === 0"
          loading-text="Проверяем доступные слоты"
          empty-text="Свободных слотов в выбранном окне нет"
          @retry="reloadAvailability"
        >
          <n-space vertical>
            <div class="meta-line">
              <n-tag v-if="selectedEventType" type="success" round>{{ selectedEventType.name }}</n-tag>
              <n-text v-if="availability">
                Окно: {{ formatDateTime(availability.windowStartsAt) }} - {{ formatDateTime(availability.windowEndsAt) }}
              </n-text>
            </div>

            <div v-if="!selectedEventType">
              <n-text depth="3">Сначала выберите тип события сверху.</n-text>
            </div>

            <div v-else class="slot-list" data-testid="slot-list">
              <n-button
                v-for="slot in availability?.slots ?? []"
                :key="slot.startsAt"
                class="slot-button"
                :type="selectedSlot?.startsAt === slot.startsAt ? 'primary' : 'default'"
                secondary
                @click="selectedSlot = slot"
              >
                {{ formatDateTime(slot.startsAt) }} - {{ formatDateTime(slot.endsAt) }}
              </n-button>
            </div>
          </n-space>
        </PageState>
      </n-grid-item>

      <n-grid-item>
        <n-card title="Create booking">
          <template v-if="createdBooking">
            <div data-testid="booking-success">
              <n-result
                status="success"
                title="Бронирование создано"
                description="Слот успешно закреплён за гостем."
              >
                <template #footer>
                  <div class="booking-summary">
                    <n-text><strong>Событие:</strong> {{ createdBooking.eventTypeName }}</n-text>
                    <n-text><strong>Начало:</strong> {{ formatDateTime(createdBooking.startsAt) }}</n-text>
                    <n-text><strong>Гость:</strong> {{ createdBooking.guest.name }} ({{ createdBooking.guest.email }})</n-text>
                    <n-button secondary @click="resetBookingState">Создать ещё одно бронирование</n-button>
                  </div>
                </template>
              </n-result>
            </div>
          </template>

          <template v-else>
            <n-form data-testid="booking-form" label-placement="top" @submit.prevent="submitBooking">
              <n-space vertical size="large">
                <n-form-item label="Выбранный слот">
                  <n-input
                    :value="selectedSlot ? `${formatDateTime(selectedSlot.startsAt)} - ${formatDateTime(selectedSlot.endsAt)}` : 'Слот не выбран'"
                    disabled
                  />
                </n-form-item>

                <n-form-item label="Имя гостя">
                  <n-input v-model:value="bookingForm.name" placeholder="Иван Иванов" />
                </n-form-item>

                <n-form-item label="Email гостя">
                  <n-input v-model:value="bookingForm.email" placeholder="guest@example.com" />
                </n-form-item>

                <div v-if="bookingError" data-testid="booking-error">
                  <n-result
                    status="warning"
                    title="Не удалось создать бронирование"
                    :description="bookingError"
                  />
                </div>

                <n-button
                  attr-type="submit"
                  type="primary"
                  :loading="bookingSubmitting"
                  :disabled="!selectedEventType || !selectedSlot || !bookingForm.name || !bookingForm.email"
                >
                  Забронировать слот
                </n-button>
              </n-space>
            </n-form>
          </template>
        </n-card>
      </n-grid-item>
    </n-grid>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api, ApiClientError } from "../shared/api/client";
import type { AvailabilityResponse, AvailableSlot, Booking, PublicEventType } from "../shared/api/types";
import { formatDateTime } from "../shared/lib/format";
import EventTypeCard from "../shared/ui/EventTypeCard.vue";
import PageState from "../shared/ui/PageState.vue";

const eventTypes = ref<PublicEventType[]>([]);
const eventTypesLoading = ref(false);
const eventTypesError = ref("");
const availability = ref<AvailabilityResponse | null>(null);
const availabilityLoading = ref(false);
const availabilityError = ref("");
const selectedEventTypeId = ref<string>("");
const selectedSlot = ref<AvailableSlot | null>(null);
const createdBooking = ref<Booking | null>(null);
const bookingSubmitting = ref(false);
const bookingError = ref("");
const bookingForm = ref({
  name: "",
  email: "",
});

const selectedEventType = computed(() => eventTypes.value.find((item) => item.id === selectedEventTypeId.value) ?? null);

async function loadEventTypes() {
  eventTypesLoading.value = true;
  eventTypesError.value = "";

  try {
    eventTypes.value = await api.listPublicEventTypes();
  } catch (error) {
    eventTypesError.value = error instanceof Error ? error.message : "Не удалось загрузить типы событий";
  } finally {
    eventTypesLoading.value = false;
  }
}

async function loadAvailability(eventTypeId: string) {
  availabilityLoading.value = true;
  availabilityError.value = "";
  selectedSlot.value = null;

  try {
    availability.value = await api.getAvailability(eventTypeId);
  } catch (error) {
    availability.value = null;
    availabilityError.value = error instanceof Error ? error.message : "Не удалось загрузить доступные слоты";
  } finally {
    availabilityLoading.value = false;
  }
}

function selectEventType(eventTypeId: string) {
  selectedEventTypeId.value = eventTypeId;
  createdBooking.value = null;
  bookingError.value = "";
  void loadAvailability(eventTypeId);
}

function reloadAvailability() {
  if (selectedEventTypeId.value) {
    void loadAvailability(selectedEventTypeId.value);
  }
}

async function submitBooking() {
  if (!selectedEventType.value || !selectedSlot.value) {
    return;
  }

  bookingSubmitting.value = true;
  bookingError.value = "";

  try {
    createdBooking.value = await api.createBooking({
      eventTypeId: selectedEventType.value.id,
      slotStartsAt: selectedSlot.value.startsAt,
      guest: {
        name: bookingForm.value.name,
        email: bookingForm.value.email,
      },
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      bookingError.value = `${error.code}: ${error.message}`;
    } else {
      bookingError.value = "Не удалось создать бронирование";
    }
  } finally {
    bookingSubmitting.value = false;
  }
}

function resetBookingState() {
  createdBooking.value = null;
  bookingForm.value = { name: "", email: "" };
  selectedSlot.value = null;
}

onMounted(() => {
  void loadEventTypes();
});
</script>
