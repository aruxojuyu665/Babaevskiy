# План работы: сайт «Бабаевская мастерская»
## Полный пайплайн от нуля до готового сайта

---

## Краткая карточка проекта (из ТЗ клиента)

| Параметр | Значение |
|----------|----------|
| Название | «Бабаевская мастерская» (в ТЗ также «Маркис» — **уточнить у клиента**) |
| Адрес | Москва, Иркутская 2к4 |
| Телефон | +7 977 977 39 39 |
| Услуги | Перетяжка мебели, замена наполнителей, замена механизмов, реставрация дерева |
| Мастера | Опыт от 6 до 30 лет, принцип «один мастер — одно изделие» |
| Стиль | «Как мастерская ручной работы» — тёплый, ламповый, ремесленный |
| Цвета | **Бежево-коричневая тёплая палитра** (по типу claude.ai) |
| Фотоматериалы | НЕТ — генерировать через AI (fal.ai Nano Banana) |
| Заявки | Email сейчас, CRM потом |
| Хостинг | Beget (доступ предоставят) |
| Домен | Зарегистрируют позже |
| Соцсети | Telegram (ссылку пришлют позже) |
| Референсы | peretyazhka1-msk.ru, prof-obivka.com |
| Цель | Готовый сайт под продвижение через рекламу |

---

## Стек технологий

| Технология | Роль |
|------------|------|
| Next.js 15 (App Router) | Фреймворк, SSG для Beget |
| TypeScript | Типизация |
| Tailwind CSS v4 | Стилизация |
| GSAP + ScrollTrigger | Scroll-анимации, видео-трансформация |
| Framer Motion | Компонентные анимации (hover, enter/exit) |
| Lenis | Плавный скролл |
| Sharp | Оптимизация изображений |
| shadcn/ui | UI-примитивы (формы, диалоги) |

---

## MCP-серверы для использования

| MCP | Для чего |
|-----|----------|
| **context7** | Актуальная документация Next.js 15, GSAP, Tailwind, Framer Motion, Lenis |
| **playwright** | Визуальное тестирование, скриншоты секций, проверка адаптива |
| **sequential-thinking** | Архитектурные решения, планирование сложных анимаций |
| **fal.ai (Nano Banana 2)** | Генерация фотореалистичных изображений мебели до/после |
| **lottiefiles** | Поиск тёплых ремесленных микро-анимаций (нитка, игла, инструменты) |
| **shadcn** | Установка UI-компонентов (Button, Input, Select, Sheet, Dialog) |

---

## Дизайн-концепция

### Настроение и философия
**«Тёплая мастерская»** — сайт должен ощущаться как визит в уютную мастерскую, где пахнет деревом и кожей. Не корпоративный, не шаблонный. Тёплый свет, натуральные текстуры, ощущение ручной работы и заботы.

### Цветовая палитра (тёплая, бежево-коричневая, как claude.ai)

```
CSS Custom Properties:

--bg-primary:     #FAF6F1   /* тёплый крем — основной фон */
--bg-surface:     #F0E8DE   /* тёплый беж — карточки, секции */
--bg-elevated:    #E8DDD0   /* песочный — hover, выделение */

--color-primary:  #C4956A   /* терракота/карамель — кнопки, акценты */
--color-dark:     #8B6544   /* насыщенный коричневый — hover кнопок */
--color-accent:   #D4A574   /* золотой песок — декоративные элементы */
--color-warm:     #B8845A   /* тёплый бронзовый — иконки */

--text-primary:   #2C1810   /* глубокий шоколад — основной текст */
--text-secondary: #6B5B4E   /* тёплый серо-коричневый — вторичный текст */
--text-muted:     #9A8B7D   /* приглушённый — подсказки, метки */

--border:         #E0D5C8   /* мягкая граница */
--white:          #FFFAF5   /* тёплый белый */
```

### Типографика

| Элемент | Шрифт | Размер | Вес |
|---------|-------|--------|-----|
| H1 (Hero) | **Playfair Display** | 56-72px / 36-48px моб. | 700 |
| H2 (Секции) | **Playfair Display** | 40-48px / 28-36px моб. | 600 |
| H3 (Подзаголовки) | **Inter** | 24-28px / 20-24px моб. | 600 |
| Body | **Inter** | 16-18px | 400 |
| Small/Caption | **Inter** | 14px | 400 |
| Accent/Quote | **Cormorant Garamond** | 20-24px | 400 italic |

**Playfair Display** — элегантная антиква для заголовков, передаёт ремесленный шарм.
**Inter** — чистый гротеск для текста, отличная читаемость.
**Cormorant Garamond** — для декоративных цитат и акцентов, добавляет «ламповости».

### Декоративные элементы
- Тонкая зернистая текстура (grain overlay) поверх фонов — ощущение бумаги/ткани
- Декоративные нити/стежки как разделители секций (SVG)
- Мягкие тени с тёплым оттенком (`box-shadow: 0 8px 32px rgba(139, 101, 68, 0.08)`)
- Скруглённые углы 12-16px для карточек
- Фоновые паттерны: тонкая «ткань» или «холст»

---

## Структура страницы (13 секций)

### 1. Header (навигация)
- **Тип:** Fixed, прозрачный → solid при скролле (backdrop-blur + бежевый фон)
- **Содержимое:** Логотип «Бабаевская мастерская» | Меню | Телефон | CTA-кнопка
- **Мобильная:** Бургер-меню → Sheet (shadcn) с навигацией
- **Анимация:** Плавное появление фона при скролле, hover-эффект на пунктах меню

### 2. Hero — первое впечатление
- **Высота:** 100vh
- **Фон:** Полноэкранное фото мастерской (AI-генерация) с тёплым overlay
- **Контент:**
  - H1: «Бабаевская мастерская»
  - Подзаголовок: «Перетяжка мягкой мебели в Москве. Один мастер — одно изделие.»
  - CTA: «Рассчитать стоимость» (scroll к форме)
  - Мини-форма: поле телефон + «Перезвоните мне»
- **Анимации:**
  - Staggered fade-in элементов при загрузке (GSAP)
  - Параллакс фонового изображения при скролле
  - Subtle fabric ripple на фоне при движении мыши (CSS/Canvas)
- **Изюминка:** Текстура ткани слегка «дышит» за курсором

### 3. Trust Bar — доверие с первого взгляда
- **Высота:** auto (~15vh)
- **Содержимое:** 4 метрики в ряд:
  - «30+ лет» — максимальный опыт мастера
  - «1000+» — перетянутых изделий
  - «1 мастер = 1 изделие» — принцип работы
  - «Гарантия» — на все работы
- **Анимация:** Animated counters при scroll-in, staggered появление

### 4. Scroll-видео трансформация — WOW-фактор
- **Высота:** 400vh (4 экрана прокрутки)
- **Технология:** Canvas + GSAP ScrollTrigger, привязка прогресса к кадрам видео
- **Сценарий:**
  - 0-25%: Старый диван → текст «Старая обивка? Не проблема.»
  - 25-50%: Разборка → «Разберём до каркаса»
  - 50-75%: Новая ткань → «Оденем в новую ткань»
  - 75-100%: Готовый результат → «Как новый. С гарантией.»
- **Мобильная:** `<video autoplay muted loop playsinline>` вместо canvas-scroll
- **Изюминка:** Текстовые блоки появляются из «стежка» — горизонтальная линия расширяется, из неё вырастает текст

### 5. Услуги — что делаем
- **Содержимое:** 4 карточки:
  1. Перетяжка мягкой мебели
  2. Замена наполнителей
  3. Замена механизмов
  4. Реставрация деревянной мебели
- **Для каждой:** Иконка (Lottie или SVG) + описание + «Подробнее»
- **Анимация:**
  - Карточки появляются staggered при scroll-in
  - Hover: карточка приподнимается, тёплая тень увеличивается
  - Иконки анимируются при hover (Lottie play)
- **Данные:** Описания из ТЗ клиента, цены как на peretyazhka1-msk.ru

### 6. Цены — прозрачность
- **Содержимое:** Таблицы цен по категориям (диваны, кресла, стулья, кровати)
- **Структура:** Как на peretyazhka1-msk.ru, но в тёплой стилистике
- **Анимация:** Rows появляются по одному при скролле
- **CTA внизу:** «Точную стоимость рассчитаем после осмотра» + кнопка

### 7. Кейсы до/после — портфолио
- **Содержимое:** 3-5 кейсов (AI-генерация)
- **UI:** Интерактивный слайдер с «шторкой» (drag для reveal)
- **Анимация:**
  - Эффект «занавес» — пользователь тянет, как ткань
  - Переключение кейсов — carousel с fade transition
- **Изюминка:** Шторка стилизована как ткань с текстурой

### 8. Процесс работы — 5 шагов
- **Содержимое:**
  1. Заявка — оставляете заявку на сайте или звоните
  2. Осмотр — мастер выезжает, оценивает мебель
  3. Выбор ткани — подбираем материал по каталогу
  4. Работа — перетяжка в мастерской (5-7 дней)
  5. Доставка — привозим обновлённую мебель
- **UI:** Горизонтальный timeline с иконками
- **Анимация:** Scroll-triggered, шаги «зажигаются» по очереди, соединительная линия прогрессирует

### 9. О мастерской — душа и история
- **Содержимое:** Текст из ТЗ клиента (адаптированный)
  - История, философия «один мастер — одно изделие»
  - Опыт мастеров (6-30 лет)
  - Цитата основателя (стилизованная, Cormorant Garamond italic)
- **Фон:** Фото мастерской (AI-генерация), тёплый overlay
- **Анимация:** Parallax фото, текст fade-in

### 10. Отзывы — социальное доказательство
- **Содержимое:** 6-8 отзывов (написать реалистичные)
- **UI:** Карусель карточек, авто-прокрутка + drag
- **Стиль:** Цитата + имя + тип мебели, «рукописный» акцент шрифтом Cormorant
- **Анимация:** Infinite scroll, pause on hover

### 11. Калькулятор / Подробная форма — «Узнать стоимость»
- **Содержимое:**
  - Имя
  - Телефон (маска +7 (___) ___-__-__)
  - Тип мебели (Select: диван, кресло, стул, кровать, другое)
  - Загрузка фото (до 5 файлов, drag-n-drop)
  - Комментарий (textarea)
  - Кнопка «Узнать стоимость»
- **Валидация:** Клиент + сервер, телефон обязателен
- **Анимация:** Поля появляются staggered, magnetic button для CTA
- **Изюминка:** Фон секции — текстура ткани, форма на «карточке» как рабочий лист мастера

### 12. Контакты — как найти
- **Содержимое:**
  - Адрес: Москва, Иркутская 2к4
  - Телефон: +7 977 977 39 39 (кликабельный tel:)
  - Яндекс.Карта (embed)
  - Мини-форма: телефон + «Перезвоните мне»
- **Анимация:** Карта fade-in при scroll-in

### 13. Footer
- **Содержимое:** Логотип, навигация, телефон, Telegram, копирайт
- **Стиль:** Тёмный тёплый фон (#2C1810), светлый текст
- **Анимация:** Нет (быстрая загрузка)

---

## Анимации — «изюминки» сайта

### Глобальные эффекты
| Эффект | Технология | Описание |
|--------|------------|----------|
| Grain overlay | CSS pseudo-element | Тонкий шум поверх фонов — ощущение бумаги/ткани |
| Smooth scroll | Lenis | Плавная инерционная прокрутка |
| Magnetic buttons | GSAP + mouse events | Кнопки слегка «притягиваются» к курсору |
| Stagger reveals | GSAP ScrollTrigger | Элементы появляются каскадом при скролле |
| Parallax layers | GSAP ScrollTrigger | Многослойный параллакс фонов |
| Warm cursor | CSS custom cursor | Кастомный тёплый круглый курсор (десктоп) |

### Уникальные эффекты
| Эффект | Где | Описание |
|--------|-----|----------|
| Fabric ripple | Hero фон | Текстура ткани «дышит» за курсором мыши |
| Stitch text reveal | Секция видео | Текст появляется из «стежка» — линия → текст |
| Curtain before/after | Кейсы | Шторка до/после стилизована как ткань |
| Thread timeline | Процесс | Линия процесса — нитка, шаги — стежки |
| Counter spin | Trust bar | Цифры «прокручиваются» как спидометр |
| Card lift | Услуги | Карточки мягко поднимаются с тёплой тенью |

### Анимация загрузки (Preloader)
- Минималистичная анимация: нитка с иглой «прошивает» название «Бабаевская мастерская»
- Длительность: 2-3 сек, затем reveal основного контента
- Технология: GSAP Timeline + SVG path animation

---

## ФАЗА 1: Генерация визуалов (fal.ai Nano Banana 2)
**Срок: 1-2 дня**

### 1.1: Генерация фото мебели «до/после»

Используем MCP fal.ai (Nano Banana 2) для фотореалистичной генерации.

**4 кейса для слайдера:**

| Кейс | «До» (промпт) | «После» (промпт) |
|------|----------------|-------------------|
| Угловой диван | Worn-out corner sofa with faded torn beige fabric, sagging cushions, visible stains. Warm workshop lighting, product photography, 4K | Luxurious corner sofa with fresh caramel velvet upholstery, perfect cushions, elegant warm tones. Warm studio lighting, product photography, 4K |
| Классическое кресло | Old armchair with ripped brown leather, scratches, worn armrests. Warm ambient lighting, product photography, 4K | Restored classic armchair with rich cognac leather, polished wooden legs, pristine condition. Warm studio lighting, product photography, 4K |
| Кухонный уголок | Kitchen bench seat with cracked vinyl, outdated pattern. Warm lighting, product photography, 4K | Modern kitchen bench with fresh linen fabric, clean lines, warm beige tones. Warm studio lighting, product photography, 4K |
| Обеденный стул | Dining chair with torn seat fabric, wobbly appearance. Warm lighting, product photography, 4K | Beautifully reupholstered dining chair with warm taupe fabric, refinished wooden frame. Warm studio lighting, product photography, 4K |

### 1.2: Генерация атмосферных фото

```
Промпты для fal.ai Nano Banana:

1. Hero фон: Cozy upholstery workshop interior, warm golden sunlight 
   through windows, fabric rolls on shelves, wooden workbench with tools, 
   soft bokeh. Cinematic warm tones, 4K, professional interior photography.
   → /public/process/workshop-hero.jpg

2. Руки мастера: Close-up of craftsman hands stretching new beige fabric 
   over sofa frame, warm workshop lighting, shallow depth of field, 
   artisan detail. 4K, editorial photography.
   → /public/process/craftsman-hands.jpg

3. Мастерская общий план: Spacious upholstery workshop with wooden frames, 
   rolls of warm-toned fabrics, vintage tools on pegboard, warm natural light. 
   Cozy atmosphere, 4K.
   → /public/process/workshop-wide.jpg

4. Текстура ткани: Premium velvet fabric in warm caramel color, 
   soft folds, macro photography, warm lighting. 4K.
   → /public/textures/velvet-warm.jpg

5. Текстура кожи: Premium cognac leather, natural grain, 
   warm tones, macro photography. 4K.
   → /public/textures/leather-cognac.jpg

6. Каталог тканей: Fabric sample swatches arranged in warm beige, 
   brown, caramel, cream palette. Flat lay, warm lighting. 4K.
   → /public/textures/fabric-swatches.jpg
```

### 1.3: Видео трансформации (Kling.ai)

Используем уже имеющийся файл `Rotating_Sofa_Reveal...mp4` или генерируем новый:

```
Промпт для Kling.ai:
The worn beige sofa slowly transforms — old fabric peels away revealing 
bare wooden frame, then fresh warm caramel velvet wraps over the frame 
piece by piece. Warm workshop lighting, smooth cinematic movement, 4K.
```

Извлечение кадров:
```bash
ffmpeg -i video/sofa-transform.mp4 -vf "select=not(mod(n\,2))" \
  -vsync vfr -q:v 3 frames/frame-%03d.jpg
```
Если > 200 кадров → пересэмплировать до 120-150.

---

## ФАЗА 2: Инициализация проекта
**Срок: 30 минут**

### 2.1: Создание Next.js проекта

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --turbopack
```

### 2.2: Установка зависимостей

```bash
npm install gsap @gsap/react framer-motion lenis
npm install -D sharp
```

### 2.3: Настройка shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add button input select textarea sheet dialog
```

### 2.4: Структура файлов

```
babaevskaya/
├── public/
│   ├── cases/              ← фото до/после (AI)
│   ├── process/            ← фото мастерской (AI)
│   ├── textures/           ← текстуры тканей (AI)
│   ├── video/              ← видео трансформации
│   ├── frames/             ← кадры из видео
│   └── icons/              ← SVG иконки
├── src/
│   ├── app/
│   │   ├── layout.tsx      ← шрифты, метаданные, providers
│   │   ├── page.tsx        ← композиция секций
│   │   ├── globals.css     ← CSS variables, base styles, grain
│   │   └── api/lead/
│   │       └── route.ts    ← API для формы заявки
│   ├── components/
│   │   ├── ui/             ← shadcn примитивы
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MagneticButton.tsx
│   │   ├── ScrollVideoPlayer.tsx
│   │   ├── BeforeAfterSlider.tsx
│   │   ├── AnimatedCounter.tsx
│   │   ├── GrainOverlay.tsx
│   │   ├── FabricRipple.tsx
│   │   ├── StitchReveal.tsx
│   │   └── Preloader.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── TrustBar.tsx
│   │   ├── Transformation.tsx
│   │   ├── Services.tsx
│   │   ├── Pricing.tsx
│   │   ├── Cases.tsx
│   │   ├── Process.tsx
│   │   ├── About.tsx
│   │   ├── Reviews.tsx
│   │   ├── Calculator.tsx
│   │   └── Contacts.tsx
│   ├── lib/
│   │   ├── animations.ts   ← GSAP конфиги, easing presets
│   │   ├── constants.ts    ← бизнес-данные, тексты, цены
│   │   └── utils.ts        ← утилиты (маска телефона, валидация)
│   └── styles/
│       └── fonts.ts        ← конфигурация Google Fonts
├── CLAUDE.md               ← контекст проекта для Claude Code
├── DESIGN.md               ← дизайн-концепция
├── .mcp.json               ← MCP серверы для проекта
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### 2.5: Создать CLAUDE.md

```markdown
# Проект: Сайт «Бабаевская мастерская»

## О проекте
Одностраничный сайт для мастерской по перетяжке мебели в Москве.
Ключевой элемент — scroll-driven видео-анимация трансформации мебели.
Стиль: тёплая ремесленная мастерская, ламповый, уютный, но современный.

## Стек
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- GSAP (ScrollTrigger) + Framer Motion + Lenis
- shadcn/ui для UI-примитивов
- Используй context7 для актуальных доков

## Бизнес-контекст
- Название: «Бабаевская мастерская»
- Адрес: Москва, Иркутская 2к4
- Телефон: +7 977 977 39 39
- Принцип: один мастер — одно изделие
- Мастера с опытом 6-30 лет

## Дизайн-принципы
- Цветовая палитра: тёплая бежево-коричневая (как claude.ai)
- Типографика: Playfair Display (заголовки), Inter (текст), Cormorant Garamond (акценты)
- Grain overlay для ощущения текстуры
- Magnetic buttons, stagger reveals, parallax
- Mobile-first, адаптивная вёрстка
- Формы: простая (телефон) и подробная (тип мебели + фото)
```

### 2.6: Создать .mcp.json

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

---

## ФАЗА 3: Дизайн-концепция и превью
**Срок: 1-2 часа**

### 3.1: Создать DESIGN.md
Перенести дизайн-концепцию из этого плана в отдельный DESIGN.md.

### 3.2: HTML-превью палитры
Сгенерировать статичный HTML с палитрой, типографикой и примером Hero.
Проверить через Playwright, сделать скриншот, показать клиенту.

### 3.3: Утверждение
Получить одобрение палитры и стилистики от клиента перед началом разработки.

---

## ФАЗА 4: Разработка (секция за секцией)
**Срок: 4-6 часов**

### Порядок реализации:

| # | Секция | Приоритет | Зависимости |
|---|--------|-----------|-------------|
| 1 | globals.css + layout.tsx (палитра, шрифты, grain) | Критичный | — |
| 2 | Header | Критичный | globals.css |
| 3 | Hero | Критичный | Header, AI-фото |
| 4 | TrustBar | Высокий | AnimatedCounter |
| 5 | ScrollVideoPlayer + Transformation | Высокий | Кадры видео |
| 6 | Services | Высокий | Lottie-иконки |
| 7 | Pricing | Средний | constants.ts (цены) |
| 8 | Cases (BeforeAfterSlider) | Высокий | AI-фото до/после |
| 9 | Process | Средний | SVG thread timeline |
| 10 | About | Средний | AI-фото мастерской |
| 11 | Reviews | Низкий | constants.ts (отзывы) |
| 12 | Calculator (подробная форма) | Высокий | API route |
| 13 | Contacts | Средний | Yandex Maps embed |
| 14 | Footer | Низкий | — |
| 15 | Preloader | Низкий | SVG + GSAP |

### Для каждой секции:
1. Реализовать компонент
2. Проверить через Playwright (скриншот десктоп + мобайл)
3. Скорректировать
4. `/clear` между крупными секциями для чистого контекста

### 4.1: Базовая настройка
```
Промпт: Настрой globals.css с CSS variables палитры, grain overlay,
layout.tsx с Google Fonts (Playfair Display, Inter, Cormorant Garamond),
Lenis smooth scroll provider, метаданные.
Используй context7 для доков Next.js 15 и Tailwind v4.
```

### 4.2: Header
```
Промпт: Реализуй Header — fixed, прозрачный → solid (backdrop-blur + #FAF6F1) 
при скролле. Лого, меню (Услуги, Цены, Портфолио, О нас, Контакты),
телефон +7 977 977 39 39, CTA кнопка «Рассчитать стоимость».
Мобильная: Sheet (shadcn) с бургер-меню.
Скриншот через Playwright.
```

### 4.3: Hero
```
Промпт: Реализуй Hero — 100vh, фоновое фото мастерской,
тёплый overlay gradient, H1 «Бабаевская мастерская» (Playfair Display),
подзаголовок, CTA кнопка (MagneticButton), мини-форма телефона.
GSAP staggered fade-in при загрузке, параллакс фона.
Скриншот через Playwright.
```

### 4.4-4.15: Остальные секции
Аналогичный подход: промпт → реализация → скриншот → корректировка.

---

## ФАЗА 5: Формы и бэкенд
**Срок: 1 час**

### 5.1: Простая форма (телефон + callback)
- Маска ввода +7 (___) ___-__-__
- Валидация: только российские номера
- Кнопка «Перезвоните мне»

### 5.2: Подробная форма «Узнать стоимость»
- Имя, телефон (маска), тип мебели (Select), фото (upload до 5), комментарий
- Drag-n-drop для фото
- Валидация клиент + сервер

### 5.3: API Route /api/lead
- Приём данных формы
- Отправка на email через Resend (или Formspree для static export)
- Сохранение в JSON (для будущей CRM)
- .env.local: EMAIL_TO, RESEND_API_KEY

### 5.4: Решение для Beget
- **Вариант A (рекомендуется):** Static export + Formspree/EmailJS для форм
- **Вариант B:** Vercel free tier (полный Next.js + API routes)
- **Вариант C:** Beget с Node.js (сложнее настройка)
- Обсудить с клиентом

---

## ФАЗА 6: Полировка и анимации
**Срок: 1-2 часа**

### 6.1: Глобальные анимации
- [ ] Lenis smooth scroll настроен и работает
- [ ] Grain overlay на всех фонах
- [ ] Magnetic buttons на всех CTA
- [ ] Stagger reveals для всех секций
- [ ] Parallax для фоновых изображений
- [ ] Custom cursor (десктоп)

### 6.2: Уникальные эффекты
- [ ] Fabric ripple на Hero
- [ ] Stitch text reveal в секции видео
- [ ] Curtain before/after в кейсах
- [ ] Thread timeline в процессе
- [ ] Preloader с анимацией нитки

### 6.3: Переходы между секциями
- [ ] Плавные fade/slide переходы
- [ ] Декоративные SVG-разделители (стежок)

---

## ФАЗА 7: Тестирование и оптимизация
**Срок: 1-2 часа**

### 7.1: Визуальный аудит (Playwright)
```
Скриншоты:
1. Десктоп 1920x1080 — каждая секция
2. Мобильная 375x812 — полная страница
3. Планшет 768x1024

Чеклист:
- Выглядит как уютная мастерская, а не шаблон?
- Палитра тёплая и согласованная?
- Анимации плавные, не тормозят?
- Текст читается?
- CTA кнопки заметны?
```

### 7.2: Производительность
- [ ] Все изображения через `<Image>` (Next.js оптимизация)
- [ ] Lazy loading для секций ниже fold
- [ ] Размер /public/frames/ < 20MB (иначе оптимизация через sharp)
- [ ] GSAP анимации не вызывают layout thrashing
- [ ] Lighthouse Performance > 80
- [ ] Lighthouse Accessibility > 90

### 7.3: SEO
- [ ] `<title>`: Перетяжка мебели в Москве — Бабаевская мастерская
- [ ] meta description (150-160 символов)
- [ ] Open Graph теги
- [ ] Структурированные данные (LocalBusiness schema)
- [ ] sitemap.xml
- [ ] robots.txt
- [ ] Яндекс.Метрика (когда дадут ID)

### 7.4: Кроссбраузерность
- [ ] Chrome (десктоп + мобильный)
- [ ] Safari (iOS)
- [ ] Firefox
- [ ] Edge

---

## ФАЗА 8: Деплой на Beget
**Срок: 1 час**

### 8.1: Подготовка сборки
```bash
# В next.config.ts:
# output: 'export' (для static hosting на Beget)

npm run build
# Результат: /out/ — статичные файлы
```

### 8.2: Загрузка на Beget
```
1. Получить доступ FTP/SSH от клиента
2. Загрузить содержимое /out/ в public_html/
3. Настроить .htaccess для SPA routing
4. Проверить работу на живом хостинге
```

### 8.3: Подключение домена
```
Когда клиент зарегистрирует домен:
1. Прописать DNS-записи на Beget
2. Настроить SSL (Let's Encrypt)
3. Проверить redirect http → https
```

---

## Чеклист перед сдачей клиенту

### Функциональность
- [ ] Все 13 секций отображаются корректно
- [ ] Scroll-видео анимация работает плавно
- [ ] Мобильный fallback (видео вместо canvas)
- [ ] Обе формы отправляют заявки на email
- [ ] Телефон кликабельный (tel: ссылка)
- [ ] Навигация скроллит к секциям
- [ ] Бургер-меню работает на мобильных

### Дизайн
- [ ] Тёплая бежево-коричневая палитра на всех секциях
- [ ] Grain overlay на фонах
- [ ] Анимации плавные и осмысленные
- [ ] Шрифты загружаются корректно
- [ ] Консистентные отступы и скругления

### Производительность
- [ ] Все изображения оптимизированы
- [ ] Lighthouse Performance > 80
- [ ] Lighthouse Accessibility > 90
- [ ] Первый контентный отрисовка < 2.5s

### SEO и аналитика
- [ ] SEO-теги на месте
- [ ] Структурированные данные (LocalBusiness)
- [ ] sitemap.xml + robots.txt
- [ ] Яндекс.Метрика (когда дадут ID)

### Тестирование
- [ ] Chrome, Safari, Firefox, Edge
- [ ] iOS Safari, Android Chrome
- [ ] Десктоп 1920, 1440, 1280
- [ ] Планшет 768, 1024
- [ ] Мобильный 375, 390, 414

---

## Важные примечания

### Про AI-фото
Клиент знает, что фото будут сгенерированы. Рекомендация: по мере накопления реального портфолио заменять AI-фото на настоящие — для рекламы через Яндекс.Директ реальные фото значительно эффективнее.

### Про название
В ТЗ фигурируют «Бабаевская мастерская» и «Маркис». **Уточнить у клиента до начала разработки.**

### Про хостинг и формы
Beget shared hosting не поддерживает Node.js. Рекомендуемые варианты:
- **A:** Static export + Formspree/EmailJS (простейший вариант)
- **B:** Vercel free tier (рекомендуется — бесплатно, полная поддержка Next.js)
- **C:** Beget VPS с Node.js (дороже)

### Про анимации на мобильных
Scroll-driven canvas анимации плохо работают на touch-устройствах. На мобильных автоматически подставляется `<video autoplay muted loop>`. Остальные анимации адаптированы: убраны hover-эффекты, упрощены переходы, сохранён grain overlay.
