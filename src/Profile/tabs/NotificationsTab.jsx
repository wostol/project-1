import React from 'react';
import styles from './ProfileTabs.module.css';

const NotificationsTab = () => {
  // Пример данных уведомлений (в будущем можно загружать с бэкенда)
  const notifications = [
    {
      id: 1,
      title: 'Новое мероприятие',
      message: 'Открыта регистрация на турнир по волейболу. Успейте записаться!',
      time: '5 минут назад',
      unread: true,
      type: 'event'
    },
    {
      id: 2,
      title: 'Баллы начислены',
      message: 'Вам начислено 150 баллов за участие в гандбольном турнире.',
      time: '2 часа назад',
      unread: true,
      type: 'points'
    },
    {
      id: 3,
      title: 'Заказ оформлен',
      message: 'Ваш заказ "Футболка с логотипом" успешно оформлен и ожидает обработки.',
      time: 'Вчера',
      unread: false,
      type: 'order'
    },
    {
      id: 4,
      title: 'Новый уровень',
      message: 'Поздравляем! Вы достигли уровня "Львенок". Откройте профиль, чтобы увидеть новые привилегии.',
      time: '3 дня назад',
      unread: false,
      type: 'level'
    }
  ];

  return (
    <div className={styles.notificationsTab}>
      {notifications.length > 0 ? (
        notifications.map(notification => (
          <div
            key={notification.id}
            className={`${styles.notificationItem} ${notification.unread ? styles.unread : ''}`}
          >
            <div className={styles.notificationIcon}>
              {notification.type === 'event' && (
                <svg viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z'/>
                </svg>
              )}
              {notification.type === 'points' && (
                <svg viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z'/>
                </svg>
              )}
              {notification.type === 'order' && (
                <svg viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z'/>
                </svg>
              )}
              {notification.type === 'level' && (
                <svg viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z'/>
                </svg>
              )}
            </div>
            <div className={styles.notificationContent}>
              <h4 className={styles.notificationTitle}>{notification.title}</h4>
              <p className={styles.notificationMessage}>{notification.message}</p>
              <span className={styles.notificationTime}>{notification.time}</span>
            </div>
            {notification.unread && (
              <div className={styles.notificationUnreadDot}></div>
            )}
          </div>
        ))
      ) : (
        <div className={styles.noContent}>
          <svg width='64' height='64' viewBox='0 0 24 24' fill='#6c757d'>
            <path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'/>
          </svg>
          <h3>Новых уведомлений нет</h3>
          <p>Здесь будут появляться важные уведомления и обновления</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;