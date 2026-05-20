import { Injectable, signal } from '@angular/core';

export type AudienceTheme = 'kids' | 'youth' | 'adults';
export type ColorMode = 'day' | 'night';

export interface ThemeSettings {
  audience: AudienceTheme;
  mode: ColorMode;
  autoMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'veterinaria-x-theme-settings';

  private readonly themeClasses = [
    'theme-kids',
    'theme-youth',
    'theme-adults'
  ];

  private readonly modeClasses = [
    'mode-day',
    'mode-night'
  ];

  private readonly settingsState = signal<ThemeSettings>({
    audience: 'adults',
    mode: this.getModeByHour(),
    autoMode: true
  });

  readonly settings = this.settingsState.asReadonly();

  constructor() {
    const savedSettings = this.loadSettings();
    const normalizedSettings = this.normalizeSettings(savedSettings);

    this.settingsState.set(normalizedSettings);
    this.applyTheme(normalizedSettings);
    this.startAutoModeWatcher();
  }

  setAudience(audience: AudienceTheme): void {
    const current = this.settingsState();

    this.updateSettings({
      ...current,
      audience
    });
  }

  setAutoMode(autoMode: boolean): void {
    const current = this.settingsState();

    this.updateSettings({
      ...current,
      autoMode,
      mode: autoMode ? this.getModeByHour() : current.mode
    });
  }

  setManualMode(mode: ColorMode): void {
    const current = this.settingsState();

    this.updateSettings({
      ...current,
      autoMode: false,
      mode
    });
  }

  toggleManualMode(): void {
    const current = this.settingsState();
    const newMode: ColorMode = current.mode === 'day' ? 'night' : 'day';

    this.setManualMode(newMode);
  }

  getModeByHour(): ColorMode {
    const hour = new Date().getHours();

    return hour >= 6 && hour < 19 ? 'day' : 'night';
  }

  private updateSettings(settings: ThemeSettings): void {
    this.settingsState.set(settings);
    this.saveSettings(settings);
    this.applyTheme(settings);
  }

  private normalizeSettings(settings: Partial<ThemeSettings> | null): ThemeSettings {
    const audienceValues: AudienceTheme[] = ['kids', 'youth', 'adults'];
    const modeValues: ColorMode[] = ['day', 'night'];

    const audience = audienceValues.includes(settings?.audience as AudienceTheme)
      ? settings?.audience as AudienceTheme
      : 'adults';

    const autoMode = typeof settings?.autoMode === 'boolean'
      ? settings.autoMode
      : true;

    const mode = autoMode
      ? this.getModeByHour()
      : modeValues.includes(settings?.mode as ColorMode)
        ? settings?.mode as ColorMode
        : this.getModeByHour();

    return {
      audience,
      mode,
      autoMode
    };
  }

  private loadSettings(): Partial<ThemeSettings> | null {
    if (!this.isBrowser()) return null;

    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveSettings(settings: ThemeSettings): void {
    if (!this.isBrowser()) return;

    localStorage.setItem(this.storageKey, JSON.stringify(settings));
  }

  private applyTheme(settings: ThemeSettings): void {
    if (!this.isBrowser()) return;

    const root = document.documentElement;

    this.themeClasses.forEach((className) => root.classList.remove(className));
    this.modeClasses.forEach((className) => root.classList.remove(className));

    root.classList.add(`theme-${settings.audience}`);
    root.classList.add(`mode-${settings.mode}`);

    root.setAttribute('data-theme-audience', settings.audience);
    root.setAttribute('data-theme-mode', settings.mode);
    root.setAttribute('data-theme-auto', String(settings.autoMode));
  }

  private startAutoModeWatcher(): void {
    if (!this.isBrowser()) return;

    window.setInterval(() => {
      const current = this.settingsState();

      if (!current.autoMode) return;

      const newMode = this.getModeByHour();

      if (newMode !== current.mode) {
        this.updateSettings({
          ...current,
          mode: newMode
        });
      }
    }, 60000);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
}
