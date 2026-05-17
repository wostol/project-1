import React from 'react'
import './Skeleton.css'

// Универсальный скелетон для карточки мероприятия
export const EventCardSkeleton = () => (
  <div className='skeleton-event-card'>
    <div className='skeleton-image'></div>
    <div className='skeleton-content'>
      <div className='skeleton-title'></div>
      <div className='skeleton-date'></div>
      <div className='skeleton-description'></div>
      <div className='skeleton-footer'>
        <div className='skeleton-button'></div>
      </div>
    </div>
  </div>
)

// Скелетон для страницы профиля
export const ProfileSkeleton = () => (
  <div className='skeleton-profile'>
    <div className='skeleton-profile-header'>
      <div className='skeleton-avatar'></div>
      <div className='skeleton-profile-info'>
        <div className='skeleton-name'></div>
        <div className='skeleton-email'></div>
      </div>
    </div>
    <div className='skeleton-profile-stats'>
      <div className='skeleton-stat-item'></div>
      <div className='skeleton-stat-item'></div>
      <div className='skeleton-stat-item'></div>
    </div>
    <div className='skeleton-profile-content'>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='skeleton-list-item'></div>
      ))}
    </div>
  </div>
)

// Скелетон для списка мероприятий
export const EventsListSkeleton = ({ count = 6 }) => (
  <div className='skeleton-events-grid'>
    {[...Array(count)].map((_, i) => (
      <EventCardSkeleton key={i} />
    ))}
  </div>
)

// Скелетон для корзины
export const CartSkeleton = () => (
  <div className='skeleton-cart'>
    <div className='skeleton-cart-items'>
      {[...Array(3)].map((_, i) => (
        <div key={i} className='skeleton-cart-item'>
          <div className='skeleton-cart-image'></div>
          <div className='skeleton-cart-info'>
            <div className='skeleton-cart-title'></div>
            <div className='skeleton-cart-price'></div>
          </div>
        </div>
      ))}
    </div>
    <div className='skeleton-cart-summary'>
      <div className='skeleton-summary-line'></div>
      <div className='skeleton-summary-line'></div>
      <div className='skeleton-summary-total'></div>
      <div className='skeleton-checkout-button'></div>
    </div>
  </div>
)

// Скелетон для деталей мероприятия
export const EventDetailSkeleton = () => (
  <div className='skeleton-event-detail'>
    <div className='skeleton-detail-image'></div>
    <div className='skeleton-detail-content'>
      <div className='skeleton-detail-title'></div>
      <div className='skeleton-detail-date'></div>
      <div className='skeleton-detail-description'></div>
      <div className='skeleton-detail-description-line'></div>
      <div className='skeleton-detail-description-line'></div>
      <div className='skeleton-register-button'></div>
    </div>
  </div>
)

// Скелетон для магазина
export const ShopSkeleton = ({ count = 8 }) => (
  <div className='skeleton-shop-grid'>
    {[...Array(count)].map((_, i) => (
      <div key={i} className='skeleton-shop-item'>
        <div className='skeleton-shop-image'></div>
        <div className='skeleton-shop-title'></div>
        <div className='skeleton-shop-price'></div>
        <div className='skeleton-shop-button'></div>
      </div>
    ))}
  </div>
)

// Базовый скелетон-контейнер для обёртки страниц
export const PageSkeleton = ({ children, className = '' }) => (
  <div className={`skeleton-page-container ${className}`}>{children}</div>
)

export default PageSkeleton