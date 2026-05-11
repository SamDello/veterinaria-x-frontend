import { TestBed } from '@angular/core/testing';

import { ServicioVeterinarioService } from './servicio-veterinario.service';

describe('ServicioVeterinarioService', () => {
  let service: ServicioVeterinarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioVeterinarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
