import "@typespec/http";
import "@typespec/openapi3";

using Http;

@service(#{ title: "Calendar Booking API" })
@server("http://localhost:3000", "Local development server")
namespace CalendarBooking;

/**
 * Базовый идентификатор сущности.
 */
alias EntityId = string;

/**
 * Длительность встречи в минутах.
 */
@minValue(1)
@maxValue(1440)
scalar DurationMinutes extends int32;

/**
 * Дата и время в формате RFC 3339.
 */
scalar Timestamp extends utcDateTime;

/**
 * Гость бронирует слот без аккаунта, поэтому контактные данные
 * передаются прямо в запросе на создание бронирования.
 */
model GuestContact {
  @doc("Имя гостя, отображаемое владельцу календаря в списке встреч.")
  name: string;

  @doc("Email гостя для подтверждения и дальнейшей коммуникации.")
  email: string;
}

/**
 * Тип события, который настраивает владелец календаря в админской части.
 */
model EventType {
  @key
  id: EntityId;

  name: string;
  description: string;
  durationMinutes: DurationMinutes;
}

/**
 * Публичное представление типа события для гостя.
 */
model PublicEventType {
  id: EntityId;
  name: string;
  description: string;
  durationMinutes: DurationMinutes;
}

/**
 * Данные для создания нового типа события владельцем календаря.
 */
model CreateEventTypeRequest {
  @doc("Клиент передает id явно, так как это указано в бизнес-требованиях.")
  id: EntityId;

  name: string;
  description: string;
  durationMinutes: DurationMinutes;
}

/**
 * В системе только один заранее заданный владелец календаря,
 * поэтому бронирование всегда относится к одному общему календарю.
 */
model Booking {
  @key
  id: EntityId;

  eventTypeId: EntityId;
  eventTypeName: string;
  startsAt: Timestamp;
  endsAt: Timestamp;
  durationMinutes: DurationMinutes;
  guest: GuestContact;
  createdAt: Timestamp;
}

/**
 * Свободный слот для бронирования.
 */
model AvailableSlot {
  startsAt: Timestamp;
  endsAt: Timestamp;
}

/**
 * Доступность по выбранному типу события.
 */
model AvailabilityResponse {
  eventTypeId: EntityId;
  windowStartsAt: Timestamp;
  windowEndsAt: Timestamp;
  slots: AvailableSlot[];
}

/**
 * Запрос на создание бронирования.
 */
model CreateBookingRequest {
  eventTypeId: EntityId;
  slotStartsAt: Timestamp;
  guest: GuestContact;
}

/**
 * Ошибка валидации входных данных или бизнес-ограничений.
 */
@error
model ValidationError {
  @statusCode
  statusCode: 422;

  code: "validation_error";
  message: string;
}

/**
 * Ошибка, если тип события не найден.
 */
@error
model NotFoundError {
  @statusCode
  statusCode: 404;

  code: "not_found";
  message: string;
}

/**
 * Ошибка конфликта, если слот уже занят.
 */
@error
model SlotConflictError {
  @statusCode
  statusCode: 409;

  code: "slot_conflict";
  message: string;
}

/**
 * Ошибка при попытке создать сущность с уже существующим id.
 */
@error
model DuplicateResourceError {
  @statusCode
  statusCode: 409;

  code: "duplicate_resource";
  message: string;
}

/**
 * Админская часть. Авторизации нет, поэтому эти маршруты считаются
 * внутренними и по умолчанию работают от имени единственного владельца календаря.
 */
@route("/admin")
namespace Admin {
  /**
   * Создать новый тип события.
   */
  @route("/event-types")
  @post
  op createEventType(@body input: CreateEventTypeRequest): EventType | DuplicateResourceError | ValidationError;

  /**
   * Получить список всех типов событий владельца.
   */
  @route("/event-types")
  @get
  op listEventTypes(): EventType[];

  /**
   * Получить список всех будущих бронирований вне зависимости от типа события.
   */
  @route("/bookings")
  @get
  op listUpcomingBookings(@query from?: Timestamp): Booking[];
}

/**
 * Публичная часть без регистрации и авторизации.
 */
namespace Public {
  /**
   * Публичная страница со списком видов бронирования.
   */
  @route("/event-types")
  @get
  op listPublicEventTypes(): PublicEventType[];

  /**
   * Свободные слоты на ближайшие 14 дней по выбранному типу события.
   *
   * Правило занятости глобальное для календаря:
   * если слот уже занят любым другим событием, он не возвращается как доступный.
   */
  @route("/event-types/{eventTypeId}/availability")
  @get
  op getAvailability(
    @path eventTypeId: EntityId,
    @query from?: Timestamp,
    @query days?: int32
  ): AvailabilityResponse | NotFoundError | ValidationError;

  /**
   * Создать бронирование на свободный слот в пределах допустимого окна.
   */
  @route("/bookings")
  @post
  op createBooking(@body input: CreateBookingRequest): Booking | NotFoundError | SlotConflictError | ValidationError;
}

/**
 * Дополнительные правила контракта:
 * 1. Если query-параметр from не передан, сервер использует текущую дату и время.
 * 2. Если query-параметр days не передан, сервер использует значение 14.
 * 3. Сервер обязан отклонять days > 14.
 * 4. Гость может бронировать только слот, который целиком лежит внутри окна доступности.
 * 5. На одно и то же время нельзя создать две записи, даже если eventTypeId различается.
 */
