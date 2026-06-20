<template>
  <n-config-provider abstract>
    <n-message-provider>
      <n-layout class="app-shell">
        <n-layout-header bordered class="app-header">
          <div class="app-header__inner">
            <div>
              <p class="eyebrow">Calendar Booking API</p>
              <h1 class="title">Frontend Prototype</h1>
            </div>
            <nav class="nav-links" aria-label="Основная навигация">
              <RouterLink to="/booking" class="nav-link" :class="{ 'nav-link--active': route.path.startsWith('/booking') }">
                Public booking
              </RouterLink>
              <RouterLink
                to="/admin/event-types"
                class="nav-link"
                :class="{ 'nav-link--active': route.path.startsWith('/admin/event-types') }"
              >
                Admin event types
              </RouterLink>
              <RouterLink
                to="/admin/bookings"
                class="nav-link"
                :class="{ 'nav-link--active': route.path.startsWith('/admin/bookings') }"
              >
                Admin bookings
              </RouterLink>
            </nav>
          </div>
        </n-layout-header>

        <n-layout-content embedded class="app-content">
          <RouterView />
        </n-layout-content>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>
