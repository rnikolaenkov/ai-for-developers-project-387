# Calendar Booking API

## Описание проекта

Проект представляет собой **API-контракт** для системы бронирования встреч в календаре. Реализован на языке **TypeSpec** — предметно-ориентированном языке от Microsoft для описания API. Из исходного кода на TypeSpec генерируется спецификация **OpenAPI 3.0**.

Проект выполнен в рамках образовательной платформы **Hexlet**.

## Технологии

- **TypeSpec** (`@typespec/compiler` v1.12.0) — язык описания API
- `@typespec/http` — HTTP-привязка для TypeSpec
- `@typespec/openapi3` — генератор OpenAPI 3.0 из TypeSpec

## Структура проекта

```
.
├── main.tsp                 # Исходный код API-контракта (TypeSpec)
├── tspconfig.yaml           # Конфигурация компилятора TypeSpec
├── package.json             # npm-пакет (только devDependencies)
├── package-lock.json
├── tsp-output/
│   └── openapi.yaml         # Сгенерированная OpenAPI 3.0 спецификация
├── .github/workflows/
│   ├── hexlet-check.yml     # CI-проверка Hexlet
│   └── README.md
├── .gitignore
└── README.md
```

## Сборка

```bash
npm run spec:build
# или
tsp compile .
```

Результат: `tsp-output/openapi.yaml`

## Модели данных

| Модель | Описание |
|---|---|
| `EntityId` | Базовый строковый идентификатор (`string`) |
| `DurationMinutes` | Длительность встречи в минутах (`int32`, 1–1440) |
| `Timestamp` | Дата/время в формате RFC 3339 (`utcDateTime`) |
| `GuestContact` | Контактные данные гостя: `name`, `email` |
| `EventType` | Тип события для админки: `id`, `name`, `description`, `durationMinutes` |
| `PublicEventType` | Публичное представление типа события (без служебных полей) |
| `CreateEventTypeRequest` | Запрос на создание типа события |
| `Booking` | Бронирование: `id`, `eventTypeId`, `eventTypeName`, `startsAt`, `endsAt`, `durationMinutes`, `guest`, `createdAt` |
| `AvailableSlot` | Свободный слот: `startsAt`, `endsAt` |
| `AvailabilityResponse` | Доступность: `eventTypeId`, `windowStartsAt`, `windowEndsAt`, `slots[]` |
| `CreateBookingRequest` | Запрос на бронирование: `eventTypeId`, `slotStartsAt`, `guest` |

### Ошибки

| Модель | HTTP-статус | code |
|---|---|---|
| `ValidationError` | 422 | `validation_error` |
| `NotFoundError` | 404 | `not_found` |
| `SlotConflictError` | 409 | `slot_conflict` |
| `DuplicateResourceError` | 409 | `duplicate_resource` |

## API Endpoints

### Админская часть (`/admin`)

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/admin/event-types` | Создать новый тип события |
| `GET` | `/admin/event-types` | Список всех типов событий |
| `GET` | `/admin/bookings?from=` | Список будущих бронирований |

### Публичная часть (без авторизации)

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/event-types` | Публичный список типов событий |
| `GET` | `/event-types/{eventTypeId}/availability?from=&days=` | Свободные слоты |
| `POST` | `/bookings` | Создать бронирование |

## Бизнес-правила

1. Если параметр `from` не передан — сервер использует текущую дату/время.
2. Если параметр `days` не передан — сервер использует значение `14`.
3. `days` не может быть больше 14.
4. Гость может забронировать только слот, целиком лежащий внутри окна доступности.
5. Два бронирования не могут пересекаться по времени, даже если `eventTypeId` различается (глобальная занятость календаря).
6. Длительность встречи: от 1 до 1440 минут (1 сутки).
7. В системе один заранее заданный владелец календаря.
8. Авторизация отсутствует — админские маршруты считаются внутренними.

## CI/CD

- **Платформа:** GitHub Actions
- **Триггер:** push в любую ветку
- **Действие:** `hexlet/project-action@release` — автоматическая проверка Hexlet
