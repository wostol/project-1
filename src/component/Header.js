import React, { useState, useRef, useEffect } from 'react';
import logo from './lionsib.svg';
import './Header.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import heartIcon from './like.svg';
import lockIcon from './lock.png';
import profileIcon from './profile.png';
import profileIconActive from './profile-activ.png';
import heartIconActive from './heart-hover.png';
import lockIconActive from './lock-hover.png';
import { useAuth } from '../AuthContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login, logout, user, loading } = useAuth();
  
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [buttonStates, setButtonStates] = useState({
    heart: { hover: false, focus: false },
    lock: { hover: false, focus: false },
    profile: { hover: false, focus: false }
  });

  // Проверка на мобильное устройство
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Загружаем количество товаров в корзине
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalItems = cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
      );
      setCartItemsCount(totalItems);
    };

    updateCartCount();

    const handleStorageChange = e => {
      if (e.key === 'cart') {
        updateCartCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', updateCartCount);
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', updateCartCount);
      clearInterval(interval);
    };
  }, []);

  // Закрываем меню при смене пути
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const updateButtonState = (button, updates) => {
    setButtonStates(prev => ({
      ...prev,
      [button]: { ...prev[button], ...updates }
    }));
  };

  const eventsLinkRef = useRef(null);
  const heartButtonRef = useRef(null);
  const lockButtonRef = useRef(null);
  const profileButtonRef = useRef(null);
  const shopLinkRef = useRef(null);

  useEffect(() => {
    const setFocusOnActiveLink = () => {
      let activeRef = null;

      if (
        location.pathname === '/' ||
        location.pathname === '/events/past' ||
        location.pathname === '/events/upcoming'
      ) {
        activeRef = eventsLinkRef;
      } else if (location.pathname === '/profile') {
        activeRef = profileButtonRef;
      } else if (location.pathname === '/favorites') {
        activeRef = heartButtonRef;
      } else if (location.pathname === '/cart') {
        activeRef = lockButtonRef;
      } else if (location.pathname === '/shop') {
        activeRef = shopLinkRef;
      }

      if (activeRef?.current) {
        setTimeout(() => {
          if (
            activeRef.current &&
            typeof activeRef.current.focus === 'function'
          ) {
            activeRef.current.focus();
          }
        }, 50);
      }
    };

    setFocusOnActiveLink();
  }, [location.pathname]);

  const getIcon = button => {
    const state = buttonStates[button];
    const icons = {
      heart: { normal: heartIcon, active: heartIconActive },
      lock: { normal: lockIcon, active: lockIconActive },
      profile: { normal: profileIcon, active: profileIconActive }
    };

    const isActive = () => {
      if (button === 'heart') return location.pathname === '/favorites';
      if (button === 'lock') return location.pathname === '/cart';
      if (button === 'profile') return location.pathname === '/profile';
      return false;
    };

    if (isActive() || state.focus) {
      return icons[button].active;
    }
    return icons[button].normal;
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (typeof action === 'function') {
        action();
      }
    }
  };

  const handleHeartClick = () => {
    navigate('/favorites');
    setIsMenuOpen(false);
  };

  const handleCartClick = () => {
    navigate('/cart');
    setIsMenuOpen(false);
  };

  const handleProfileClick = e => {
    e.preventDefault();
    navigate('/profile');
    setIsMenuOpen(false);
  };

  const handleEventsClick = e => {
    e.preventDefault();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleShopClick = e => {
    e.preventDefault();
    navigate('/shop');
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    login(); // Запускаем OAuth авторизацию
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    logout(); // Выход из системы
    setIsMenuOpen(false);
  };

  const updateHeaderBadge = count => {
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  };

  useEffect(() => {
    updateHeaderBadge(cartItemsCount);
  }, [cartItemsCount]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Если загружаемся, показываем заглушку
  if (loading) {
    return (
      <header className='header'>
        
        <div className='header-container'>
          <div className='logo'>
            <img src={logo} alt='Connections Logo' className='logo-image' />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className='header'>
      <div className='container'>
      <div className='header-container'>
        <div className='logo'>
          <a href='/' className='logo-link' onClick={handleEventsClick}>
            <img src={logo} alt='Connections Logo' className='logo-image' />
          </a>
        </div>

        {/* Бургер-иконка для мобильной версии */}
        {isMobile && (
          <button
            className={`burger-menu ${isMenuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label='Меню'
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}

        {/* Навигация */}
        <nav
          className={`main-nav ${isMobile ? 'mobile-nav' : ''} ${
            isMenuOpen ? 'open' : ''
          }`}
        >
          <ul className='nav-list'>
            <li className='nav-item'>
              <Link
                to='/'
                className={`nav-link ${
                  location.pathname === '/' ? 'active' : ''
                }`}
                ref={eventsLinkRef}
                tabIndex={location.pathname === '/' ? 0 : -1}
                onClick={handleEventsClick}
                onKeyDown={e => handleKeyDown(e, () => navigate('/'))}
              >
                <span className='nav-text'>Мероприятия</span>
              </Link>
            </li>

            {/* Магазин */}
            <li className='nav-item'>
              <Link
                to='/shop'
                className={`nav-link ${
                  location.pathname === '/shop' ? 'active' : ''
                }`}
                ref={shopLinkRef}
                tabIndex={location.pathname === '/shop' ? 0 : -1}
                onClick={handleShopClick}
                onKeyDown={e => handleKeyDown(e, () => navigate('/shop'))}
              >
                <span className='nav-text'>Магазин</span>
              </Link>
            </li>

            <div className='header-actions'>
              {/* Кнопка с сердечком - ЛЮБИМОЕ */}
              <Link
                to='/favorites'
                className={`heart-icon-link ${
                  location.pathname === '/favorites' ? 'active' : ''
                }`}
                style={{ display: 'contents' }}
              >
                <button
                  ref={heartButtonRef}
                  className={`blue-btn ${
                    location.pathname === '/favorites' ? 'active' : ''
                  }`}
                  aria-label='Избранное'
                  tabIndex={location.pathname === '/favorites' ? 0 : -1}
                  onClick={handleHeartClick}
                  onMouseEnter={() =>
                    updateButtonState('heart', { hover: true })
                  }
                  onMouseLeave={() =>
                    updateButtonState('heart', { hover: false })
                  }
                  onFocus={() => updateButtonState('heart', { focus: true })}
                  onBlur={() =>
                    updateButtonState('heart', { focus: false, hover: false })
                  }
                  onKeyDown={e => handleKeyDown(e, handleHeartClick)}
                >
                  <span className='btn-icon-wrapper'>
                    <svg
                      className='btn-svg'
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <use href='#icon-heart'></use>
                    </svg>
                  </span>
                  <span className='btn-text heart'>Мои мероприятия</span>
                </button>
              </Link>

              {/* Кнопка с корзиной - КОРЗИНА */}
              <Link
                to='/cart'
                className={`lock-icon-link ${
                  location.pathname === '/cart' ? 'active' : ''
                }`}
                style={{ display: 'contents' }}
              >
                <button
                  ref={lockButtonRef}
                  className={`blue-btn ${
                    location.pathname === '/cart' ? 'active' : ''
                  }`}
                  aria-label='Корзина'
                  tabIndex={location.pathname === '/cart' ? 0 : -1}
                  onClick={handleCartClick}
                  onMouseEnter={() =>
                    updateButtonState('lock', { hover: true })
                  }
                  onMouseLeave={() =>
                    updateButtonState('lock', { hover: false })
                  }
                  onFocus={() => updateButtonState('lock', { focus: true })}
                  onBlur={() =>
                    updateButtonState('lock', { focus: false, hover: false })
                  }
                  onKeyDown={e => handleKeyDown(e, handleCartClick)}
                >
                  <span className='btn-icon-wrapper'>
                    <svg
                      className='btn-svg'
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <use href='#icon-cart'></use>
                    </svg>
                  </span>
                  <span className='btn-text'>Корзина</span>
                  <span
                    className='btn-badge cart-badge'
                    style={{
                      display: cartItemsCount > 0 ? 'flex' : 'none'
                    }}
                  >
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                </button>
              </Link>

              {/* Условный рендеринг: кнопка профиля или авторизации */}
              {isAuthenticated ? (
                <div className="profile-container">
                  <Link
                    to='/profile'
                    className={`profile-icon-link ${
                      location.pathname === '/profile' ? 'active' : ''
                    }`}
                    style={{ display: 'contents' }}
                  >
                    <button
                      ref={profileButtonRef}
                      className={`blue-btn ${
                        location.pathname === '/profile' ? 'active' : ''
                      }`}
                      aria-label='Профиль'
                      tabIndex={location.pathname === '/profile' ? 0 : -1}
                      onClick={handleProfileClick}
                      onMouseEnter={() =>
                        updateButtonState('profile', { hover: true })
                      }
                      onMouseLeave={() =>
                        updateButtonState('profile', { hover: false })
                      }
                      onFocus={() => updateButtonState('profile', { focus: true })}
                      onBlur={() =>
                        updateButtonState('profile', { focus: false, hover: false })
                      }
                      onKeyDown={e => handleKeyDown(e, handleProfileClick)}
                    >
                      <span className='btn-icon-wrapper'>
                        <svg
                          className='btn-svg'
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <use href='#icon-profile'></use>
                        </svg>
                      </span>
                      <span className='btn-text'>
                        Профиль
                      </span>
                    </button>
                  </Link>
                  
                  {/* Кнопка выхода для мобильной версии */}

                </div>
              ) : (
                <button
                  className='blue-btn auth-btn'
                  onClick={handleLoginClick}
                  aria-label='Войти'
                >
                  <span className='btn-text'>Войти</span>
                </button>
              )}
            </div>

            {/* SVG спрайт с иконками */}
            <svg style={{ display: 'none' }} xmlns='http://www.w3.org/2000/svg'>
              <defs>
                <symbol id='icon-heart' viewBox="0 0 32 30" fill='none'>
                  <path
                    d="M28.6867 3.21018C27.9537 2.50949 27.0833 1.95365 26.1254 1.57442C25.1675 1.19519 24.1407 1 23.1038 1C22.0669 1 21.0402 1.19519 20.0822 1.57442C19.1243 1.95365 18.254 2.50949 17.5209 3.21018L15.9996 4.66368L14.4783 3.21018C12.9976 1.7955 10.9894 1.00073 8.89541 1.00073C6.80142 1.00073 4.79319 1.7955 3.31251 3.21018C1.83184 4.62487 1 6.54359 1 8.54426C1 10.5449 1.83184 12.4637 3.31251 13.8783L4.83382 15.3318L15.9996 26L27.1654 15.3318L28.6867 13.8783C29.4201 13.178 30.0019 12.3464 30.3988 11.4312C30.7957 10.5159 31 9.53496 31 8.54426C31 7.55356 30.7957 6.57258 30.3988 5.65734C30.0019 4.7421 29.4201 3.91054 28.6867 3.21018Z"           
                    fill="currentColor"
                  />
                </symbol>

                <symbol id='icon-cart' viewBox='0 0 24 24' fill='none'>
                  <path
                    d='M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z'
                    fill='currentColor'
                  />
                </symbol>

                <symbol id='icon-profile' viewBox='0 0 24 24' fill='none'>
                  <path
                    d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
                    fill='currentColor'
                  />
                </symbol>
              </defs>
            </svg>
          </ul>
        </nav>

        {/* Оверлей для мобильного меню */}
        {isMobile && isMenuOpen && (
          <div className='menu-overlay' onClick={() => setIsMenuOpen(false)} />
        )}
        </div>
      </div>
    </header>
  );
};

export default Header;