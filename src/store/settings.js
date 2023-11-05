import { createPersistedStore } from './createStore';

export const settingsStore = createPersistedStore('emanga:settings', {
  theme: 'system', // 'light' | 'dark' | 'system'
  contentRating: ['safe', 'suggestive'],
  translatedLanguage: ['vi', 'en'],
  readerMode: 'vertical', // 'vertical' | 'single'
  readerFit: 'width', // 'width' | 'height' | 'original'
  dataSaver: false,
});

export const useSettings = settingsStore.useStore;

export function updateSettings(patch) {
  settingsStore.setState(patch);
}

export function applyTheme(theme) {
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}
