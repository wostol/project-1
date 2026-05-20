import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './CartPage.module.css';
import useAuth from '../auth/useAuth';
import { CartSkeleton } from '../component/Skeleton';
import { apiRequest } from '../auth/apiClient';
import ConfirmDialog from '../component/ConfirmDialog';

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

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, itemId: null });
    const [checkoutDialog, setCheckoutDialog] = useState({ isOpen: false, totalPointsCost: 0, remainingPoints: 0 });
  const {user, isAuthenticated } = useAuth();

  const userPoints = isAuthenticated && user?.totalPoints ? user.totalPoints : 0;
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);
        updateHeaderBadge(savedCart.reduce((sum, item) => sum + (item.quantity || 1), 0));
      } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCartFromStorage();
  }, []);

  const updateHeaderBadge = (count) => {
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

  const addNotification = (title, message) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, title, message }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDecreaseQuantity = (uuid) => {
    setCartItems(prevItems => {
      const item = prevItems.find(i => i.uuid === uuid);
      if (!item) return prevItems;
      const currentQty = item.quantity || 1;
      if (currentQty <= 1) {
        setDeleteDialog({ isOpen: true, itemId: uuid });
        return prevItems;
      }
      const newItems = prevItems.map(i =>
        i.uuid === uuid ? { ...i, quantity: currentQty - 1 } : i
      );
      localStorage.setItem('cart', JSON.stringify(newItems));
      const totalItems = newItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
      updateHeaderBadge(totalItems);
      return newItems;
    });
  };

  const handleIncreaseQuantity = (uuid) => {
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.uuid === uuid ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      );
      localStorage.setItem('cart', JSON.stringify(newItems));
      const totalItems = newItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      updateHeaderBadge(totalItems);
      return newItems;
    });
  };

  const confirmDeleteItem = () => {
    if (deleteDialog.itemId) {
      setCartItems(prevItems => {
        const newItems = prevItems.filter(item => item.uuid !== deleteDialog.itemId);
        localStorage.setItem('cart', JSON.stringify(newItems));
        const totalItems = newItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        updateHeaderBadge(totalItems);
        return newItems;
      });
    }
    setDeleteDialog({ isOpen: false, itemId: null });
  };

  const cancelDeleteItem = () => {
    setDeleteDialog({ isOpen: false, itemId: null });
  };

  const removeItem = (uuid) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.uuid !== uuid);
      localStorage.setItem('cart', JSON.stringify(newItems));
      const totalItems = newItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      updateHeaderBadge(totalItems);
      return newItems;
    });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Корзина пуста');
      return;
    }

    if (!isAuthenticated) {
      alert('Пожалуйста, авторизуйтесь для оформления заказа');
      return;
    }

    const totalPointsCost = cartItems.reduce((sum, item) =>
      sum + ((item.points || 0) * (item.quantity || 1)), 0);

    if (userPoints < totalPointsCost) {
      const missingPoints = totalPointsCost - userPoints;
      alert(`Недостаточно баллов!\nНужно: ${totalPointsCost} баллов\nУ вас: ${userPoints} баллов\nНе хватает: ${missingPoints} баллов`);
      return;
    }
setCheckoutDialog({
      isOpen: true,
      totalPointsCost,
      remainingPoints: userPoints - totalPointsCost
    });
  };

  const confirmCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutDialog({ isOpen: false, totalPointsCost: 0, remainingPoints: 0 });

    try {
      const productUuids = cartItems.map(item => item.uuid || item.id);

      // Отправляем POST запрос на /shop/orders
      await apiRequest('/shop/orders', {
        method: 'POST',
        body: JSON.stringify({ productUuids })
      });

      // Очищаем корзину после успешного заказа
      setCartItems([]);
      localStorage.setItem('cart', '[]');
      updateHeaderBadge(0);

      // Показываем уведомление об успехе
      addNotification('Заказ оформлен!', 'Ваш заказ успешно оформлен и будет обработан в ближайшее время.');
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      alert(`Ошибка при оформлении заказа: ${error.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const cancelCheckout = () => {
    setCheckoutDialog({ isOpen: false, totalPointsCost: 0, remainingPoints: 0 });
  };
    const totalPointsCost = cartItems.reduce((sum, item) =>
    sum + ((item.points || 0) * (item.quantity || 1)), 0);
  const canAfford = userPoints >= totalPointsCost;

  if (loading) {
    return <CartSkeleton />;
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.cartHeader}>
        <div>
          <h1 className={styles.cartTitle}>Корзина</h1>
          <p className={styles.cartSubtitle}>Управляйте выбранными товарами и оформляйте заказ за баллы</p>
        </div>
        <div className={styles.userPointsDisplay}>
          <div className={styles.pointsInfo}>
            <span className={styles.pointsLabel}>Ваш баланс</span>
            <span className={styles.pointsValue}>{userPoints} баллов</span>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className={styles.cartEmpty}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          <h3>Корзина пуста</h3>
          <p>Добавьте товары из магазина, чтобы они появились здесь</p>
          <Link to="/shop" className={styles.continueShopping}>
            Перейти в магазин
          </Link>
        </div>
      ) : (
        <div className={styles.cartContainer}>
          <div className={styles.cartItems}>
            <h2>Товары ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} шт.)</h2>
            {cartItems.map(item => (
              <div key={item.uuid} className={styles.cartItem}>
                <div className={styles.cartItemImage}>
                  {item.image ? (
                    <img src={item.image} alt={item.name || item.title} />
                  ) : (
                    <div className={styles.imagePlaceholder}></div>
                  )}
                </div>
                <div className={styles.cartItemDetails}>
                  <h3 className={styles.cartItemTitle}>{item.name || item.title}</h3>
                  <p className={styles.cartItemDescription}>{item.description}</p>
                  <div className={styles.cartItemInfo}>
                    <div className={styles.cartItemPrice}>
                      <span className={styles.pointsPrice}>{(item.points || 0)} баллов</span>
                      {item.price && (
                        <span className={styles.originalPrice}>{item.price}₽</span>
                      )}
                    </div>
                    {item.givesPoints && (
                      <div className={styles.cartItemGivesPoints}>
                        +{item.givesPoints} баллов за покупку
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.cartItemActions}>
                  <div className={styles.cartQuantity}>
                    <button className={styles.quantityBtn} onClick={() => handleDecreaseQuantity(item.uuid)}>-</button>
                    <span className={styles.quantityValue}>{item.quantity || 1}</span>
                    <button className={styles.quantityBtn} onClick={() => handleIncreaseQuantity(item.uuid)}>+</button>
                  </div>
                  <div className={styles.cartItemTotal}>
                    {(item.points || 0) * (item.quantity || 1)} баллов
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.uuid)}>
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.cartSummary}>
            <h2>Итого</h2>

            <div className={styles.cartSummaryItem}>
              <span className={styles.summaryLabel}>Товары ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} шт.)</span>
              <span className={styles.summaryValue}>{totalPointsCost} баллов</span>
            </div>

            <div className={styles.cartSummaryItem}>
              <span className={styles.summaryLabel}>Доставка</span>
              <span className={styles.summaryValue}>Бесплатно</span>
            </div>

            <div className={styles.cartSummaryItem}>
              <span className={styles.summaryLabel}>Ваш баланс</span>
              <span className={styles.summaryValue} style={{
                color: userPoints >= totalPointsCost ? 'var(--color-success)' : 'var(--color-danger)',
                fontWeight: 'var(--font-weight-semibold)'
              }}>
                {userPoints} баллов
              </span>
            </div>

            {!canAfford && (
              <div className={`${styles.cartSummaryItem} ${styles.error}`}>
                <span className={styles.summaryLabel}>Недостаточно баллов</span>
                <span className={styles.summaryValue}>
                  Не хватает: {totalPointsCost - userPoints} баллов
                </span>
              </div>
            )}

            <div className={styles.cartSummaryItem}>
              <span className={`${styles.summaryLabel} ${styles.summaryTotal}`}>К оплате</span>
              <span className={`${styles.summaryValue} ${styles.summaryTotal}`}>{totalPointsCost} баллов</span>
            </div>

            {canAfford && (
              <div className={styles.cartSummaryItem}>
                <span className={styles.summaryLabel}>Останется после оплаты</span>
                <span className={styles.summaryValue} style={{color: 'var(--color-success)', fontWeight: 'var(--font-weight-semibold)'}}>
                  {userPoints - totalPointsCost} баллов
                </span>
              </div>
            )}

            <button
              className={`${styles.checkoutBtn} ${!canAfford || checkoutLoading ? styles.disabled : ''}`}
              onClick={handleCheckout}
              disabled={!canAfford || checkoutLoading}
            >
              {checkoutLoading ? 'Оформление...' : (canAfford ? `Оплатить ${totalPointsCost} баллов` : 'Недостаточно баллов')}
            </button>

            <div className={styles.pointsNote}>
              <p>Все товары приобретаются за баллы. Баллы можно заработать, выполняя задания и участвуя в активностях.</p>
            </div>

            <div className={styles.cartActions}>
              <Link to="/shop" className={styles.continueShopping}>
                ← Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления товара */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Удаление товара"
        message="Удалить выбранный товар? Отменить действие будет невозможно."
        onConfirm={confirmDeleteItem}
        onCancel={cancelDeleteItem}
        confirmText="Удалить"
        cancelText="Отмена"
      />
            <ConfirmDialog
        isOpen={checkoutDialog.isOpen}
        title="Подтверждение оплаты"
        message={`Оплатить заказ на сумму ${checkoutDialog.totalPointsCost} баллов?\nПосле оплаты у вас останется: ${checkoutDialog.remainingPoints} баллов`}
        onConfirm={confirmCheckout}
        onCancel={cancelCheckout}
        confirmText="Оплатить"
        cancelText="Отмена"
      />

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
    </div>
  );
}

export default CartPage;