import { TestBed } from '@angular/core/testing';

import { AtencionVeterinariaService } from './atencion-veterinaria.service';

describe('AtencionVeterinariaService', () => {
  let service: AtencionVeterinariaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtencionVeterinariaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
