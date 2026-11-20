import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import {
  appendAttributionToMessage,
  buildWhatsAppUrl,
  captureCampaignAttribution,
  preserveAttributionInHref,
} from "../app/campaign-attribution.js";
import {
  createGoogleAnalyticsScript,
  GOOGLE_ANALYTICS_FORM_EVENT,
  GOOGLE_ANALYTICS_LEAD_EVENT,
  GOOGLE_ANALYTICS_MEASUREMENT_ID,
  GOOGLE_ANALYTICS_WHATSAPP_EVENT,
  trackGoogleAnalyticsFormLead,
} from "../app/google-analytics.js";
import {
  createOpenAiAdsPixelScript,
  OPENAI_ADS_LEAD_EVENT,
  OPENAI_ADS_PIXEL_ID,
  trackOpenAiAdsLead,
} from "../app/openai-ads.js";
import {
  createMetaPixelNoscriptUrl,
  createMetaPixelScript,
  META_PIXEL_ID,
  META_PIXEL_LEAD_EVENT,
  trackMetaPixelLead,
} from "../app/meta-pixel.js";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function renderPage(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(
    "test",
    `${pathname}-${process.pid}-${Date.now()}-${Math.random()}`,
  );
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

function runMeasurementPixel() {
  let clickHandler;
  let insertedScript;
  const firstScript = {
    parentNode: {
      insertBefore(script) {
        insertedScript = script;
      },
    },
  };
  const document = {
    createElement() {
      return {};
    },
    getElementsByTagName() {
      return [firstScript];
    },
    addEventListener(type, handler) {
      if (type === "click") clickHandler = handler;
    },
  };
  const window = {
    location: { href: "https://verbovideo.com.br/video-publicitario" },
  };

  vm.runInNewContext(createOpenAiAdsPixelScript(), {
    URL,
    document,
    window,
  });

  return { clickHandler, insertedScript, window };
}

function runGoogleAnalytics() {
  let clickHandler;
  let insertedScript;
  const firstScript = {
    parentNode: {
      insertBefore(script) {
        insertedScript = script;
      },
    },
  };
  const document = {
    head: {
      appendChild(script) {
        insertedScript = script;
      },
    },
    createElement() {
      return {};
    },
    getElementsByTagName() {
      return [firstScript];
    },
    addEventListener(type, handler) {
      if (type === "click") clickHandler = handler;
    },
  };
  const window = {
    location: {
      href: "https://verbovideo.com.br/video-publicitario",
      pathname: "/video-publicitario",
    },
  };

  vm.runInNewContext(createGoogleAnalyticsScript(), {
    URL,
    document,
    window,
  });

  return { clickHandler, insertedScript, window };
}

function runMetaPixel(executions = 1) {
  let clickHandler;
  let insertedScript;
  const firstScript = {
    parentNode: {
      insertBefore(script) {
        insertedScript = script;
      },
    },
  };
  const document = {
    head: {
      appendChild(script) {
        insertedScript = script;
      },
    },
    createElement() {
      return {};
    },
    getElementsByTagName() {
      return [firstScript];
    },
    addEventListener(type, handler) {
      if (type === "click") clickHandler = handler;
    },
  };
  const window = {
    location: { href: "https://verbovideo.com.br/video-publicitario" },
  };
  const context = { URL, document, window };

  for (let index = 0; index < executions; index += 1) {
    vm.runInNewContext(createMetaPixelScript(), context);
  }

  return { clickHandler, insertedScript, window };
}

function argumentsToArray(call) {
  return Array.from(call, (value) =>
    value && typeof value === "object"
      ? JSON.parse(JSON.stringify(value))
      : value,
  );
}

function linkClick(href, defaultPrevented = false) {
  return {
    defaultPrevented,
    target: {
      closest(selector) {
        assert.equal(selector, "a[href]");
        return {
          href,
          textContent: "Falar no WhatsApp",
          getAttribute() {
            return null;
          },
        };
      },
    },
  };
}

test("renders development preview metadata", async () => {
  const response = await renderPage();

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("initializes the OpenAI Ads Measurement Pixel with the VerboVideo Pixel ID", () => {
  const { clickHandler, insertedScript, window } = runMeasurementPixel();

  assert.equal(insertedScript.async, true);
  assert.equal(
    insertedScript.src,
    "https://bzrcdn.openai.com/sdk/oaiq.min.js",
  );
  assert.equal(typeof clickHandler, "function");
  assert.equal(typeof window.oaiq, "function");
  assert.deepEqual(argumentsToArray(window.oaiq.q[0]), [
    "init",
    { pixelId: OPENAI_ADS_PIXEL_ID },
  ]);
});

test("initializes Google Analytics with the VerboVideo measurement ID", async () => {
  const { clickHandler, insertedScript, window } = runGoogleAnalytics();

  assert.equal(insertedScript.async, true);
  assert.equal(insertedScript.id, "google-analytics-gtag");
  assert.equal(
    insertedScript.src,
    `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_MEASUREMENT_ID}`,
  );
  assert.equal(typeof clickHandler, "function");
  assert.equal(typeof window.gtag, "function");

  const queuedCalls = window.dataLayer.map(argumentsToArray);
  assert.equal(queuedCalls[0][0], "js");
  assert.deepEqual(queuedCalls[1], [
    "config",
    GOOGLE_ANALYTICS_MEASUREMENT_ID,
  ]);

  const [homeResponse, landingResponse] = await Promise.all([
    renderPage("/"),
    renderPage("/video-publicitario"),
  ]);
  const pages = [await homeResponse.text(), await landingResponse.text()];
  for (const html of pages) {
    assert.equal(
      (html.match(/id="google-analytics-measurement"/g) ?? []).length,
      1,
    );
    assert.match(html, new RegExp(GOOGLE_ANALYTICS_MEASUREMENT_ID));
  }
});

test("initializes Meta Pixel globally with one PageView per page load", async () => {
  const { clickHandler, insertedScript, window } = runMetaPixel(2);

  assert.equal(insertedScript.async, true);
  assert.equal(
    insertedScript.src,
    "https://connect.facebook.net/en_US/fbevents.js",
  );
  assert.equal(typeof clickHandler, "function");
  assert.equal(typeof window.fbq, "function");

  const queuedCalls = Array.from(window.fbq.queue, argumentsToArray);
  assert.deepEqual(queuedCalls, [
    ["init", META_PIXEL_ID],
    ["track", "PageView"],
  ]);

  const [homeResponse, landingResponse] = await Promise.all([
    renderPage("/"),
    renderPage("/video-publicitario"),
  ]);
  const pages = [await homeResponse.text(), await landingResponse.text()];
  for (const html of pages) {
    assert.equal((html.match(/id="meta-pixel-base-code"/g) ?? []).length, 1);
    assert.match(html, new RegExp(META_PIXEL_ID));
    assert.match(
      html.replaceAll("&amp;", "&"),
      new RegExp(createMetaPixelNoscriptUrl().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
});

test("tracks exactly one Meta Lead only for each WhatsApp link click", () => {
  const { clickHandler, window } = runMetaPixel();
  const initialCalls = window.fbq.queue.length;

  clickHandler(linkClick("https://wa.me/5583993325369?text=Teste"));
  assert.equal(window.fbq.queue.length, initialCalls + 1);
  assert.deepEqual(argumentsToArray(window.fbq.queue.at(-1)), [
    "track",
    META_PIXEL_LEAD_EVENT,
  ]);

  clickHandler(linkClick("https://www.instagram.com/verbovideo/"));
  clickHandler(
    linkClick("https://wa.me/5583993325369?text=Ignorado", true),
  );
  assert.equal(window.fbq.queue.length, initialCalls + 1);
});

test("tracks WhatsApp links as a click and one Google Analytics lead", () => {
  const { clickHandler, window } = runGoogleAnalytics();
  const initialCalls = window.dataLayer.length;

  clickHandler(linkClick("https://wa.me/5583993325369?text=Teste"));
  const eventCalls = window.dataLayer
    .slice(initialCalls)
    .map(argumentsToArray);

  assert.equal(eventCalls.length, 2);
  assert.deepEqual(
    JSON.parse(JSON.stringify(eventCalls.map((call) => call.slice(0, 2)))),
    [
      ["event", GOOGLE_ANALYTICS_WHATSAPP_EVENT],
      ["event", GOOGLE_ANALYTICS_LEAD_EVENT],
    ],
  );
  assert.equal(eventCalls[0][2].page_path, "/video-publicitario");
  assert.equal(eventCalls[1][2].method, "whatsapp_link");

  clickHandler(linkClick("https://www.instagram.com/verbovideo/"));
  clickHandler(
    linkClick("https://wa.me/5583993325369?text=Ignorado", true),
  );
  assert.equal(window.dataLayer.length, initialCalls + 2);
});

test("tracks a submitted form as one form event and one Google Analytics lead", () => {
  const calls = [];
  assert.equal(
    trackGoogleAnalyticsFormLead(
      {
        formName: "video_publicitario_lead_form",
        selectedFormat: "Vídeo personalizado de 30 segundos",
      },
      {
        gtag(...args) {
          calls.push(args);
        },
      },
    ),
    true,
  );
  assert.deepEqual(calls.map((call) => call.slice(0, 2)), [
    ["event", GOOGLE_ANALYTICS_FORM_EVENT],
    ["event", GOOGLE_ANALYTICS_LEAD_EVENT],
  ]);
  assert.equal(calls[0][2].lead_channel, "form_to_whatsapp");
  assert.equal(calls[1][2].method, "form_to_whatsapp");
  assert.equal(trackGoogleAnalyticsFormLead({}, {}), false);
});

test("preserves campaign attribution in navigation and WhatsApp messages", () => {
  const storage = new Map();
  const targetWindow = {
    location: {
      search:
        "?utm_source=instagram&utm_medium=paid_social&utm_campaign=video_agosto&utm_content=criativo_03&fbclid=meta-click",
    },
    sessionStorage: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
    },
  };

  const attribution = captureCampaignAttribution(targetWindow);
  assert.deepEqual(attribution, {
    utm_source: "instagram",
    utm_medium: "paid_social",
    utm_campaign: "video_agosto",
    utm_content: "criativo_03",
    fbclid: "meta-click",
  });

  const internalHref = preserveAttributionInHref("/", attribution);
  assert.match(internalHref, /^\/?\?/);
  assert.match(internalHref, /utm_source=instagram/);
  assert.match(internalHref, /utm_campaign=video_agosto/);

  const message = appendAttributionToMessage("Quero um vídeo.", attribution);
  assert.match(message, /Origem: instagram\./);
  assert.match(message, /Campanha: video_agosto\./);
  assert.match(message, /Anúncio\/criativo: criativo_03\./);

  const whatsappUrl = new URL(
    buildWhatsAppUrl("5583993325369", "Quero um vídeo.", attribution),
  );
  assert.equal(whatsappUrl.hostname, "wa.me");
  assert.match(whatsappUrl.searchParams.get("text"), /Origem: instagram\./);
});

test("keeps pricing on the full site and removes prices and forms from the landing page", async () => {
  const [homeResponse, landingResponse] = await Promise.all([
    renderPage("/"),
    renderPage("/video-publicitario"),
  ]);
  const home = await homeResponse.text();
  const landing = await landingResponse.text();

  assert.match(home, /Vídeos profissionais para sua empresa/);
  assert.doesNotMatch(home, /79,90/);
  assert.doesNotMatch(home, /R\$ 157|R\$ 257/);
  assert.match(home, /a partir de R\$ 197/);
  assert.match(home, /aria-label="R\$ 197"/);
  assert.match(home, /aria-label="R\$ 297"/);
  assert.match(home, /aria-label="R\$ 497"/);
  assert.equal((home.match(/<del class="price-old"/g) ?? []).length, 0);
  assert.match(home, /id="resultados"/);
  assert.match(home, /href="#resultados"/);
  assert.match(home, /VOX — Visão para criar\. Precisão para entregar\./);
  assert.match(home, /Visão estratégica\. Execução precisa\. Resultado que ganha alcance\./);
  assert.match(home, /src="\/assets\/vox\.png"/);
  assert.doesNotMatch(home, /Ele é o Vibo, o mascote oficial da VerboVídeo/);
  assert.match(home, /Vamos transformar sua ideia em um vídeo\?/);
  assert.match(home, /src="\/assets\/vibo-2\.png"/);
  assert.match(home, /src="\/assets\/videos\/turismo-excursoes-3d\.mp4"/);

  assert.match(
    landing,
    /Vídeos publicitários com Inteligência Artificial para destacar sua empresa\./,
  );
  assert.match(
    landing,
    /Criamos vídeos profissionais para anúncios, redes sociais e campanhas/,
  );
  assert.match(landing, /Vídeos profissionais e personalizados/);
  assert.match(landing, /Você chama no WhatsApp/);
  assert.equal((landing.match(/<video\b/g) ?? []).length, 3);
  assert.equal((landing.match(/\bpreload="none"/g) ?? []).length, 3);
  assert.doesNotMatch(landing, /\bautoplay(?:=|\s|>)/i);
  assert.doesNotMatch(landing, /R\$\s*\d/i);
  assert.doesNotMatch(landing, /<form\b/i);
  assert.doesNotMatch(landing, /<(?:input|textarea|select)\b/i);
  assert.doesNotMatch(landing, /depoimento/i);
  assert.doesNotMatch(landing, /<blockquote\b/i);
  assert.doesNotMatch(landing, /oferta de inauguração/i);
  assert.doesNotMatch(landing, /10 primeiras empresas/i);
});

test("fires lead_created only for links that direct to WhatsApp", async () => {
  const [homeResponse, landingResponse] = await Promise.all([
    renderPage("/"),
    renderPage("/video-publicitario"),
  ]);
  const home = await homeResponse.text();
  const landing = await landingResponse.text();
  const pages = [home, landing];

  for (const html of pages) {
    assert.equal(
      (html.match(/id="openai-ads-measurement-pixel"/g) ?? []).length,
      1,
    );
  }

  const hrefsFor = (html) =>
    Array.from(html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi), (match) =>
      match[1].replaceAll("&amp;", "&"),
    );
  const homeHrefs = hrefsFor(home);
  const landingHrefs = hrefsFor(landing);
  const hrefs = [...homeHrefs, ...landingHrefs];
  const whatsappHrefs = hrefs.filter((href) => href.startsWith("https://wa.me/"));
  const otherHrefs = hrefs.filter((href) => !href.startsWith("https://wa.me/"));
  const landingWhatsappHrefs = landingHrefs.filter((href) =>
    href.startsWith("https://wa.me/"),
  );

  assert.equal(landingWhatsappHrefs.length, 4);
  assert.ok(otherHrefs.length > 0);

  const homeWhatsappMessages = homeHrefs
    .filter((href) => href.startsWith("https://wa.me/"))
    .map((href) => new URL(href).searchParams.get("text") ?? "");
  assert.ok(
    homeWhatsappMessages.some((message) =>
      message.includes("Vídeo Essencial de 30 segundos") &&
      message.includes("R$ 197"),
    ),
  );
  assert.ok(
    homeWhatsappMessages.some((message) =>
      message.includes("Vídeo Profissional de 30 segundos com até 2 personagens") &&
      message.includes("R$ 297"),
    ),
  );
  assert.ok(
    homeWhatsappMessages.some((message) =>
      message.includes("Vídeo Profissional de 60 segundos com até 3 personagens") &&
      message.includes("R$ 497"),
    ),
  );

  const landingWhatsappMessages = landingWhatsappHrefs.map(
    (href) => new URL(href).searchParams.get("text") ?? "",
  );
  assert.deepEqual(
    landingWhatsappMessages,
    Array(4).fill(
      "Olá! Gostaria de saber mais sobre o vídeo para minha empresa.",
    ),
  );
  for (const href of landingWhatsappHrefs) {
    const url = new URL(href);
    assert.equal(url.hostname, "wa.me");
    assert.equal(url.pathname, "/5583993325369");
    assert.deepEqual([...url.searchParams.keys()], ["text"]);
  }

  const { clickHandler, window } = runMeasurementPixel();
  for (const href of whatsappHrefs) clickHandler(linkClick(href));

  const measuredCalls = window.oaiq.q
    .slice(1)
    .map(argumentsToArray);
  assert.equal(measuredCalls.length, whatsappHrefs.length);
  for (const call of measuredCalls) {
    assert.deepEqual(call, [
      "measure",
      OPENAI_ADS_LEAD_EVENT,
      { type: "customer_action" },
    ]);
  }

  for (const href of otherHrefs) clickHandler(linkClick(href));
  clickHandler(linkClick(whatsappHrefs[0], true));
  assert.equal(window.oaiq.q.length - 1, whatsappHrefs.length);

  const metaPixel = runMetaPixel();
  const initialMetaCalls = metaPixel.window.fbq.queue.length;
  for (const href of landingWhatsappHrefs) {
    metaPixel.clickHandler(linkClick(href));
  }
  const metaLeadCalls = Array.from(
    metaPixel.window.fbq.queue.slice(initialMetaCalls),
    argumentsToArray,
  );
  assert.equal(metaLeadCalls.length, landingWhatsappHrefs.length);
  for (const call of metaLeadCalls) {
    assert.deepEqual(call, ["track", META_PIXEL_LEAD_EVENT]);
  }
});

test("the home form keeps lead tracking while the landing page has no form tracking", async () => {
  const calls = [];
  assert.equal(
    trackOpenAiAdsLead({
      oaiq(...args) {
        calls.push(args);
      },
    }),
    true,
  );
  assert.deepEqual(calls, [
    ["measure", OPENAI_ADS_LEAD_EVENT, { type: "customer_action" }],
  ]);
  assert.equal(trackOpenAiAdsLead({}), false);

  const [homeSource, landingSource] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../app/video-publicitario/page.tsx", import.meta.url),
      "utf8",
    ),
  ]);
  const googleAnalyticsIndex = homeSource.indexOf(
    "trackGoogleAnalyticsFormLead({",
  );
  const openAiAdsIndex = homeSource.indexOf("trackOpenAiAdsLead();");
  const metaPixelIndex = homeSource.indexOf("trackMetaPixelLead();");
  const whatsappOpenIndex = homeSource.indexOf("window.open(", metaPixelIndex);
  assert.ok(googleAnalyticsIndex >= 0);
  assert.ok(openAiAdsIndex > googleAnalyticsIndex);
  assert.ok(metaPixelIndex > openAiAdsIndex);
  assert.ok(whatsappOpenIndex > metaPixelIndex);

  assert.doesNotMatch(landingSource, /<form\b/);
  assert.doesNotMatch(landingSource, /trackMetaPixelLead/);
  assert.doesNotMatch(landingSource, /trackOpenAiAdsLead/);
  assert.doesNotMatch(landingSource, /trackGoogleAnalyticsFormLead/);
  assert.doesNotMatch(landingSource, /window\.open\(/);
});

test("keeps the landing page mobile-first with one persistent WhatsApp CTA", async () => {
  const stylesheet = await readFile(
    new URL("../app/video-publicitario/page.module.css", import.meta.url),
    "utf8",
  );

  assert.match(stylesheet, /\.mobileWhatsapp\s*\{[\s\S]*?position:\s*fixed;/);
  assert.match(stylesheet, /@media\s*\(min-width:\s*700px\)/);
  assert.match(
    stylesheet,
    /@media\s*\(min-width:\s*700px\)[\s\S]*?\.mobileWhatsapp\s*\{\s*display:\s*none;/,
  );
  assert.match(stylesheet, /grid-auto-columns:\s*min\(82vw,\s*330px\)/);
  assert.match(stylesheet, /overflow-x:\s*auto;/);
});

test("form submissions send one Meta Lead immediately before WhatsApp opens", () => {
  const calls = [];
  assert.equal(
    trackMetaPixelLead({
      fbq(...args) {
        calls.push(args);
      },
    }),
    true,
  );
  assert.deepEqual(calls, [["track", META_PIXEL_LEAD_EVENT]]);
  assert.equal(trackMetaPixelLead({}), false);
});
