import React from 'react';
import cap from '../../image/cap.png';
import styles from './ProfileTabs.module.css';

const OrdersTab = ({ orders }) => {
  const displayOrders = orders.length > 0 ? orders : [];

  return (
    <div className={styles.ordersTab}>
      {displayOrders.length > 0 ? (
        displayOrders.map(order => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderImageContainer}>
              <img src={order.image || cap} alt={order.product} />
            </div>
            <div className={styles.orderInfoContainer}>
              <h3 className={styles.productName}>{order.product}</h3>
              <div className={styles.orderDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Статус:</span>
                  <span className={styles.detailValue}>{order.status}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Время:</span>
                  <span className={styles.detailValue}>{order.time}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Дата:</span>
                  <span className={styles.detailValue}>{order.date}</span>
                </div>
              </div>
            </div>
            <div className={styles.orderPriceContainer}>
              <span className={styles.orderPrice}>
                -{String(order.price).replace(' Б', '')} Б
              </span>
            </div>
          </div>
        ))
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