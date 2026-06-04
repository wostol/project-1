import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../auth/apiClient';
import styles from './ProfileTabs.module.css';
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    uuid: "notif-001",
    title: "Напоминание о мероприятии",
    message: "Напоминание: завтра в 18:00 волейбол в спорткомплексе. Не забудьте подтвердить участие!",
    type: "event_reminder",
    metadata: { 
      eventId: "b440f221-f754-44b7-bf90-570902383b1d", 
      eventName: "Ночная лига волейбола",
      eventLocation: "Спортивный комплекс 'Здоровье'",
      eventTime: "18:00"
    },
    isRead: false,
    time: "5 минут назад",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: 2,
    uuid: "notif-002",
    title: "Баллы начислены",
    message: "Вам начислено 120 баллов за участие в 'Ночная лига волейбола'! Всего баллов: 830567489",
    type: "points_earned",
    metadata: { 
      points: 120, 
      newTotal: 830567489, 
      eventId: "b440f221-f754-44b7-bf90-570902383b1d",
      eventName: "Ночная лига волейбола"
    },
    isRead: false,
    time: "2 часа назад",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 3,
    uuid: "notif-003",
    title: "Регистрация подтверждена",
    message: "Вы успешно зарегистрированы на 'Ночная лига волейбола' в качестве участника!",
    type: "event_registration",
    metadata: { 
      eventId: "b440f221-f754-44b7-bf90-570902383b1d", 
      eventName: "Ночная лига волейбола", 
      registrationType: "participant",
      registrationDate: new Date().toISOString()
    },
    isRead: false,
    time: "Вчера",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 4,
    uuid: "notif-004",
    title: "Новый уровень!",
    message: "Поздравляем! Вы достигли уровня 'Золотой лев'! Вам открыт бонус: скидка 10% в магазине мерча",
    type: "level_up",
    metadata: { 
      levelId: 5, 
      levelName: "Золотой лев", 
      bonus: "скидка 10% в магазине мерча",
      previousLevel: "Серебряный лев"
    },
    isRead: true,
    time: "3 дня назад",
    createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString()
  },
  {
    id: 5,
    uuid: "notif-005",
    title: "Статус заказа изменён",
    message: "Ваш заказ 'Худи TPU' готов к выдаче. Ждем вас в спортклубе!",
    type: "order_status",
    metadata: { 
      orderId: 12, 
      productName: "Худи TPU", 
      status: "ready",
      price: 2500,
      pickupLocation: "Спортивный комплекс 'Здоровье'"
    },
    isRead: true,
    time: "5 дней назад",
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
  },
  {
    id: 6,
    uuid: "notif-006",
    title: "Давно не виделись!",
    message: "На этой неделе:\n• Турнир по баскетболу (25 июня)\n• Ночная лига волейбола (21 июня)\n\nЗапишитесь и получите баллы!",
    type: "inactivity",
    metadata: { 
      events: [
        { id: "event-001", title: "Турнир по баскетболу", date: "2026-06-25" },
        { id: "b440f221-f754-44b7-bf90-570902383b1d", title: "Ночная лига волейбола", date: "2026-06-21" }
      ],
      lastActiveDate: "2026-05-15"
    },
    isRead: false,
    time: "Неделю назад",
    createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString()
  },
  {
    id: 7,
    uuid: "notif-007",
    title: "Новое мероприятие",
    message: "Открыта регистрация на турнир по баскетболу. Успейте записаться!",
    type: "system",
    metadata: { 
      eventId: "event-001", 
      eventName: "Турнир по баскетболу",
      registrationDeadline: "2026-06-20"
    },
    isRead: false,
    time: "2 дня назад",
    createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString()
  },
  {
    id: 8,
    uuid: "notif-008",
    title: "Баллы начислены",
    message: "Вам начислено 40 баллов за участие в 'Ночная лига волейбола' в качестве болельщика! Всего баллов: 830567529",
    type: "points_earned",
    metadata: { 
      points: 40, 
      newTotal: 830567529, 
      eventId: "b440f221-f754-44b7-bf90-570902383b1d",
      eventName: "Ночная лига волейбола"
    },
    isRead: true,
    time: "2 недели назад",
    createdAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString()
  }
];

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [useMock, setUseMock] = useState(true); // true = мок-данные, false = реальный API
  
  // Загрузка уведомлений
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      if (useMock) {
        // Используем мок-данные с имитацией задержки сети
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUnreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;
        setNotifications([...MOCK_NOTIFICATIONS]);
        setUnreadCount(mockUnreadCount);
        setError(null);
      } else {
        // Реальный API запрос
        const response = await apiRequest('/notifications?limit=50');
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      
      // При ошибке показываем мок-данные
      const mockUnreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;
      setNotifications([...MOCK_NOTIFICATIONS]);
      setUnreadCount(mockUnreadCount);
      setError('Не удалось загрузить уведомления (показаны тестовые данные)');
    } finally {
      setLoading(false);
    }
  }, [useMock]);
  
  // Отметка о прочтении
  const markAsRead = async (id) => {
    try {
      if (useMock) {
        // Мок-версия
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };
  
  // Отметить все как прочитанные
  const markAllAsRead = async () => {
    try {
      if (useMock) {
        // Мок-версия
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      } else {
        await apiRequest('/notifications/read-all', { method: 'PUT' });
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };
  
  // Удаление уведомления
  const deleteNotification = async (id) => {
    try {
      const deleted = notifications.find(n => n.id === id);
      
      if (useMock) {
        // Мок-версия
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        if (!deleted?.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        if (!deleted?.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };
  
  // Иконка для типа уведомления
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event_reminder':
        return (
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <path d='M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z'/>
          </svg>
        );
      case 'event_registration':
        return (
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/>
          </svg>
        );
      case 'points_earned':
        return (
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z'/>
          </svg>
        );
      case 'order_status':
        return (
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <path d='M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z'/>
          </svg>
        );
      case 'level_up':
        return (
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z'/>
          </svg>
        );
      case 'inactivity':
        return (
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/>
          </svg>
        );
      default:
        return (
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'/>
          </svg>
        );
    }
  };
  
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);
  
  if (loading && notifications.length === 0) {
    return (
      <div className={styles.notificationsTab}>
        <div className={styles.loading}>Загрузка уведомлений...</div>
      </div>
    );
  }
  
  return (
    <div className={styles.notificationsTab}>
      {/* Кнопка переключения между мок-данными и реальным API (только для разработки) */}
      {process.env.NODE_ENV === 'development' && (
        <div className={styles.devTools}>
          <button 
            onClick={() => setUseMock(!useMock)}
            className={styles.toggleApiBtn}
          >
            {useMock ? '🎭 Мок-данные' : '📡 Реальный API'}
          </button>
        </div>
      )}
      
      {error && (
        <div className={styles.errorBanner}>
          ⚠️ {error}
        </div>
      )}
      
      {notifications.length > 0 && unreadCount > 0 && (
        <div className={styles.notificationsHeader}>
          <button 
            onClick={markAllAsRead}
            className={styles.markAllReadBtn}
          >
            Отметить все как прочитанные ({unreadCount})
          </button>
        </div>
      )}
      
      {notifications.length > 0 ? (
        notifications.map(notification => (
          <div
            key={notification.id}
            className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
            onClick={() => !notification.isRead && markAsRead(notification.id)}
          >
            <div className={styles.notificationIcon}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className={styles.notificationContent}>
              <h4 className={styles.notificationTitle}>{notification.title}</h4>
              <p className={styles.notificationMessage}>{notification.message}</p>
              <div className={styles.notificationMeta}>
                <span className={styles.notificationTime}>{notification.time}</span>
                {notification.metadata?.points && (
                  <span className={styles.notificationPoints}>
                    +{notification.metadata.points} баллов
                  </span>
                )}
              </div>
            </div>
            {!notification.isRead && (
              <div className={styles.notificationUnreadDot}></div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }}
              className={styles.deleteNotificationBtn}
              title="Удалить"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
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