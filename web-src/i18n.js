// i18n-ready labels for the OmniCam Director UI.
// All user-facing strings resolve through t(); locales can be registered at runtime.

const DEFAULT_LOCALE = "en";

const catalogs = new Map([[DEFAULT_LOCALE, {}]]);

export function registerLocale(locale, strings) {
  catalogs.set(locale, { ...(catalogs.get(locale) || {}), ...(strings || {}) });
}

let activeLocale = DEFAULT_LOCALE;

export function setLocale(locale) {
  if (catalogs.has(locale)) activeLocale = locale;
}

export function getLocale() {
  return activeLocale;
}

// t("English source string") -> translated string when a catalog entry exists.
export function t(source) {
  if (activeLocale === DEFAULT_LOCALE) return source;
  return catalogs.get(activeLocale)?.[source] || source;
}
