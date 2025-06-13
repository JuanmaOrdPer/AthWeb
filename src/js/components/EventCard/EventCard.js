import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export class EventCard {
  constructor(event) {
    this.event = event;
  }

  formatDate(dateString) {
    const date = parseISO(dateString);
    return format(date, "d MMM yyyy", { locale: es });
  }

  formatFullDate(dateString) {
    const date = parseISO(dateString);
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  }

  formatTimeAgo(dateString) {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale: es 
    });
  }

  getTypeBadge(type) {
    const typeIcons = {
      '5k': 'fa-flag-checkered',
      '10k': 'fa-flag-checkered',
      'media': 'fa-mountain',
      'maraton': 'fa-medal',
      'trail': 'fa-tree',
      'cross': 'fa-leaf',
      'ultra': 'fa-fire',
      'triatlon': 'fa-swimmer'
    };

    const typeNames = {
      '5k': '5K',
      '10k': '10K',
      'media': 'Media Maratón',
      'maraton': 'Maratón',
      'trail': 'Trail Running',
      'cross': 'Cross Country',
      'ultra': 'Ultra Trail',
      'triatlon': 'Triatlón'
    };

    const typeClasses = {
      '5k': 'category-5k',
      '10k': 'category-10k',
      'media': 'category-media',
      'maraton': 'category-maraton',
      'trail': 'category-trail',
      'cross': 'category-cross',
      'ultra': 'category-trail',
      'triatlon': 'category-10k'
    };

    const icon = typeIcons[type] || 'fa-flag';
    const name = typeNames[type] || type.toUpperCase();
    const typeClass = typeClasses[type] || 'category-5k';

    return { icon, name, typeClass };
  }

  getLocationText() {
    const { city, region, country } = this.event.location;
    if (region && region !== city) {
      return `${city}, ${country}`;
    }
    return `${city}, ${country}`;
  }

  getPriceInfo() {
    if (!this.event.price) return '';
    
    const hasDiscount = this.event.price.originalPrice && this.event.price.originalPrice > this.event.price.amount;
    const currency = this.event.price.currency || '€';
    
    return `
      <div class="race-price">
        <span class="price-label">Desde</span>
        <div class="price-value">
          ${this.event.price.amount}${currency}
          ${hasDiscount ? `
            <span class="price-discount">-${Math.round(((this.event.price.originalPrice - this.event.price.amount) / this.event.price.originalPrice) * 100)}%</span>
          ` : ''}
        </div>
<div id="modal-${this.event.id}" class="race-modal-overlay" style="display: none;">
  <div class="race-modal">
    <button class="modal-close" onclick="eventModal.close('${this.event.id}')">Cerrar</button>
    <div class="modal-content">
      <h3>${this.event.name}</h3>
      <p><strong>Fecha:</strong> ${this.formatFullDate(this.event.date)}</p>
      <p><strong>Ubicación:</strong> ${this.getLocationText()}</p>
      <p><strong>Distancia:</strong> ${this.event.distance} km</p>
      <p><strong>Descripción:</strong> ${this.event.description || 'Sin descripción disponible.'}</p>
    </div>
  </div>
</div>

      </div>
    `;
  }

  getSoldOutOverlay() {
    const registered = this.event.registeredParticipants || 0;
    const max = this.event.maxParticipants;
    
    if (max && registered >= max) {
      return '<div class="sold-out-overlay"><div class="sold-out-text">AGOTADO</div></div>';
    }
    return '';
  }

  getParticipantsText() {
    const registered = this.event.registeredParticipants || 0;
    const max = this.event.maxParticipants;
    
    if (max) {
      return `${registered}/${max}`;
    }
    return registered.toString();
  }

  render() {
    if (!this.event) return '';
    
    const isFeatured = this.event.featured ? 'featured' : '';
    const isSoldOut = this.event.registeredParticipants >= this.event.maxParticipants ? 'sold-out' : '';
    const backgroundImage = this.event.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
    const typeBadge = this.getTypeBadge(this.event.type);
    
    return `
      <article class="race-card ${isFeatured} ${isSoldOut}" data-id="${this.event.id}">
        
        ${this.getSoldOutOverlay()}
        
        <!-- Imagen principal -->
        <div class="race-card-image" style="background-image: url('${backgroundImage}')">
          <div class="race-card-header">
            <span class="race-type-badge ${typeBadge.typeClass}">
              <i class="fas ${typeBadge.icon}"></i> ${typeBadge.name}
            </span>
            <button class="favorite-btn" onclick="toggleFavorite('${this.event.id}')" title="Añadir a favoritos">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
        
        <!-- Contenido principal -->
        <div class="race-card-content">
          <h3 class="race-title">${this.event.title}</h3>
          
          <div class="race-meta">
            <div class="race-date">
              <i class="far fa-calendar-alt"></i>
              ${this.formatDate(this.event.date)}
            </div>
            <div class="race-location">
              <i class="fas fa-map-marker-alt"></i>
              ${this.getLocationText()}
            </div>
          </div>
          
          <div class="race-info">
            <div class="race-distance">
              <div class="race-info-value">${this.event.distance || 'Variable'}</div>
              <div class="race-info-label">Distancia</div>
            </div>
            <div class="race-participants">
              <div class="race-info-value">${this.getParticipantsText()}</div>
              <div class="race-info-label">Inscritos</div>
            </div>
          </div>
          
          <div class="race-card-footer">
            ${this.getPriceInfo()}
            <button class="view-details-btn" onclick="openEventModal('${this.event.id}')">
              Ver detalles
            </button>
          </div>
        </div>
      </article>
    `;
  }

  // Método para renderizar el modal completo
  renderModal() {
    if (!this.event) return '';

    const backgroundImage = this.event.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
    const typeBadge = this.getTypeBadge(this.event.type);
    const isSoldOut = this.event.registeredParticipants >= this.event.maxParticipants;
    
    return `
      <div class="race-modal-overlay" id="modal-${this.event.id}">
        <div class="race-modal ${isSoldOut ? 'modal-sold-out' : ''}">
          <button class="modal-close" onclick="closeEventModal('${this.event.id}')">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="modal-header" style="background-image: url('${backgroundImage}')">
            <div class="modal-header-content">
              <h2 class="modal-title">${this.event.title}</h2>
              <div class="modal-subtitle">
                <span><i class="far fa-calendar-alt"></i>${this.formatFullDate(this.event.date)}</span>
                <span><i class="fas fa-map-marker-alt"></i>${this.getLocationText()}</span>
                <span class="race-type-badge ${typeBadge.typeClass}">
                  <i class="fas ${typeBadge.icon}"></i> ${typeBadge.name}
                </span>
              </div>
            </div>
          </div>
          
          <div class="modal-content">
            ${this.renderModalStats()}
            ${this.renderModalServices()}
            ${this.renderModalTags()}
            ${this.renderModalDescription()}
            ${this.renderModalRegistration()}
          </div>
          
          ${this.renderModalActions()}
        </div>
      </div>
    `;
  }

  renderModalStats() {
    const stats = [
      {
        icon: 'fa-route',
        value: this.event.distance || 'Variable',
        label: 'Distancia'
      },
      {
        icon: 'fa-users',
        value: this.getParticipantsText(),
        label: 'Inscritos'
      },
      {
        icon: 'fa-mountain',
        value: this.event.elevation ? `+${this.event.elevation}m` : 'N/A',
        label: 'Desnivel'
      },
      {
        icon: 'fa-clock',
        value: this.formatTimeAgo(this.event.date),
        label: 'Fecha'
      }
    ];

    return `
      <div class="modal-section">
        <h3 class="section-title">
          <i class="fas fa-chart-bar"></i>
          Información del Evento
        </h3>
        <div class="modal-stats">
          ${stats.map(stat => `
            <div class="modal-stat">
              <i class="modal-stat-icon fas ${stat.icon}"></i>
              <div class="modal-stat-value">${stat.value}</div>
              <div class="modal-stat-label">${stat.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderModalServices() {
    const services = [];
    
    if (this.event.refreshments || this.event.avituallamiento) {
      services.push({ icon: 'fa-utensils', text: 'Avituallamiento' });
    }
    if (this.event.changingRooms || this.event.vestuarios) {
      services.push({ icon: 'fa-tshirt', text: 'Vestuarios' });
    }
    if (this.event.showers || this.event.duchas) {
      services.push({ icon: 'fa-shower', text: 'Duchas' });
    }
    if (this.event.parking) {
      services.push({ icon: 'fa-car', text: 'Parking' });
    }
    if (this.event.timing || this.event.cronometraje) {
      services.push({ icon: 'fa-stopwatch', text: 'Cronometraje' });
    }
    if (this.event.photography || this.event.fotografia) {
      services.push({ icon: 'fa-camera', text: 'Fotografía' });
    }
    if (this.event.physiotherapy || this.event.fisioterapia) {
      services.push({ icon: 'fa-hand-holding-medical', text: 'Fisioterapia' });
    }

    if (services.length === 0) return '';

    return `
      <div class="modal-section">
        <h3 class="section-title">
          <i class="fas fa-concierge-bell"></i>
          Servicios Incluidos
        </h3>
        <div class="modal-services">
          ${services.map(service => `
            <div class="modal-service">
              <i class="fas ${service.icon}"></i>
              <span>${service.text}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderModalTags() {
    if (!this.event.tags || !this.event.tags.length) return '';
    
    return `
      <div class="modal-section">
        <h3 class="section-title">
          <i class="fas fa-tags"></i>
          Categorías
        </h3>
        <div class="modal-tags">
          ${this.event.tags.map(tag => `
            <span class="modal-tag">${tag}</span>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderModalDescription() {
    if (!this.event.description) return '';
    
    return `
      <div class="modal-section">
        <h3 class="section-title">
          <i class="fas fa-info-circle"></i>
          Descripción del Evento
        </h3>
        <div class="modal-description">
          ${this.event.description}
        </div>
      </div>
    `;
  }

  renderModalRegistration() {
    if (!this.event.maxParticipants) return '';
    
    const registered = this.event.registeredParticipants || 0;
    const max = this.event.maxParticipants;
    const percentage = Math.min(Math.round((registered / max) * 100), 100);
    const remaining = max - registered;
    
    return `
      <div class="modal-section">
        <h3 class="section-title">
          <i class="fas fa-users"></i>
          Estado de Inscripciones
        </h3>
        <div class="registration-progress">
          <div class="progress-header">
            <span class="progress-title">Plazas ocupadas</span>
            <span class="progress-percentage">${percentage}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${percentage}%;"></div>
          </div>
          <div class="progress-details">
            <span class="progress-count">${registered} de ${max} plazas</span>
            <span class="progress-remaining">${remaining > 0 ? `${remaining} disponibles` : 'Completo'}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderModalActions() {
    const registered = this.event.registeredParticipants || 0;
    const max = this.event.maxParticipants;
    const isSoldOut = max && registered >= max;
    
    return `
      <div class="modal-actions">
        ${isSoldOut ? `
          <button class="modal-btn modal-btn-primary" disabled>
            <i class="fas fa-times-circle"></i>
            Inscripciones Cerradas
          </button>
        ` : `
          <a href="${this.event.website || '#'}" class="modal-btn modal-btn-primary" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-external-link-alt"></i>
            Inscribirse Ahora
          </a>
        `}
        <button class="modal-btn modal-btn-secondary" onclick="shareEvent('${this.event.id}')">
          <i class="fas fa-share-alt"></i>
          Compartir Evento
        </button>
      </div>
    `;
  }
}

// Las funciones de interactividad están ahora en modal.js
// Este archivo se enfoca únicamente en la renderización

// Función principal para renderizar todas las tarjetas y modales
window.renderEventCards = function(events, container) {
  if (!events || !events.length) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-calendar-times"></i>
        <h3>No hay eventos disponibles</h3>
        <p>No se encontraron eventos que coincidan con tus criterios de búsqueda. Prueba ajustando los filtros o revisa más tarde.</p>
      </div>
    `;
    return;
  }

  // Renderizar tarjetas
  const cardsHTML = events.map(event => {
    const eventCard = new EventCard(event);
    return eventCard.render();
  }).join('');

  // Renderizar modales
  const modalsHTML = events.map(event => {
    const eventCard = new EventCard(event);
    return eventCard.renderModal();
  }).join('');

  container.innerHTML = cardsHTML;
  
  // Añadir modales al body
  const modalsContainer = document.getElementById('event-modals') || (() => {
    const div = document.createElement('div');
    div.id = 'event-modals';
    document.body.appendChild(div);
    return div;
  })();
  
  modalsContainer.innerHTML = modalsHTML;
  
  // Aplicar animaciones de entrada
  setTimeout(() => {
    const cards = container.querySelectorAll('.race-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.5s ease';
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }, 10);
  
  // Disparar evento para que modal.js aplique favoritos
  window.dispatchEvent(new CustomEvent('cardsLoaded'));
};