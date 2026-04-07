import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './CartPage.module.css';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [userPoints, setUserPoints] = useState(1000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);
        updateHeaderBadge(savedCart.reduce((sum, item) => sum + (item.quantity || 1), 0));
        
        const savedPoints = localStorage.getItem('userPoints');
        if (savedPoints) {
          setUserPoints(parseInt(savedPoints));
        }
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

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    setCartItems(items => {
      const newItems = items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(newItems));
      const totalItems = newItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      updateHeaderBadge(totalItems);
      return newItems;
    });
  };

  const removeItem = (id) => {
    setCartItems(items => {
      const newItems = items.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(newItems));
      const totalItems = newItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      updateHeaderBadge(totalItems);
      return newItems;
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Корзина пуста');
      return;
    }
    const totalPointsCost = cartItems.reduce((sum, item) => 
      sum + ((item.pricePoints || item.price || 0) * (item.quantity || 1)), 0);

    if (userPoints < totalPointsCost) {
      const missingPoints = totalPointsCost - userPoints;
      alert(`Недостаточно баллов!\nНужно: ${totalPointsCost} баллов\nУ вас: ${userPoints} баллов\nНе хватает: ${missingPoints} баллов`);
      return;
    }

    if (window.confirm(`Оплатить заказ на сумму ${totalPointsCost} баллов?\nПосле оплаты у вас останется: ${userPoints - totalPointsCost} баллов`)) {
      const newPointsBalance = userPoints - totalPointsCost;
      setUserPoints(newPointsBalance);
      localStorage.setItem('userPoints', newPointsBalance.toString());
      
      setCartItems([]);
      localStorage.setItem('cart', '[]');
      updateHeaderBadge(0);
      
      alert(`Заказ успешно оформлен!\nСписано: ${totalPointsCost} баллов\nОстаток: ${newPointsBalance} баллов\nСпасибо за покупку!`);
    }
  };

  const totalPointsCost = cartItems.reduce((sum, item) =>
    sum + ((item.pricePoints || item.price || 0) * (item.quantity || 1)), 0);
  const canAfford = userPoints >= totalPointsCost;

  if (loading) {
    return (
      <div className={`${styles.cartPage} ${styles.loading}`}>
        <div className={styles.spinner}></div>
        <p>Загрузка корзины...</p>
      </div>
    );
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
            <h2>Товары ({cartItems.length})</h2>
            {cartItems.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.cartItemImage}>
                  {item.image ? (
                    <img src={item.image} alt={item.name || item.title} />
                  ) : (
                    <div className={styles.imagePlaceholder}>🛒</div>
                  )}
                </div>
                <div className={styles.cartItemDetails}>
                  <h3 className={styles.cartItemTitle}>{item.name || item.title}</h3>
                  <p className={styles.cartItemDescription}>{item.description}</p>
                  <div className={styles.cartItemInfo}>
                    <div className={styles.cartItemPrice}>
                      <span className={styles.pointsPrice}>{(item.pricePoints || item.price || 0)} баллов</span>
                      {item.originalPrice && (
                        <span className={styles.originalPrice}>{item.originalPrice}₽</span>
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
                    <button className={styles.quantityBtn} onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}>-</button>
                    <span className={styles.quantityValue}>{item.quantity || 1}</span>
                    <button className={styles.quantityBtn} onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                  </div>
                  <div className={styles.cartItemTotal}>
                    {(item.pricePoints || item.price || 0) * (item.quantity || 1)} баллов
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                    <span>🗑️</span> Удалить
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
              className={`${styles.checkoutBtn} ${!canAfford ? styles.disabled : ''}`}
              onClick={handleCheckout}
              disabled={!canAfford}
            >
              {canAfford ? `Оплатить ${totalPointsCost} баллов` : 'Недостаточно баллов'}
            </button>

            <div className={styles.pointsNote}>
              <p>💡 Все товары приобретаются за баллы. Баллы можно заработать, выполняя задания и участвуя в активностях.</p>
            </div>

            <div className={styles.cartActions}>
              <Link to="/shop" className={styles.continueShopping}>
                ← Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;