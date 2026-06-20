<template>
  <section class="page">
    <div class="page-intro">
      <h2>Admin bookings</h2>
      <p>Список будущих бронирований с опциональным фильтром `from` через `/admin/bookings`.</p>
    </div>

    <n-card title="Фильтр по дате">
      <n-space align="end" wrap>
        <n-date-picker v-model:value="fromDate" type="datetime" clearable />
        <n-button type="primary" @click="loadBookings">Применить</n-button>
        <n-button secondary @click="resetFilter">Сбросить</n-button>
      </n-space>
    </n-card>

    <PageState
      :loading="loading"
      :error="loadError"
      :empty="!loading && bookings.length === 0"
      loading-text="Загружаем бронирования"
      empty-text="Будущих бронирований пока нет"
      @retry="loadBookings"
    >
      <div data-testid="bookings-table">
        <n-data-table :columns="columns" :data="bookings" :pagination="{ pageSize: 8 }" />
      </div>
    </PageState>
  </section>
</template>

<script setup lang="ts">
import type { DataTableColumns } from "naive-ui";
import { h, onMounted, ref } from "vue";
import { NText } from "naive-ui";
import { api } from "../shared/api/client";
import type { Booking } from "../shared/api/types";
import { formatDateTime, toApiDateTime } from "../shared/lib/format";
import PageState from "../shared/ui/PageState.vue";

const bookings = ref<Booking[]>([]);
const loading = ref(false);
const loadError = ref("");
const fromDate = ref<number | null>(null);

const columns: DataTableColumns<Booking> = [
  {
    title: "Event",
    key: "eventTypeName",
  },
  {
    title: "Starts",
    key: "startsAt",
    render: (row) => h(NText, null, { default: () => formatDateTime(row.startsAt) }),
  },
  {
    title: "Ends",
    key: "endsAt",
    render: (row) => h(NText, null, { default: () => formatDateTime(row.endsAt) }),
  },
  {
    title: "Guest",
    key: "guest",
    render: (row) => h(NText, null, { default: () => `${row.guest.name} (${row.guest.email})` }),
  },
];

async function loadBookings() {
  loading.value = true;
  loadError.value = "";

  try {
    bookings.value = await api.listUpcomingBookings(toApiDateTime(fromDate.value));
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "Не удалось загрузить бронирования";
  } finally {
    loading.value = false;
  }
}

function resetFilter() {
  fromDate.value = null;
  void loadBookings();
}

onMounted(() => {
  void loadBookings();
});
</script>
