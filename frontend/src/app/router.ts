import type { RouteRecordRaw } from "vue-router";
import AdminBookingsPage from "../pages/AdminBookingsPage.vue";
import AdminEventTypesPage from "../pages/AdminEventTypesPage.vue";
import BookingPage from "../pages/BookingPage.vue";

export const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/booking" },
  { path: "/booking", component: BookingPage },
  { path: "/admin/event-types", component: AdminEventTypesPage },
  { path: "/admin/bookings", component: AdminBookingsPage },
];
