import React from 'react';
import cap from '../../image/cap.png';
import styles from './ProfileTabs.module.css';

const statusLabels = {
  cart: 'В корзине',
  pending: 'Ожидает оплаты',
  processing: 'В обработке',
  preparing: 'Подготовка',
  ready: 'Готов к выдаче',
  picked_up: 'Получен',
  completed: 'Завершен',
  cancelled: 'Отменен',
  refunded: 'Возврат'
};

// 🔹 Функция склонения слов "балл/балла/баллов"
const pluralizePoints = (count) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'баллов';
  if (mod10 === 1) return 'балл';
  if (mod10 >= 2 && mod10 <= 4) return 'балла';
  return 'баллов';
};

const OrdersTab = ({ orders }) => {
  const displayOrders = orders.length > 0 ? orders : [];

  return (
    <div className={styles.ordersTab}>
      {displayOrders.length > 0 ? (
        displayOrders.map(order => {
          // 🔹 Используем points вместо price
          const unitPoints = parseInt(order.points || order.price) || 0;
          const quantity = order.quantity || 1;
          const totalPoints = unitPoints * quantity;

          return (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderImageContainer}>
                <img src={order.image || cap} alt={order.product} />
              </div>
              <div className={styles.orderInfoContainer}>
                <h3 className={styles.productName}>{order.product}</h3>
                {order.description && (
                  <p className={styles.productDescription} style={{ color: '#6c757d', fontSize: 14, margin: '4px 0 8px 0' }}>
                    {order.description}
                  </p>
                )}
                <div className={styles.orderDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Статус: </span>
                    <span className={styles.detailValue}>{statusLabels[order.status] || order.status}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Количество: </span>
                    <span className={styles.detailValue}>{quantity} шт.</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Баллов за ед.: </span>
                    <span className={styles.detailValue}>{unitPoints} {pluralizePoints(unitPoints)}</span>
                  </div>
                  <div className={styles.detailRow} style={{ fontWeight: 700, borderTop: '1px solid #e9ecef', paddingTop: 8, marginTop: 4 }}>
                    <span className={styles.detailLabel}>Итого: </span>
                    <span className={styles.detailValue} style={{ color: '#003466', fontSize: 16 }}>
                      {totalPoints} {pluralizePoints(totalPoints)}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Дата: </span>
                    <span className={styles.detailValue}>{order.date} {order.time ? `• ${order.time}` : ''}</span>
                  </div>
                </div>
              </div>
              <div className={styles.orderPriceContainer}>
                <span className={styles.orderPrice}>
                  -{totalPoints} {pluralizePoints(totalPoints)}
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <div className={styles.noContent}>
          <svg width='64' height='64' viewBox='0 0 24 24' fill='#6c757d'>
            <path d='M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z'/>
          </svg>
          <h3>Заказов нет</h3>
          <p>Вы еще не оформили ни одного заказа</p>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;