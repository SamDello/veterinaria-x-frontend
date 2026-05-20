import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  AudienceTheme,
  ThemeService
} from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-selector.component.html',
  styleUrl: './theme-selector.component.scss'
})
export class ThemeSelectorComponent {
  private themeService = inject(ThemeService);

  settings = this.themeService.settings;

  audienceOptions: { value: AudienceTheme; label: string; icon: string }[] = [
    {
      value: 'kids',
      label: 'Niños',
      icon: '🧸'
    },
    {
      value: 'youth',
      label: 'Jóvenes',
      icon: '⚡'
    },
    {
      value: 'adults',
      label: 'Adultos',
      icon: '💼'
    }
  ];

  setAudience(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as AudienceTheme;
    this.themeService.setAudience(value);
  }

  toggleAutoMode(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.themeService.setAutoMode(checked);
  }

  toggleMode(): void {
    this.themeService.toggleManualMode();
  }

  getModeText(): string {
    return this.settings().mode === 'day' ? 'Día' : 'Noche';
  }

  getModeIcon(): string {
    return this.settings().mode === 'day' ? '☀️' : '🌙';
  }
}
