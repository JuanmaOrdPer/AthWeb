/**
 * Módulo de mapa interactivo
 * Soporta múltiples proveedores: Leaflet, Mapbox, Google Maps
 */

export class MapComponent {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      provider: 'leaflet', // 'leaflet', 'mapbox', 'google'
      center: [40.4168, -3.7038], // Madrid, Spain
      zoom: 6,
      apiKey: null,
      style: 'streets',
      markers: [],
      ...options
    };
    
    this.map = null;
    this.markers = [];
    this.initialized = false;
    
    // Inicialización diferida
    if (this.container) {
      this.init();
    }
  }
  
  async init() {
    if (this.initialized) return;
    
    try {
      await this.loadMapLibrary();
      this.initMap();
      this.setupEventListeners();
      this.initialized = true;
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
      this.showError('No se pudo cargar el mapa. Por favor, inténtalo de nuevo más tarde.');
    }
  }
  
  async loadMapLibrary() {
    switch (this.options.provider) {
      case 'mapbox':
        return this.loadMapbox();
      case 'google':
        return this.loadGoogleMaps();
      case 'leaflet':
      default:
        return this.loadLeaflet();
    }
  }
  
  async loadLeaflet() {
    if (window.L) return Promise.resolve();
    
    // Cargar CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);
    
    // Cargar JS
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error al cargar Leaflet'));
      document.head.appendChild(script);
    });
  }
  
  // Implementaciones simplificadas para Mapbox y Google Maps...
  async loadMapbox() {
    if (window.mapboxgl) return Promise.resolve();
    
    if (!this.options.apiKey) {
      throw new Error('Se requiere una API key para Mapbox');
    }
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.js`;
      script.onload = () => {
        mapboxgl.accessToken = this.options.apiKey;
        resolve();
      };
      script.onerror = () => reject(new Error('Error al cargar Mapbox GL JS'));
      document.head.appendChild(script);
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css';
      document.head.appendChild(link);
    });
  }
  
  async loadGoogleMaps() {
    if (window.google && window.google.maps) return Promise.resolve();
    
    if (!this.options.apiKey) {
      throw new Error('Se requiere una API key para Google Maps');
    }
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.options.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error al cargar Google Maps API'));
      document.head.appendChild(script);
    });
  }
  
  initMap() {
    if (!this.container) return;
    
    switch (this.options.provider) {
      case 'mapbox':
        this.initMapbox();
        break;
      case 'google':
        this.initGoogleMaps();
        break;
      case 'leaflet':
      default:
        this.initLeaflet();
        break;
    }
  }
  
  initLeaflet() {
    if (!window.L) {
      console.error('Leaflet no está cargado');
      return;
    }
    
    // Crear el mapa
    this.map = L.map(this.container).setView(
      this.options.center,
      this.options.zoom
    );
    
    // Añadir capa de teselas
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    
    // Añadir marcadores
    this.addMarkers(this.options.markers);
  }
  
  // Implementaciones simplificadas para Mapbox y Google Maps...
  initMapbox() {
    if (!window.mapboxgl) {
      console.error('Mapbox GL JS no está cargado');
      return;
    }
    
    this.map = new mapboxgl.Map({
      container: this.container,
      style: `mapbox://styles/mapbox/${this.options.style}-v11`,
      center: [this.options.center[1], this.options.center[0]], // [lng, lat]
      zoom: this.options.zoom
    });
    
    // Añadir controles de navegación
    this.map.addControl(new mapboxgl.NavigationControl());
    
    // Añadir marcadores
    this.addMarkers(this.options.markers);
  }
  
  initGoogleMaps() {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API no está cargada');
      return;
    }
    
    this.map = new google.maps.Map(this.container, {
      center: { lat: this.options.center[0], lng: this.options.center[1] },
      zoom: this.options.zoom,
      styles: this.getGoogleMapsStyle()
    });
    
    // Añadir marcadores
    this.addMarkers(this.options.markers);
  }
  
  addMarkers(markers = []) {
    if (!this.map) return;
    
    // Limpiar marcadores existentes
    this.clearMarkers();
    
    markers.forEach(markerData => {
      const { position, title, popup, icon, draggable = false } = markerData;
      
      switch (this.options.provider) {
        case 'mapbox':
          this.addMapboxMarker(position, { title, popup, icon, draggable });
          break;
        case 'google':
          this.addGoogleMapsMarker(position, { title, popup, icon, draggable });
          break;
        case 'leaflet':
        default:
          this.addLeafletMarker(position, { title, popup, icon, draggable });
          break;
      }
    });
  }
  
  addLeafletMarker(position, { title = '', popup = '', icon = null, draggable = false }) {
    if (!this.map || !window.L) return null;
    
    const markerOptions = { title, draggable };
    if (icon) {
      markerOptions.icon = L.icon({
        iconUrl: icon.url,
        iconSize: icon.size || [25, 41],
        iconAnchor: icon.anchor || [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
      });
    }
    
    const marker = L.marker([position[0], position[1]], markerOptions)
      .addTo(this.map);
    
    if (popup) {
      marker.bindPopup(popup);
    }
    
    this.markers.push(marker);
    return marker;
  }
  
  // Métodos para otros proveedores de mapas (simplificados)...
  addMapboxMarker(position, { title = '', popup = '', icon = null, draggable = false }) {
    if (!this.map || !window.mapboxgl) return null;
    
    const el = document.createElement('div');
    el.className = 'map-marker';
    if (icon && icon.url) {
      el.style.backgroundImage = `url(${icon.url})`;
      el.style.width = `${icon.size ? icon.size[0] : 25}px`;
      el.style.height = `${icon.size ? icon.size[1] : 41}px`;
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
    } else {
      el.style.backgroundColor = '#3fb1ce';
      el.style.borderRadius = '50%';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.border = '3px solid #fff';
      el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
    }
    
    const marker = new mapboxgl.Marker({
      element: el,
      draggable
    })
      .setLngLat([position[1], position[0]]) // [lng, lat]
      .setPopup(
        popup 
          ? new mapboxgl.Popup({ offset: 25 }).setHTML(popup)
          : null
      )
      .addTo(this.map);
    
    if (title) {
      el.setAttribute('title', title);
    }
    
    this.markers.push(marker);
    return marker;
  }
  
  addGoogleMapsMarker(position, { title = '', popup = '', icon = null, draggable = false }) {
    if (!this.map || !window.google || !window.google.maps) return null;
    
    const markerOptions = {
      position: { lat: position[0], lng: position[1] },
      map: this.map,
      title,
      draggable,
      animation: window.google.maps.Animation.DROP
    };
    
    if (icon && icon.url) {
      markerOptions.icon = {
        url: icon.url,
        scaledSize: icon.size ? new google.maps.Size(icon.size[0], icon.size[1]) : null,
        anchor: icon.anchor ? new google.maps.Point(icon.anchor[0], icon.anchor[1]) : null
      };
    }
    
    const marker = new google.maps.Marker(markerOptions);
    
    if (popup) {
      const infoWindow = new google.maps.InfoWindow({
        content: popup
      });
      
      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });
    }
    
    this.markers.push(marker);
    return marker;
  }
  
  clearMarkers() {
    this.markers.forEach(marker => {
      if (marker.remove) {
        marker.remove();
      } else if (marker.setMap) {
        // Para Google Maps
        marker.setMap(null);
      }
    });
    
    this.markers = [];
  }
  
  setCenter(lat, lng, zoom) {
    if (!this.map) return;
    
    switch (this.options.provider) {
      case 'mapbox':
        this.map.flyTo({ center: [lng, lat], zoom: zoom || this.map.getZoom() });
        break;
      case 'google':
        this.map.setCenter({ lat, lng });
        if (zoom) this.map.setZoom(zoom);
        break;
      case 'leaflet':
      default:
        this.map.setView([lat, lng], zoom || this.map.getZoom());
        break;
    }
  }
  
  setZoom(zoom) {
    if (!this.map) return;
    
    if (this.map.setZoom) {
      this.map.setZoom(zoom);
    } else if (this.map.flyTo) {
      // Para Mapbox
      this.map.flyTo({ zoom });
    }
  }
  
  fitBounds(bounds) {
    if (!this.map || !bounds) return;
    
    const { north, south, east, west } = bounds;
    
    switch (this.options.provider) {
      case 'mapbox':
        this.map.fitBounds([
          [west, south],
          [east, north]
        ], { padding: 50 });
        break;
      case 'google':
        this.map.fitBounds(new google.maps.LatLngBounds(
          { lat: south, lng: west },
          { lat: north, lng: east }
        ), { padding: 50 });
        break;
      case 'leaflet':
      default:
        this.map.fitBounds([
          [south, west],
          [north, east]
        ], { padding: [50, 50] });
        break;
    }
  }
  
  // Métodos de utilidad
  setupEventListeners() {
    // Implementar según sea necesario
  }
  
  showError(message) {
    if (!this.container) return;
    
    const errorElement = document.createElement('div');
    errorElement.className = 'map-error';
    errorElement.style.padding = '10px';
    errorElement.style.color = '#721c24';
    errorElement.style.backgroundColor = '#f8d7da';
    errorElement.style.border = '1px solid #f5c6cb';
    errorElement.style.borderRadius = '4px';
    errorElement.style.marginBottom = '10px';
    errorElement.textContent = message;
    
    this.container.insertBefore(errorElement, this.container.firstChild);
  }
  
  getGoogleMapsStyle() {
    // Estilo personalizado para Google Maps (opcional)
    return [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ];
  }
  
  // Métodos de limpieza
  destroy() {
    if (this.map) {
      switch (this.options.provider) {
        case 'mapbox':
          this.map.remove();
          break;
        case 'google':
          // No hay un método de limpieza directo en Google Maps
          break;
        case 'leaflet':
        default:
          this.map.remove();
          break;
      }
      this.map = null;
    }
    
    this.clearMarkers();
    this.initialized = false;
  }
}

// Inicialización automática de mapas con data-attributes
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-map]').forEach(container => {
    const options = {
      provider: container.dataset.mapProvider || 'leaflet',
      apiKey: container.dataset.mapApiKey || null,
      center: container.dataset.mapCenter 
        ? container.dataset.mapCenter.split(',').map(Number) 
        : [40.4168, -3.7038],
      zoom: container.dataset.mapZoom ? parseInt(container.dataset.mapZoom, 10) : 6,
      style: container.dataset.mapStyle || 'streets',
      markers: container.dataset.mapMarkers ? JSON.parse(container.dataset.mapMarkers) : []
    };
    
    // Inicializar el mapa
    new MapComponent(container, options);
  });
});
