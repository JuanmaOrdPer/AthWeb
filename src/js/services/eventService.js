import axios from 'axios';
import { format, addMonths, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

export class EventService {
  constructor() {
    this.apiUrl = 'https://api.athleticevents.com/v1';
    this.apiKey = 'YOUR_API_KEY'; // Reemplazar con una clave de API real
    this.cache = {
      events: [],
      lastFetch: null,
      cacheDuration: 15 * 60 * 1000, // 15 minutos en milisegundos
    };
  }

  async getEvents(filters = {}) {
    // Usar datos en caché si están disponibles y son recientes
    if (this.shouldUseCache()) {
      return this.filterEvents(this.cache.events, filters);
    }

    try {
      // En un entorno real, aquí haríamos la llamada a la API
      // const response = await axios.get(`${this.apiUrl}/events`, {
      //   headers: { 'Authorization': `Bearer ${this.apiKey}` },
      //   params: this.buildApiParams(filters)
      // });
      // this.cacheEvents(response.data);
      // return this.filterEvents(response.data, filters);
      
      // Datos de ejemplo mientras no tengamos la API real
      const mockEvents = this.getMockEvents();
      this.cacheEvents(mockEvents);
      return this.filterEvents(mockEvents, filters);
      
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('No se pudieron cargar los eventos. Por favor, inténtalo de nuevo más tarde.');
    }
  }

  buildApiParams(filters) {
    const params = {
      country: filters.country || 'ES', // Por defecto España
      state: filters.state,
      city: filters.city,
      type: filters.type,
      distance: filters.distance,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
      page: filters.page || 1,
      per_page: filters.perPage || 12,
    };

    // Eliminar parámetros vacíos
    return Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );
  }

  filterEvents(events, filters) {
    return events.filter(event => {
      // Filtrar por tipo de carrera
      if (filters.type && event.type !== filters.type) return false;
      
      // Filtrar por distancia
      if (filters.distance && event.distance !== filters.distance) return false;
      
      // Filtrar por país
      if (filters.country && event.location.country !== filters.country) return false;
      
      // Filtrar por región/estado
      if (filters.state && event.location.state !== filters.state) return false;
      
      // Filtrar por ciudad
      if (filters.city && event.location.city !== filters.city) return false;
      
      // Filtrar por rango de fechas
      if (filters.month) {
        const eventDate = new Date(event.date);
        const startDate = new Date();
        const endDate = addMonths(new Date(), 6);
        
        if (!isWithinInterval(eventDate, { start: startDate, end: endDate })) {
          return false;
        }
      }
      
      return true;
    });
  }

  shouldUseCache() {
    return (
      this.cache.events.length > 0 &&
      this.cache.lastFetch &&
      Date.now() - this.cache.lastFetch < this.cache.cacheDuration
    );
  }

  cacheEvents(events) {
    this.cache.events = events;
    this.cache.lastFetch = Date.now();
  }

  // Datos de ejemplo para desarrollo
  getMockEvents() {
    const now = new Date();
    const eventTypes = ['5K', '10K', 'Media Maratón', 'Maratón', 'Trail', 'Cross'];
    const countries = ['España', 'Francia', 'Portugal', 'Italia', 'Alemania', 'Reino Unido'];
    const cities = {
      'España': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga'],
      'Francia': ['París', 'Marsella', 'Lyon', 'Toulouse', 'Niza'],
      'Portugal': ['Lisboa', 'Oporto', 'Braga', 'Faro'],
      'Italia': ['Roma', 'Milán', 'Nápoles', 'Turín', 'Florencia'],
      'Alemania': ['Berlín', 'Múnich', 'Hamburgo', 'Colonia', 'Fráncfort'],
      'Reino Unido': ['Londres', 'Manchester', 'Liverpool', 'Edimburgo', 'Glasgow']
    };

    return Array.from({ length: 24 }, (_, i) => {
      const eventDate = new Date(now);
      eventDate.setDate(now.getDate() + Math.floor(i / 4));
      
      const country = countries[Math.floor(Math.random() * countries.length)];
      const city = cities[country][Math.floor(Math.random() * cities[country].length)];
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const distance = this.getDistanceForType(type);
      
      return {
        id: `event-${i + 1}`,
        title: `${type} ${city} ${eventDate.getFullYear()}`,
        description: `Carrera popular de ${type.toLowerCase()} por las calles de ${city}. Disfruta de un recorrido único y de un ambiente inigualable.`,        date: eventDate.toISOString(),
        type: type.toLowerCase(),
        distance: distance,
        location: {
          city: city,
          state: '',
          country: country,
          address: 'Plaza Principal, s/n',
          coordinates: {
            lat: 40.4168 + (Math.random() - 0.5) * 5,
            lng: -3.7038 + (Math.random() - 0.5) * 5
          }
        },
        image: `https://source.unsplash.com/random/800x600/?running,race,${i}`,
        price: {
          amount: Math.floor(10 + Math.random() * 40),
          currency: 'EUR'
        },
        organizer: 'Organización de Carreras Populares',
        website: 'https://www.example.com',
        featured: i % 5 === 0, // Cada quinto evento es destacado
        maxParticipants: 1000,
        registeredParticipants: Math.floor(Math.random() * 1000),
        tags: [type.toLowerCase(), city.toLowerCase(), country.toLowerCase()]
      };
    });
  }

  getDistanceForType(type) {
    const distances = {
      '5K': '5 km',
      '10K': '10 km',
      'Media Maratón': '21.097 km',
      'Maratón': '42.195 km',
      'Trail': 'Variable',
      'Cross': '8-12 km'
    };
    
    return distances[type] || 'Variable';
  }

  // Métodos para obtener opciones de filtros
  async getEventTypes() {
    return [
      { id: '5k', name: '5K' },
      { id: '10k', name: '10K' },
      { id: 'media', name: 'Media Maratón' },
      { id: 'maraton', name: 'Maratón' },
      { id: 'trail', name: 'Trail' },
      { id: 'cross', name: 'Cross' }
    ];
  }

  async getCountries() {
    // En un entorno real, esto vendría de la API
    return [
      { id: 'ES', name: 'España' },
      { id: 'FR', name: 'Francia' },
      { id: 'PT', name: 'Portugal' },
      { id: 'IT', name: 'Italia' },
      { id: 'DE', name: 'Alemania' },
      { id: 'GB', name: 'Reino Unido' }
    ];
  }

  async getStates(countryCode) {
    // En un entorno real, esto dependería del país seleccionado
    const statesByCountry = {
      'ES': [
        { id: 'MD', name: 'Madrid' },
        { id: 'CT', name: 'Cataluña' },
        { id: 'AN', name: 'Andalucía' },
        { id: 'VC', name: 'Comunidad Valenciana' },
        { id: 'PV', name: 'País Vasco' },
        { id: 'GA', name: 'Galicia' }
      ],
      'FR': [
        { id: 'IDF', name: 'Île-de-France' },
        { id: 'PACA', name: 'Provenza-Alpes-Costa Azul' },
        { id: 'NAQ', name: 'Nueva Aquitania' },
        { id: 'OCC', name: 'Occitania' }
      ]
      // Añadir más países según sea necesario
    };

    return statesByCountry[countryCode] || [];
  }

  async getCities(countryCode, stateCode) {
    // En un entorno real, esto dependería del país y estado seleccionados
    const citiesByState = {
      'ES': {
        'MD': ['Madrid', 'Alcalá de Henares', 'Getafe', 'Leganés'],
        'CT': ['Barcelona', 'Girona', 'Lleida', 'Tarragona'],
        'AN': ['Sevilla', 'Málaga', 'Granada', 'Córdoba'],
        'VC': ['Valencia', 'Alicante', 'Castellón de la Plana', 'Elche'],
        'PV': ['Bilbao', 'Vitoria', 'San Sebastián', 'Barakaldo'],
        'GA': ['A Coruña', 'Vigo', 'Ourense', 'Lugo']
      },
      'FR': {
        'IDF': ['París', 'Versalles', 'Boulogne-Billancourt', 'Saint-Denis'],
        'PACA': ['Marsella', 'Niza', 'Toulon', 'Aix-en-Provence']
      }
    };

    if (citiesByState[countryCode] && citiesByState[countryCode][stateCode]) {
      return citiesByState[countryCode][stateCode].map(city => ({
        id: city.toLowerCase().replace(/\s+/g, '-'),
        name: city
      }));
    }

    return [];
  }

  async getDistances(eventType) {
    // Distancias disponibles por tipo de carrera
    const distancesByType = {
      '5k': ['5 km'],
      '10k': ['10 km'],
      'media': ['21.097 km (Media Maratón)'],
      'maraton': ['42.195 km (Maratón)'],
      'trail': ['10 km', '21 km', '42 km', 'Ultra Trail'],
      'cross': ['8 km', '10 km', '12 km']
    };

    return (distancesByType[eventType] || []).map(distance => ({
      id: distance.split(' ')[0],
      name: distance
    }));
  }
}
