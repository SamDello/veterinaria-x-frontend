import { Component, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import {
  GlobalSearchItem,
  GlobalSearchService
} from '../../core/services/global-search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private globalSearchService = inject(GlobalSearchService);
  private searchSubscription?: Subscription;

  user = this.authService.getUser();

  searchControl = new FormControl('', { nonNullable: true });

  searchResults: GlobalSearchItem[] = [];
  isSearching = false;
  searchError = '';
  searchedTerm = '';

  constructor() {
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged()
      )
      .subscribe((term) => {
        this.handleSearch(term);
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchResults = [];
    this.searchError = '';
    this.searchedTerm = '';
    this.isSearching = false;
  }

  goToResult(item: GlobalSearchItem): void {
    this.router.navigate([item.route]);
    this.clearSearch();
  }

  private handleSearch(term: string): void {
    const cleanTerm = term.trim();

    if (cleanTerm.length < 2) {
      this.searchResults = [];
      this.searchError = '';
      this.searchedTerm = '';
      this.isSearching = false;
      return;
    }

    this.isSearching = true;
    this.searchError = '';
    this.searchedTerm = cleanTerm;

    this.globalSearchService.search(cleanTerm).subscribe({
      next: (response) => {
        this.searchResults = response.items || [];
        this.isSearching = false;
      },
      error: (error) => {
        this.searchResults = [];

        if (error.status === 401) {
          this.searchError = 'La sesión expiró. Vuelva a iniciar sesión.';
        } else {
          this.searchError = 'No se pudo realizar la búsqueda.';
        }

        this.isSearching = false;
      }
    });
  }
}
