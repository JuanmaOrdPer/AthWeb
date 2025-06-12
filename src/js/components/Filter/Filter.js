import { EventService } from '@services/eventService';

export class FilterComponent {
  constructor(onFilterChange) {
    this.onFilterChange = onFilterChange;
    this.eventService = new EventService();
    this.filters = {
      type: '',
      country: '',
      state: '',
      city: '',
      distance: '',
      month: false
    };
    this.init();
  }

  async init() {
    // Cargar opciones de filtro
    this.eventTypes = await this.eventService.getEventTypes();
    this.countries = await this.eventService.getCountries();
    
    // Renderizar filtros
    this.render();
    
    // Configurar eventos
    this.setupEventListeners();
  }

  async render() {
    const container = document.getElementById('filters-container');
    if (!container) return;

    container.innerHTML = `
      <div class="filters">
        <!-- Filtro de tipo de carrera -->
        <div class="filter-group">
          <label for="event-type">Tipo de carrera</label>
          <select id="event-type" class="filter-select">
            <option value="">Todas las carreras</option>
            ${this.eventTypes.map(type => 
              `<option value="${type.id}">${type.name}</option>`
            ).join('')}
          </select>
        </div>

        <!-- Filtro de país -->
        <div class="filter-group">
          <label for="country">País</label>
          <select id="country" class="filter-select">
            <option value="">Todos los países</option>
            ${this.countries.map(country => 
              `<option value="${country.id}">${country.name}</option>`
            ).join('')}
          </select>
        </div>

        <!-- Filtro de región/estado (se cargará dinámicamente) -->
        <div class="filter-group" id="state-filter-group" style="display: none;">
          <label for="state">Región/Estado</label>
          <select id="state" class="filter-select" disabled>
            <option value="">Cargando...</option>
          </select>
        </div>

        <!-- Filtro de ciudad (se cargará dinámicamente) -->
        <div class="filter-group" id="city-filter-group" style="display: none;">
          <label for="city">Ciudad</label>
          <select id="city" class="filter-select" disabled>
            <option value="">Cargando...</option>
          </select>
        </div>

        <!-- Filtro de distancia (se cargará dinámicamente) -->
        <div class="filter-group" id="distance-filter-group" style="display: none;">
          <label for="distance">Distancia</label>
          <select id="distance" class="filter-select" disabled>
            <option value="">Todas las distancias</option>
          </select>
        </div>

        <!-- Filtro de fecha (próximos 6 meses) -->
        <div class="filter-group">
          <label class="checkbox-label">
            <input type="checkbox" id="next-six-months">
            <span>Próximos 6 meses</span>
          </label>
        </div>

        <!-- Botón de limpiar filtros -->
        <div class="filter-group">
          <button id="clear-filters" class="btn btn-secondary">
            <i class="fas fa-times"></i> Limpiar filtros
          </button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Filtro de tipo de carrera
    document.getElementById('event-type')?.addEventListener('change', (e) => {
      this.filters.type = e.target.value;
      this.updateDistanceOptions(e.target.value);
      this.triggerFilterChange();
    });

    // Filtro de país
    document.getElementById('country')?.addEventListener('change', async (e) => {
      const countryCode = e.target.value;
      this.filters.country = countryCode;
      this.filters.state = '';
      this.filters.city = '';
      
      await this.updateStateOptions(countryCode);
      this.triggerFilterChange();
    });

    // Filtro de región/estado
    document.getElementById('state')?.addEventListener('change', async (e) => {
      const stateCode = e.target.value;
      this.filters.state = stateCode;
      this.filters.city = '';
      
      if (stateCode) {
        await this.updateCityOptions(this.filters.country, stateCode);
      } else {
        this.toggleFilterGroup('city-filter-group', false);
      }
      
      this.triggerFilterChange();
    });

    // Filtro de ciudad
    document.getElementById('city')?.addEventListener('change', (e) => {
      this.filters.city = e.target.value;
      this.triggerFilterChange();
    });

    // Filtro de distancia
    document.getElementById('distance')?.addEventListener('change', (e) => {
      this.filters.distance = e.target.value;
      this.triggerFilterChange();
    });

    // Filtro de fecha (próximos 6 meses)
    document.getElementById('next-six-months')?.addEventListener('change', (e) => {
      this.filters.month = e.target.checked;
      this.triggerFilterChange();
    });

    // Botón de limpiar filtros
    document.getElementById('clear-filters')?.addEventListener('click', () => {
      this.clearFilters();
    });
  }

  async updateStateOptions(countryCode) {
    const stateSelect = document.getElementById('state');
    const stateGroup = document.getElementById('state-filter-group');
    
    if (!countryCode) {
      this.toggleFilterGroup('state-filter-group', false);
      this.toggleFilterGroup('city-filter-group', false);
      return;
    }
    
    try {
      stateSelect.disabled = true;
      stateSelect.innerHTML = '<option value="">Cargando regiones...</option>';
      this.toggleFilterGroup('state-filter-group', true);
      
      const states = await this.eventService.getStates(countryCode);
      
      stateSelect.innerHTML = `
        <option value="">Todas las regiones</option>
        ${states.map(state => 
          `<option value="${state.id}">${state.name}</option>`
        ).join('')}
      `;
      
      stateSelect.disabled = false;
      
      // Resetear filtros de ciudad
      this.toggleFilterGroup('city-filter-group', false);
      
    } catch (error) {
      console.error('Error loading states:', error);
      stateSelect.innerHTML = '<option value="">Error al cargar regiones</option>';
    }
  }

  async updateCityOptions(countryCode, stateCode) {
    const citySelect = document.getElementById('city');
    const cityGroup = document.getElementById('city-filter-group');
    
    if (!countryCode || !stateCode) {
      this.toggleFilterGroup('city-filter-group', false);
      return;
    }
    
    try {
      citySelect.disabled = true;
      citySelect.innerHTML = '<option value="">Cargando ciudades...</option>';
      this.toggleFilterGroup('city-filter-group', true);
      
      const cities = await this.eventService.getCities(countryCode, stateCode);
      
      citySelect.innerHTML = `
        <option value="">Todas las ciudades</option>
        ${cities.map(city => 
          `<option value="${city.id}">${city.name}</option>`
        ).join('')}
      `;
      
      citySelect.disabled = false;
      
    } catch (error) {
      console.error('Error loading cities:', error);
      citySelect.innerHTML = '<option value="">Error al cargar ciudades</option>';
    }
  }

  async updateDistanceOptions(eventType) {
    const distanceSelect = document.getElementById('distance');
    const distanceGroup = document.getElementById('distance-filter-group');
    
    if (!eventType) {
      this.toggleFilterGroup('distance-filter-group', false);
      return;
    }
    
    try {
      distanceSelect.disabled = true;
      distanceSelect.innerHTML = '<option value="">Cargando distancias...</option>';
      this.toggleFilterGroup('distance-filter-group', true);
      
      const distances = await this.eventService.getDistances(eventType);
      
      distanceSelect.innerHTML = `
        <option value="">Todas las distancias</option>
        ${distances.map(distance => 
          `<option value="${distance.id}">${distance.name}</option>`
        ).join('')}
      `;
      
      distanceSelect.disabled = false;
      
    } catch (error) {
      console.error('Error loading distances:', error);
      distanceSelect.innerHTML = '<option value="">Error al cargar distancias</option>';
    }
  }

  toggleFilterGroup(groupId, show) {
    const group = document.getElementById(groupId);
    if (group) {
      group.style.display = show ? 'block' : 'none';
    }
  }

  triggerFilterChange() {
    if (this.onFilterChange && typeof this.onFilterChange === 'function') {
      // Crear una copia de los filtros actuales
      const activeFilters = { ...this.filters };
      
      // Eliminar filtros vacíos
      Object.keys(activeFilters).forEach(key => {
        if (!activeFilters[key] && activeFilters[key] !== 0) {
          delete activeFilters[key];
        }
      });
      
      this.onFilterChange(activeFilters);
    }
  }

  clearFilters() {
    // Resetear valores de los selects
    document.getElementById('event-type').value = '';
    document.getElementById('country').value = '';
    
    const stateSelect = document.getElementById('state');
    if (stateSelect) stateSelect.innerHTML = '<option value="">Selecciona un país primero</option>';
    
    const citySelect = document.getElementById('city');
    if (citySelect) citySelect.innerHTML = '<option value="">Selecciona una región primero</option>';
    
    const distanceSelect = document.getElementById('distance');
    if (distanceSelect) distanceSelect.innerHTML = '<option value="">Selecciona un tipo de carrera primero</option>';
    
    document.getElementById('next-six-months').checked = false;
    
    // Ocultar grupos de filtros dependientes
    this.toggleFilterGroup('state-filter-group', false);
    this.toggleFilterGroup('city-filter-group', false);
    this.toggleFilterGroup('distance-filter-group', false);
    
    // Resetear objeto de filtros
    this.filters = {
      type: '',
      country: '',
      state: '',
      city: '',
      distance: '',
      month: false
    };
    
    // Disparar evento de cambio
    this.triggerFilterChange();
  }
}
