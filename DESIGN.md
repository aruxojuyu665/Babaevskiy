# DESIGN.md — Дизайн-концепция «Бабаевская мастерская»

## Настроение
**«Тёплая мастерская»** — визит в уютную мастерскую, где пахнет деревом и кожей.
Не корпоративный, не шаблонный. Тёплый свет, натуральные текстуры, ручная работа.

## Цветовая палитра

```css
:root {
  --bg-primary:     #FAF6F1;   /* тёплый крем */
  --bg-surface:     #F0E8DE;   /* тёплый беж */
  --bg-elevated:    #E8DDD0;   /* песочный */
  --color-primary:  #C4956A;   /* терракота */
  --color-dark:     #8B6544;   /* коричневый */
  --color-accent:   #D4A574;   /* золотой песок */
  --color-warm:     #B8845A;   /* бронзовый */
  --text-primary:   #2C1810;   /* шоколад */
  --text-secondary: #6B5B4E;   /* серо-коричневый */
  --text-muted:     #9A8B7D;   /* приглушённый */
  --border:         #E0D5C8;   /* граница */
  --white:          #FFFAF5;   /* тёплый белый */
}
```

## Типографика
- **H1:** Playfair Display 700, 56-72px
- **H2:** Playfair Display 600, 40-48px
- **H3:** Inter 600, 24-28px
- **Body:** Inter 400, 16-18px
- **Accent:** Cormorant Garamond 400i, 20-24px

## Декоративные элементы
- Grain overlay (CSS noise) — текстура бумаги/ткани
- SVG стежки как разделители секций
- Тёплые тени: `box-shadow: 0 8px 32px rgba(139, 101, 68, 0.08)`
- Скругления: 12-16px
- Фоновый паттерн: тонкий холст

## 13 секций
1. Header — fixed, transparent → solid
2. Hero — 100vh, фото мастерской, fabric ripple
3. TrustBar — 4 метрики, animated counters
4. Transformation — 400vh, scroll-driven video
5. Services — 4 карточки с hover lift
6. Pricing — таблицы цен
7. Cases — before/after curtain slider
8. Process — 5 шагов, thread timeline
9. About — история, философия
10. Reviews — карусель отзывов
11. Calculator — подробная форма
12. Contacts — карта + мини-форма
13. Footer — тёмный тёплый (#2C1810)
