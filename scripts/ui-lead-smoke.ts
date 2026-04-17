/**
 * UI-fidelity smoke for /api/lead.
 *
 * Replicates the EXACT fetch() calls that the 5 form components make in the
 * browser — same headers, same payload shape, same content-type. The only
 * difference from a real browser is we skip the React render layer and hit
 * the locally running Next.js dev server directly.
 *
 * Scenarios covered:
 *  1. Hero.tsx           → JSON { phone, type: "callback" }
 *  2. Contacts.tsx       → JSON { phone, type: "callback" }
 *  3. Calculator.tsx     → multipart/form-data (type=calculator + photos)
 *  4. Corporate.tsx      → JSON { phone, type: "corporate" }
 *  5. FabricShowcase.tsx → JSON { phone, type: "fabric-samples" }
 */

const BASE_URL = process.env.LEAD_SMOKE_URL ?? "http://localhost:3000";
const PHONE = process.env.LEAD_SMOKE_PHONE ?? "+7 (999) 123-45-67";

interface Scenario {
  label: string;
  build: () => RequestInit & { url: string };
}

interface ServerResponse {
  success: boolean;
  id?: string;
  persisted?: boolean;
  emailed?: boolean;
  error?: string;
}

function heroFetch(): RequestInit & { url: string } {
  // Mirrors src/sections/Hero.tsx handleSubmit.
  return {
    url: `${BASE_URL}/api/lead`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: PHONE, type: "callback" }),
  };
}

function contactsFetch(): RequestInit & { url: string } {
  // Mirrors src/sections/Contacts.tsx handleSubmit.
  // Note: Hero and Contacts currently send identical payloads. To distinguish
  // them in email, the UI would need to add `source: "hero" | "contacts"` —
  // single-line change, backend already supports it.
  return {
    url: `${BASE_URL}/api/lead`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: PHONE, type: "callback" }),
  };
}

function calculatorFetch(): RequestInit & { url: string } {
  // Mirrors src/sections/Calculator.tsx handleSubmit exactly:
  //   body.append("name", ...)
  //   body.append("phone", ...)
  //   body.append("furnitureType", ...)
  //   body.append("comment", ...)
  //   body.append("type", "calculator")
  //   files.forEach(f => body.append("photos", f))
  const body = new FormData();
  body.append("name", "Артём Тестовый");
  body.append("phone", PHONE);
  body.append("furnitureType", "Диван прямой");
  body.append("comment", "Порвалась обивка на сидении. Прошу рассчитать стоимость перетяжки.");
  body.append("type", "calculator");

  // Tiny valid PNG as a stand-in for user-uploaded photo.
  const pngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x5b, 0x6e, 0x2f, 0x9b, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  const file = new File([pngBytes], "sofa-damage.png", { type: "image/png" });
  body.append("photos", file);

  return {
    url: `${BASE_URL}/api/lead`,
    method: "POST",
    body,
    // Intentionally NO Content-Type — browser/runtime sets multipart boundary.
  };
}

function corporateFetch(): RequestInit & { url: string } {
  // Mirrors src/sections/Corporate.tsx handleSubmit.
  return {
    url: `${BASE_URL}/api/lead`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: PHONE, type: "corporate" }),
  };
}

function fabricFetch(): RequestInit & { url: string } {
  // Mirrors src/sections/FabricShowcase.tsx handleSubmit.
  return {
    url: `${BASE_URL}/api/lead`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: PHONE, type: "fabric-samples" }),
  };
}

const scenarios: Scenario[] = [
  { label: "1. Hero           — «Перезвоните мне» в первом блоке", build: heroFetch },
  { label: "2. Contacts       — форма внизу сайта «Перезвоним за 5 минут»", build: contactsFetch },
  { label: "3. Calculator     — заявка на ремонт с фото + комментарием", build: calculatorFetch },
  { label: "4. Corporate      — корпоративный заказ", build: corporateFetch },
  { label: "5. FabricShowcase — запрос образцов тканей", build: fabricFetch },
];

async function waitForServer(url: string, timeoutMs = 90_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastErr: unknown = null;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.status < 500) return;
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`Dev-сервер не поднялся за ${timeoutMs}ms: ${lastErr ?? "?"}`);
}

async function main(): Promise<void> {
  console.log(`UI-fidelity smoke → ${BASE_URL}/api/lead`);
  console.log(`Phone used: ${PHONE}`);
  console.log("Ждём запуска dev-сервера…");
  await waitForServer(BASE_URL);
  console.log("Сервер готов. Отправляю заявки:\n");

  let ok = 0;
  let failed = 0;

  for (const scenario of scenarios) {
    process.stdout.write(`→ ${scenario.label}\n`);
    const { url, ...init } = scenario.build();
    const started = Date.now();
    try {
      const res = await fetch(url, init);
      const text = await res.text();
      let body: ServerResponse;
      try {
        body = JSON.parse(text) as ServerResponse;
      } catch {
        console.log(`   ✗ Не-JSON ответ status=${res.status}: ${text.slice(0, 200)}`);
        failed += 1;
        continue;
      }

      const ms = Date.now() - started;
      if (res.ok && body.success) {
        console.log(
          `   ✓ status=${res.status} id=${body.id} persisted=${body.persisted} emailed=${body.emailed} (${ms}ms)`
        );
        ok += 1;
      } else {
        console.log(`   ✗ status=${res.status} error=${body.error ?? "?"}`);
        failed += 1;
      }
    } catch (e) {
      console.log(`   ✗ fetch error: ${e instanceof Error ? e.message : String(e)}`);
      failed += 1;
    }
  }

  console.log(`\n══════════════════════════════════════════`);
  console.log(`Результат: ${ok}/${scenarios.length} отправлено успешно`);
  console.log(`Проверь почтовый ящик evil.artas1@gmail.com — должно прийти ${ok} писем.`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
