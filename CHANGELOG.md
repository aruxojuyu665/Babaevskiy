# Changelog — Бабаевская мастерская

## [0.1.1] — 2026-04-07

### fix: FabricShowcase — камера, размеры, видимость displacement

- **Камера**: `z=3.5, fov=35` → `z=5.5, fov=42` — все 5 тканей видны на десктопе (1920px)
- **Размер plane**: захардкоженный 2.5 → настраиваемый `size` prop (2.4), передаётся из canvas
- **Spacing**: 2.75 → 2.8, плоскости заполняют viewport без обрезки по краям
- **Высота контейнера**: 380px → 440px для лучшего вертикального заполнения
- **Освещение**: ambient снижен до 0.45, добавлен fill light для предотвращения пересвета (лён)
- **Debug**: одноразовый console.log в useFrame для проверки uniforms (uTime, uWaveAmp, uHover, segments)
- **Подтверждено**: ShaderMaterial с vertex displacement работает, 64×64 сегментов, rotation [-0.15, 0, 0]

## [0.1.0] — 2026-04-06

### Инфраструктура
- Next.js 16 + TypeScript + Tailwind CSS v4
- GSAP (ScrollTrigger) + Framer Motion + Lenis smooth scroll
- GitHub репо: aruxojuyu665/Babaevskiy
- API route `/api/lead` — сохранение заявок в JSON (готово к CRM)
- SEO: sitemap.xml, robots.txt, LocalBusiness JSON-LD, OG-теги

### 13 секций сайта
- **Header** — fixed, прозрачный → solid при скролле, бургер-меню на мобильных
- **Hero** — фоновое фото мастерской (AI), gradient text, parallax, fabric ripple за курсором, мини-форма callback, MagneticButton с shine-эффектом
- **TrustBar** — 4 метрики с animated counters (30+ лет, 1000+ изделий)
- **Transformation** — autoplay видео с текстами синхронизированными к прогрессу, progress bar, step indicators
- **Services** — 4 карточки с CSS IntersectionObserver stagger, hover glow, «Подробнее →»
- **Pricing** — 3 таблицы цен (диваны, кресла, другое), hover подсветка строк
- **Cases** — before/after интерактивный слайдер с тканевой текстурой на шторке, 4 кейса
- **Process** — 5 шагов с SVG thread timeline (нитка со стежками), шаги зажигаются при скролле
- **About** — фото мастерской, текст из ТЗ, цитата Cormorant Garamond, parallax
- **Reviews** — карусель 6 отзывов, авто-ротация, dots навигация
- **Calculator** — подробная форма (имя, телефон, тип мебели, фото до 5 шт, комментарий)
- **Contacts** — Яндекс.Карта, телефон, Telegram кнопка, мини-форма callback
- **Footer** — тёмный тёплый фон (#2C1810), навигация, контакты

### Формы
- Простая форма (телефон + «Перезвоните мне») — в Hero и Contacts
- Подробная форма «Узнать стоимость» — имя, телефон, тип мебели, загрузка фото, комментарий
- Маска ввода телефона +7 (___) ___-__-__
- Валидация российских номеров клиент + сервер

### Анимации и WOW-эффекты
- **Preloader** — SVG анимация: нитка рисуется, реалистичная швейная игла следует по кривой с правильным углом поворота, стежки появляются после прохождения иглы
- **Fabric Ripple** — canvas волновая текстура на Hero, реагирует на положение курсора (overlay blend)
- **Warm Cursor** — кастомный курсор (точка + кольцо), увеличивается на интерактивных элементах, скрыт на touch
- **Thread Timeline** — SVG волнистая нитка в секции процесса, стежки-маркеры, прогрессивная заливка
- **Curtain Texture** — тканая текстура (crosshatch) на шторке before/after слайдера
- **Magnetic Buttons** — кнопки притягиваются к курсору
- **Grain Overlay** — тонкий шум поверх всех фонов (fractalNoise SVG)
- **Smooth Scroll** — Lenis инерционная прокрутка
- **Parallax** — фоновые изображения Hero и About двигаются при скролле (GSAP ScrollTrigger)
- **Section Dividers** — декоративные разделители (ornament diamonds, stitch, wave)
- **Stagger Reveals** — каскадное появление элементов при скролле
- **Button Shine** — световой блик пробегает по кнопке при hover
- **Floating Orbs** — декоративные blur-круги на Hero
- **Scroll Hint** — анимированный mouse-scroll индикатор

### Дизайн-система
- Тёплая бежево-коричневая палитра (вдохновлена claude.ai)
- Шрифты: Playfair Display (заголовки), Inter (текст), Cormorant Garamond (акценты)
- CSS Custom Properties для всех цветов
- Тёплые тени, скругления 12-16px

### AI-генерированные изображения (15 шт)
- 4 кейса до/после (угловой диван, кресло, кухонный уголок, стул)
- 4 фото мастерской (hero, руки мастера, общий план, мастер за работой)
- 3 текстуры (велюр, кожа, каталог тканей)
- Видео трансформации дивана (Kling.ai) — 121 кадр извлечён через ffmpeg

### Что осталось для будущих версий
- [ ] Подключить email отправку (Resend API или Formspree)
- [ ] Telegram ссылка (заглушка `#`, клиент пришлёт)
- [ ] Яндекс.Метрика (когда дадут ID)
- [ ] Деплой на Beget/Vercel
- [ ] Домен (клиент зарегистрирует)
