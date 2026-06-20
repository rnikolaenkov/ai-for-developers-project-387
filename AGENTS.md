# AGENTS.md

## Что это

Проект **Calendar Booking API** — система бронирования встреч в календаре.
Состоит из TypeSpec-контракта, бэкенда на Fastify и фронтенда на Vue 3.

## Ключевые файлы

| Файл | Назначение |
|------|------------|
| `.github/workflows/hexlet-check.yml` | Автосгенерированный CI Hexlet — **не редактировать и не удалять** |
| `main.tsp` | API-контракт на TypeSpec |
| `tspconfig.yaml` | Конфигурация TypeSpec (генерация OpenAPI 3.0 в `tsp-output/`) |
| `backend/` | Fastify-сервер, TypeScript, Vitest |
| `frontend/` | Vue 3 + Vite + Naive UI, Vitest + Playwright e2e |
| `Dockerfile` | Многостадийная сборка (backend + frontend) |
| `railway.json` | Деплой на Railway через Docker |

## Команды

```bash
# TypeSpec: сборка спецификации
npm run spec:build

# Бэкенд
npm run backend:dev       # tsx watch
npm run backend:build     # tsc
npm run backend:test      # vitest run

# Фронтенд
npm run frontend:test:e2e # playwright test (запускает сервер автоматически)
npm --prefix frontend run dev    # vite dev
npm --prefix frontend run build  # vue-tsc --noEmit && vite build
npm --prefix frontend run test   # vitest run
npm --prefix frontend run test:e2e:ui  # playwright --ui
```

## Тестирование

- **Бэкенд**: `npm run backend:test` — Vitest, среда `node`
- **Фронтенд unit**: `npm --prefix frontend run test` — Vitest + happy-dom
- **Фронтенд e2e**: `npm run frontend:test:e2e` — Playwright, сам поднимает `backend:start:test` и `vite dev`, фиксированное время (`NOW=2026-06-20T08:00:00.000Z`)

## Рабочий процесс

- Push запускает Hexlet CI через `hexlet/project-action`.
- Release Please настроен для автоматического changelog (node-стиль).
Шаблон учебного проекта Hexlet — пока пустой скелет. Настоящая работа
(упражнения, тесты) выполняется на платформе Hexlet.

## Описание проекта

добавляем организационную обвязку для проекта https://github.com/rnikolaenkov/ai-for-developers-project-386:

- Настройка OpenCode GitHub App.
- Работа с issue через комментарии.
- Создание и доработка PR агентом.
- Регулярные ночные проверки (например, Lighthouse) через schedule workflow.

## Что должно получиться

В репозитории должны появиться рабочие GitHub Actions и артефакты процесса:

- Ответ агента в issue.
- Пример triage/разбора задачи.
- PR с правками от агента и доработками после ревью.
- Scheduled workflow с отчетом по регулярной проверке.

## Ключевые файлы

| Файл                                 | Назначение                                                        |
| ------------------------------------ | ----------------------------------------------------------------- |
| `.github/workflows/hexlet-check.yml` | Автосгенерированный CI Hexlet — **не редактировать и не удалять** |
| `README.md`                          | Только бейдж; будет заполнен в ходе выполнения упражнения         |

## Рабочий процесс

- Пуш запускает удалённые проверки Hexlet через `hexlet/project-action`.
- Локальных команд сборки, тестов, линтинга и форматирования пока нет.
- Основная разработка происходит вне этого репозитория, на платформе Hexlet.
