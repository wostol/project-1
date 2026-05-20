import { useState, useEffect } from 'react';
import { useImageLoading } from '../hooks/useLoading';
import styles from './ShopPage.module.css';
import { ShopSkeleton } from '../component/Skeleton';
import { apiRequest } from '../auth/apiClient';

// Компонент уведомления
const Notification = ({ notification, onClose }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onClose(notification.id), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onClose(notification.id), 300);
  };

  return (
    <div className={`${styles.notification} ${exiting ? styles.notificationExiting : ''}`}>
      <div className={styles.notificationIcon}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div className={styles.notificationContent}>
        <div className={styles.notificationTitle}>{notification.title}</div>
        <div className={styles.notificationMessage}>{notification.message}</div>
      </div>
      <button className={styles.notificationClose} onClick={handleClose}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div className={styles.notificationProgress}></div>
    </div>
  );
};

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Извлекаем все URL изображений из продуктов
  const imageSources = products.map(p => p.image).filter(Boolean);
  const { loaded: imagesLoaded } = useImageLoading(imageSources);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiRequest('/shop');
        setProducts(data);
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    updateHeaderBadge(totalItems);
  };

  const updateHeaderBadge = (count) => {
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach((badge) => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  };

  const addNotification = (title, message) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, title, message }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item) => item.uuid === product.uuid);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    addNotification('Товар добавлен!', `${product.name} успешно добавлен в корзину`);
  };

  if (loading || !imagesLoaded) {
    return <ShopSkeleton count={3} />;
  }

  return (
    <div className={styles.shopPage}>
      {/* Контейнер уведомлений */}
      <div className={styles.notificationContainer}>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>

      <div className={styles.shopHeader}>
        <h1 className={styles.shopTitle}>Магазин</h1>
        <p className={styles.shopSubtitle}>Официальная мерчендайзинг продукция</p>
      </div>

      <div className={styles.shopContainer}>
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>
                <div className={styles.imagePlaceholder}>
                  <img src={product.image} alt={product.name} />
                </div>
              </div>

              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>

                <div className={styles.productFooter}>
                  <div className={styles.productPricePoints}>
                    <div className={styles.productPoints}>{product.price} баллов</div>
                  </div>
                  <button className={styles.addToCartBtn} onClick={() => addToCart(product)}>
                    <span>+</span> В корзину
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;