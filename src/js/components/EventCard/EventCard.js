import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export class EventCard {
  constructor(event) {
    this.event = event;
  }

  formatDate(dateString) {
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
      'cross': 'fa-leaf'
    };

    const typeNames = {
      '5k': '5K',
      '10k': '10K',
      'media': 'Media Maratón',
      'maraton': 'Maratón',
      'trail': 'Trail',
      'cross': 'Cross'
    };

    const typeClasses = {
      '5k': 'type-5k',
      '10k': 'type-10k',
      'media': 'type-media',
      'maraton': 'type-marathon',
      'trail': 'type-trail',
      'cross': 'type-cross'
    };

    const icon = typeIcons[type] || 'fa-flag';
    const name = typeNames[type] || type;
    const typeClass = typeClasses[type] || 'type-default';

    return `<span class="event-type ${typeClass}">
      <i class="fas ${icon}"></i> ${name}
    </span>`;
  }

  getFeaturedBadge() {
    if (!this.event.featured) return '';
    
    return `
      <div class="featured-badge">
        <i class="fas fa-star"></i> Destacado
      </div>
    `;
  }

  getLocationText() {
    const { city, country } = this.event.location;
    return `${city}, ${country}`;
  }

  getRegistrationInfo() {
    if (!this.event.maxParticipants) return '';
    
    const percentage = Math.min(
      Math.round((this.event.registeredParticipants / this.event.maxParticipants) * 100),
      100
    );
    
    return `
      <div class="registration-info">
        <div class="registration-progress">
          <div class="progress-bar" style="width: ${percentage}%;"></div>
        </div>
        <div class="registration-details">
          <span>${this.event.registeredParticipants} / ${this.event.maxParticipants} plazas</span>
          <span>${100 - percentage}% disponible</span>
        </div>
      </div>
    `;
  }

  getPriceInfo() {
    if (!this.event.price) return '';
    
    return `
      <div class="price-info">
        <span class="price">${this.event.price.amount} ${this.event.price.currency}</span>
        <span class="price-label">Precio desde</span>
      </div>
    `;
  }

  getTags() {
    if (!this.event.tags || !this.event.tags.length) return '';
    
    return `
      <div class="event-tags">
        ${this.event.tags.slice(0, 3).map(tag => 
          `<span class="tag">${tag}</span>`
        ).join('')}
      </div>
    `;
  }

  render() {
    if (!this.event) return '';
    
    const isFeatured = this.event.featured ? 'featured' : '';
    
    return `
      <article class="event-card ${isFeatured}" data-id="${this.event.id}">
        <div class="event-image">
          <img src="${this.event.image}" alt="${this.event.title}" loading="lazy">
          ${this.getFeaturedBadge()}
          ${this.getTypeBadge(this.event.type)}
        </div>
        
        <div class="event-content">
          <div class="event-header">
            <h3 class="event-title">${this.event.title}</h3>
            <div class="event-meta">
              <span class="event-date">
                <i class="far fa-calendar-alt"></i> 
                ${this.formatDate(this.event.date)}
              </span>
              <span class="event-location">
                <i class="fas fa-map-marker-alt"></i> 
                ${this.getLocationText()}
              </span>
            </div>
          </div>
          
          <div class="event-details">
            <p class="event-description">${this.event.description}</p>
            
            <div class="event-stats">
              <div class="stat">
                <i class="fas fa-route"></i>
                <span>${this.event.distance || 'Distancia variable'}</span>
              </div>
              <div class="stat">
                <i class="fas fa-users"></i>
                <span>${this.event.registeredParticipants || '0'} inscritos</span>
              </div>
            </div>
            
            ${this.getRegistrationInfo()}
            ${this.getTags()}
          </div>
          
          <div class="event-actions">
            <a href="${this.event.website}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Más información
            </a>
            ${this.getPriceInfo()}
          </div>
        </div>
      </article>
    `;
  }
}
