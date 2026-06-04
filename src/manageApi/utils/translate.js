// src/manageApi/utils/translate.js

let translationCache = JSON.parse(localStorage.getItem("translations") || "{}");

export async function translateText(text, targetLang) {
  if (!text || !targetLang) return text;

  // Cache hit
  if (translationCache[targetLang]?.[text]) {
    return translationCache[targetLang][text];
  }

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=en|${targetLang}`
    );

    const data = await res.json();
    const translated =
      data?.responseData?.translatedText?.trim() || text;

    // Cache it
    translationCache[targetLang] = translationCache[targetLang] || {};
    translationCache[targetLang][text] = translated;

    localStorage.setItem("translations", JSON.stringify(translationCache));

    return translated;
  } catch (error) {
    console.error("Translate error:", error);
    return text;
  }
}

export async function translatePage(langCode) {
  const elements = document.querySelectorAll("[data-i18n]");

  for (const el of elements) {
    const original = el.getAttribute("data-i18n")?.trim();
    if (!original) continue;

    const translated = await translateText(original, langCode);
    el.innerText = translated;
  }

  // RTL languages
  const rtl = ["ar", "ur", "fa"];
  document.documentElement.dir = rtl.includes(langCode) ? "rtl" : "ltr";
}
