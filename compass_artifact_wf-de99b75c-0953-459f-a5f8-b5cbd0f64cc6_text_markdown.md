# Анимации и wow-эффекты для сайта мастерской реставрации мебели

Исследование **42 библиотек и источников** выявило **67 конкретных техник**, совместимых с текущим стеком (Next.js 16 + GSAP ScrollTrigger + Framer Motion + Lenis + Tailwind CSS v4). Ниже — приоритизированный план внедрения, отфильтрованный по тёплой ремесленной эстетике и отсортированный по соотношению wow-эффекта к сложности реализации. Все GSAP-плагины (SplitText, DrawSVG, MorphSVG, Flip) **бесплатны** после приобретения Webflow. View Transitions API доступен в Next.js 16 как стабильная фича. Тёплая палитра терракота/шоколад/крем **идеально соответствует** тренду 2026 года «nature distilled» и Pantone Color of the Year «Cloud Dancer».

---

## Tier 1 — обязательные эффекты с максимальным импактом

Эти техники дают наибольший wow-фактор при умеренной сложности. Каждая из них была отмечена как **5/5** по впечатлению и прекрасно вписывается в ремесленную тематику.

**Рукописная анимация названия мастерской (SVG DrawSVG + маска).** Конвертировать название мастерской в каллиграфический SVG в Figma, создать маску из однолинейного пути повторяющего порядок написания, анимировать `stroke-dashoffset` через GSAP DrawSVG. Для каллиграфических шрифтов с переменной толщиной — техника SVG `<mask>` поверх заливки. Запуск: при загрузке hero-секции. Реализация: `gsap.registerPlugin(DrawSVGPlugin); gsap.from(".workshop-name path", { drawSVG: 0, duration: 2.5, ease: "power1.inOut", stagger: 0.3 })`. Инструменты конвертации: text-to-svg.com, texttosvg.app, или `text-to-svg` npm-пакет для build pipeline.

**Скролл-раскрытие миссии через затухание слов (Magic UI TextReveal).** Текст миссии мастерской проявляется слово за словом по мере прокрутки — от приглушённого к яркому. Установка: `pnpm dlx shadcn@latest add @magicui/text-reveal`. Использование: `<TextReveal>Мы дарим новую жизнь вашей любимой мебели</TextReveal>`. Визуально напоминает чтение через марлю, которая постепенно проясняется — идеально для storytelling-секции.

**Pinned storytelling для секции «Наш процесс» (GSAP ScrollTrigger pin).** Секция фиксируется на экране, пока пользователь прокручивает 5 этапов: Консультация → Разборка → Ремонт каркаса → Перетяжка → Доставка. Каждый шаг анимируется в timeline, привязанном к scroll с `scrub: 1`. Код: `gsap.timeline({ scrollTrigger: { trigger: ".process", start: "top top", end: "+=3000", pin: true, scrub: 1 } }).to(".step-1", { opacity: 1, y: 0 })...`. Или использовать готовый компонент **Aceternity Sticky Scroll Reveal**: `npx shadcn@latest add @aceternity/sticky-scroll-reveal`.

**GSAP SplitText для заголовков секций.** Буквы поднимаются из-за невидимой маски-линии со stagger 0.02s. Новая версия SplitText v3.13+ имеет встроенный `mask: "lines"` и `autoSplit: true` для авторесайза. Код: `SplitText.create(".section-heading", { type: "words, chars", mask: "lines", onSplit: (self) => gsap.from(self.chars, { yPercent: 110, stagger: 0.02, scrollTrigger: { trigger: self.elements[0], start: "top 80%" } }) })`. Работает с уже установленным GSAP.

**SVG-маски для перехода между секциями на скролле (Codrops, март 2026).** Четыре вида scroll-driven переходов, раскрывающих полноэкранные изображения через SVG-маски — жалюзи, сетка, круг, горизонтальный свайп. Идеально для драматичного reveal before/after реставрации. Реализация на GSAP ScrollTrigger + SVG `<clipPath>`. Референс: tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll.

**Линза увеличения для деталей ткани (Aceternity Lens или Magic UI Lens).** Компонент-лупа, увеличивающий участок изображения при наведении — показывает текстуру ткани, качество строчки, фактуру дерева. Установка: `npx shadcn@latest add @aceternity/lens`. Альтернатива: `pnpm dlx shadcn@latest add @magicui/lens`. Wow-фактор для портфолио мастерской — клиенты видят качество работы в деталях.

**View Transitions API для переходов между страницами.** В Next.js 16 включается через `experimental: { viewTransition: true }` в next.config.js. Обернуть элементы в `<ViewTransition>` из React. Задать `view-transition-name: furniture-${id}` на карточках портфолио — изображения мебели **плавно морфируются** при переходе из каталога в детальную страницу. GPU-ускорение, **2-3x быстрее** библиотечных решений на слабых устройствах. Работает без AnimatePresence (которая проблемна с App Router).

---

## Tier 2 — сильные дополнения, существенно повышающие уровень

Каждый эффект ниже оценён на **4/5 wow-factor** и реализуется за 15-60 минут.

**Drag Cards — «доска настроений» для тканей (Hover.dev).** Свободно перетаскиваемые карточки с образцами тканей и вдохновляющими фотографиями, разбросанные по viewport. Framer Motion `drag` + `dragElastic`. Бесплатный компонент — скопировать `DragCards.jsx` с hover.dev/components/cards. Применение: секция «Подберите ткань» или mood board в портфолио.

**Squishy Card — эффект «подушки» при нажатии (Hover.dev).** Карточка с пружинной деформацией при hover/press — как нажатие на мягкую подушку. Прямая метафора перетяжки! Бесплатный компонент с hover.dev. Использует `spring` transition из Framer Motion.

**TiltedCard для портфолио (ReactBits).** Перспективный наклон карточки, следящий за курсором, с масштабированием при наведении. Установка: `npx shadcn@latest add @react-bits/TiltedCard-TS-TW`. Параметры: `rotateAmplitude={12} scaleOnHover={1.05}`. Тактильное, физическое ощущение для карточек «до/после».

**Focus Cards для услуг (Aceternity UI).** При наведении на одну карточку остальные размываются — эффект фокуса. Установка: `npx shadcn@latest add @aceternity/focus-cards`. Применение: блок услуг (Диваны, Кресла, Стулья, Обеденные группы).

**Parallax Scroll — двухколоночная галерея (Aceternity UI).** Две колонки изображений скроллятся в противоположных направлениях. Установка: `npx shadcn@latest add @aceternity/parallax-scroll`. Визуально напоминает ленты ткани, плывущие мимо друг друга.

**Elastic Grid Scroll для портфолио (Codrops, июнь 2025).** Колонки сетки движутся с разной скоростью при прокрутке — центральные быстрее, крайние отстают. Мягкий, упругий эффект. Реализация: GSAP ScrollSmoother + lag-based layout. Референс: tympanus.net/codrops/2025/06/03/elastic-grid-scroll.

**Text Generate Effect для hero (Aceternity UI).** Текст проявляется слово за словом при загрузке — как мысль, формирующаяся в реальном времени. Установка: `npx shadcn@latest add @aceternity/text-generate-effect`. Применение: «Каждая мебель хранит свою историю. Мы помогаем её продолжить.»

**MorphSVG — силуэт мебели до/после (GSAP).** SVG-силуэт потёртого кресла плавно трансформируется в отреставрированное. `gsap.registerPlugin(MorphSVGPlugin); gsap.to("#old-chair", { morphSVG: "#restored-chair", duration: 1.5 })`. Автоматическое выравнивание точек — формы не обязаны совпадать по количеству.

**Swipe Cards для просмотра портфолио (Hover.dev).** Стопка карточек с жестом смахивания (Tinder-стиль). Бесплатный компонент с Framer Motion drag physics. Применение: мобильный просмотр работ мастерской.

**Lottie-анимации инструментов мастерской (LottieFiles).** Пак «Sewing» на LottieFiles: швейная машина, игла с нитью, ножницы, напёрсток, рулетка. Интеграция: `@lottiefiles/dotlottie-react` (WebAssembly-рендерер, .lottie формат на **80% легче** JSON). Обязательно SSR: `dynamic(() => import("@lottiefiles/dotlottie-react").then(m => m.DotLottieReact), { ssr: false })`. Применение: анимированные иконки услуг, loading states, 404-страница с распускающейся тканью.

---

## Tier 3 — утончённые улучшения и микро-взаимодействия

**ScrollFloat — «всплывающий» текст (ReactBits).** Текст мягко поднимается в позицию при скролле, как ткань, разворачивающаяся на ветру. Установка: `npx jsrepo add .../TextAnimations/ScrollFloat`. Применение: подзаголовки секций.

**Odometer-стиль счётчиков (Shadcn Sliding Number).** Каждая цифра прокручивается независимо с пружинной физикой — как механический счётчик. Заменить текущие animated counters в trust bar. Альтернативы: `react-countup` с `enableScrollSpy: true` и Odometer plugin, или **Magic UI Number Ticker**: `pnpm dlx shadcn@latest add @magicui/number-ticker`.

**Ken Burns эффект для галереи.** Медленное панорамирование и масштабирование по фотографиям мастерской (15-20 секунд). Чистый CSS: `@keyframes kenburns { from { transform: scale(1) translate(0,0); } to { transform: scale(1.2) translate(-5%, -3%); } }`. GPU-ускорение, нулевой JS.

**Анимация градиентного текста в заголовках (Magic UI / ReactBits).** Плавный переход цвета по тексту — терракота → шоколад → крем. Установка: `pnpm dlx shadcn@latest add @magicui/animated-gradient-text`. Параметры: `colorFrom="#C4956A" colorTo="#2C1810"`.

**Vintage-фильтр для фотографий (CSS).** CSS-only обработка: `filter: sepia(20%) contrast(1.1) brightness(0.95)` + SVG-шум `feTurbulence` с `mix-blend-mode: overlay`. Для усиления: `grained.js` — лёгкий animated grain с настраиваемой плотностью и прозрачностью.

**Marquee — бегущая строка отзывов/брендов (Magic UI).** Бесконечная прокрутка логотипов тканей, отзывов клиентов. Установка: `pnpm dlx shadcn@latest add @magicui/marquee`. Лёгкий CSS-transform, никакого JS overhead.

**Infinite Moving Cards для отзывов (Aceternity UI).** Карточки с отзывами прокручиваются в бесконечной петле. Установка: `npx shadcn@latest add @aceternity/infinite-moving-cards`. Фон карточек — крем `#FAF6F1`, кавычки — терракота `#C4956A`.

**BlurText — размытие → резкость (ReactBits).** Текст проявляется из размытия посимвольно. Установка: `npx shadcn@latest add @react-bits/BlurText-TS-TW`. Применение: цитаты мастеров, эпиграфы к секциям.

**react-parallax-tilt на карточках портфолио.** Компонент 3D-наклона при наведении. npm: `react-parallax-tilt`. Параметры: `tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.15} scale={1.02}`. Альтернатива: `vanilla-tilt.js` (3-5KB).

**RotatingText для hero (ReactBits).** Циклическая смена слов: «Мы реставрируем [диваны | кресла | пуфы | стулья]». Установка через jsrepo/shadcn CLI из ReactBits.

---

## Tier 4 — микро-взаимодействия для форм и кнопок

**Морфинг кнопки отправки: текст → спиннер → галочка.** При отправке формы текст исчезает (`AnimatePresence`), появляется spinner, затем SVG-галочка рисуется через `motion.path` с `pathLength: [0, 1]`. Для подтверждения бронирования — добавить `canvas-confetti` конфетти-взрыв.

**Floating label на инпутах формы.** Лейбл поднимается наверх при фокусе с Framer Motion `animate`. Обратная связь валидации: красный shake `x: [0, -10, 10, -10, 0]`, зелёный SVG-checkmark.

**Spring-toggle для переключателей.** `layout` prop на элементе-ползунке + `spring` transition для физичной анимации. Применение: переключатель «Стандарт / Премиум» в прайс-секции.

**Warm shimmer skeleton screens.** Tailwind keyframe: `shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } }`. Градиент: `from-amber-100 via-amber-50 to-amber-100`. Или `react-loading-skeleton` с `baseColor="#F5EDE4" highlightColor="#FAF6F1"`.

**Blur-up загрузка изображений мебели.** Next.js `placeholder="blur"` + `blurDataURL` для постепенного проявления фотографий из тёплого размытия. Для кастомного эффекта: обернуть `next/image` в `motion.div` с анимацией `filter: blur(20px)` → `blur(0px)`.

**Spring physics на всех hover-состояниях.** Заменить все `duration`-based transitions на `type: "spring"` с `stiffness: 260, damping: 20`. Органичнее для ремесленного бренда, чем линейные или ease-кривые.

---

## Tier 5 — продвинутые CSS-only эффекты (нулевой JS overhead)

**CSS scroll-driven animations** — **Baseline в 2026**, поддержка всех браузеров. `animation-timeline: scroll()` привязывает анимации к позиции скролла **вне основного потока** — 60fps даже при тяжёлой гидрации. `animation-timeline: view()` заменяет IntersectionObserver для reveal-анимаций. Новое в Chrome 145: `animation-trigger` — CSS-only замена AOS.js. Применение: прогресс-бары, параллакс фонов, fade-in секций без единой строки JS. Референс: scroll-driven-animations.style.

**CSS `@starting-style` для entry-анимаций.** Определяет начальное состояние элемента при появлении из `display: none`. Работает с `transition-behavior: allow-discrete`. Для stagger: `transition-delay: calc((sibling-index() - 1) * 100ms)`. Браузерная поддержка: ~86%+. Применение: модалки, тосты, динамически добавляемые элементы.

**CSS Masonry для портфолио-грида.** `grid-template-rows: masonry` — Pinterest-раскладка без JS. Пока экспериментальная, но идеальна для отображения работ мастерской разных пропорций.

**CSS `@property` для анимации кастомных свойств.** Зарегистрировать `--warm-hue` через `@property` и анимировать цветовые переходы в градиентах — невозможно стандартными CSS transitions.

---

## Tier 6 — premium-эффекты (stretch goals)

**hover-effect — distortion при наведении (WebGL).** npm-пакет `hover-effect` на базе Three.js — displacement map переход между двумя изображениями при hover. Параметры: `intensity`, `image1` (до), `image2` (после), `displacementImage` (шум). Применение: hero-секция, одно-два featured изображения. Не использовать массово — **тяжёлый** WebGL. Wow-factor: 5/5.

**3D-модель кресла с интерактивной сменой ткани (R3F).** React Three Fiber + drei: загрузить .glb модель через `useGLTF()`, OrbitControls для вращения, клик для смены материала. `@react-three/postprocessing` для depth of field. Бандл: Three.js ~150KB gzipped — обязательно code-split и lazy load. Для adaptive quality: `PerformanceMonitor` из drei.

**Cloth simulation — ткань на кресле (R3F).** Запечь cloth-симуляцию в Blender, экспортировать как animated glTF, воспроизвести в R3F. Более реалистично и легче, чем real-time Verlet integration. Референс: GitHub `nikpundik/react-three-fiber-cloth-example`.

**Sound design — ремесленные UI-звуки (Howler.js).** 7KB gzipped, audio sprites, кроссбраузерный fallback. Звуки: мягкий удар молотка (клик кнопки), щелчок ножниц (завершение секции), натяжение ткани (before/after reveal), стук дерева (навигация). **Обязательно opt-in** — звук выключен по умолчанию. Тёплые низкие частоты, длительность ≤0.3s. WebM + MP3 fallback. Lazy load после контента.

**Aurora — тёплое сияние фона (ReactBits).** WebGL-эффект aurora borealis через R3F. Кастомизация: `colorStops={["#C4956A", "#FAF6F1", "#2C1810"]}`. Тяжёлый (Three.js), но визуально потрясающий для hero. Установка: `npx shadcn@latest add @react-bits/Aurora-TS-TW`.

---

## Секция отзывов — лучшие варианты реализации

Исследование показало, что **Aceternity UI** имеет полноценный набор компонентов для отзывов, идеально совместимый со стеком. Рекомендуемый вариант: **Animated Testimonials** (`npx shadcn@latest add @aceternity/animated-testimonials`) — минималистичные карточки с фото и цитатой, анимированные через Framer Motion. Для более интерактивного подхода: **Testimonials Background With Drag** — перетаскиваемые карточки с случайными поворотами, создающие ощущение органичности и «ручной работы». Фон карточек: крем `#FAF6F1`, кавычки и акценты: терракота `#C4956A`, текст: шоколад `#2C1810`. Включить фото клиентов рядом с их перетянутой мебелью.

## Прайс-секция — рекомендуемый подход

Использовать **карточки по типам мебели** (стул, кресло, диван, нестандарт) с фотографиями как заголовками вместо абстрактных «Базовый/Стандарт/Премиум». Framer Motion hover: `whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(44,24,16,0.15)" }}` с `spring` transition. Добавить переключатель типа ткани (стандарт/премиум/люкс), динамически обновляющий цены через `AnimatePresence`. CTA «Получить точный расчёт» с анимированным переходом к форме контактов. Готовая основа: **Aceternity UI Pricing Section**.

## Контактная секция — креативное решение

Split-screen: слева — тёплая фотография мастера за работой + карта мастерской; справа — форма с кнопками-селекторами услуг, стилизованными под образцы тканей в палитре сайта. Поля формы проявляются с stagger-анимацией на скролле. Микрокопия «Что будет дальше» задаёт ожидания по времени ответа.

---

## Инструменты для ускорения реализации

**Magic UI MCP Server** — интеграция для Cursor/Windsurf/Claude: `pnpm dlx @magicuidesign/cli@latest install cursor`. Позволяет AI-ассистенту напрямую генерировать и модифицировать Magic UI компоненты. **GSAP `@gsap/react`** — официальный React-хук `useGSAP()` с автоматической очисткой. Установка: `npm install @gsap/react`. **AutoAnimate** (13K+ звёзд) — zero-config анимация для списков и изменений состояния, один `useAutoAnimate()` хук. **Tailwind CSS Motion** — CSS-only анимации через утилитарные классы, без JS.

## Совместимость и важные заметки

Синхронизация Lenis + GSAP ScrollTrigger обязательна: `lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((time) => lenis.raf(time * 1000)); gsap.ticker.lagSmoothing(0)`. Framer Motion v12+ импортируется из `motion/react`, не из `framer-motion`. AnimatePresence exit-анимации **не работают надёжно** с Next.js App Router — использовать View Transitions API вместо них. Все GSAP плагины (SplitText, DrawSVG, MorphSVG, Flip, ScrollSmoother) теперь **бесплатны** — `npm install gsap` включает всё. Текущий стек Lenis + GSAP ScrollTrigger — **оптимальная комбинация для 2026**, менять не нужно. Locomotive Scroll v5 устарел и ломает `position: sticky`.

## Чего избегать

Не использовать Aceternity Background Beams, Vortex, Meteors, Shooting Stars (слишком sci-fi). Не использовать ReactBits Ballpit, GridDistortion, GlitchText (слишком tech). Не использовать Magic UI Globe, Orbiting Circles, Neon Gradient Card (эстетика tech-стартапа). Не использовать Hover.dev Shimmer Border Card (слишком футуристично). Любые компоненты с неоновым свечением, matrix-эффектами, cyber-aesthetic — **категорически нет** для ремесленного бренда.