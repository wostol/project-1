import React, { useState, useEffect, useCallback } from 'react';
import styles from './ProfileTabs.module.css';
import { apiRequest } from '../../auth/apiClient';

const PointsHistory = ({ pageSize = 10 }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  // Локальный расчёт баланса на основе загруженных транзакций
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.points || 0), 0);
    setBalance(total);
  }, [items]);

  const fetchHistory = useCallback(async (currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/profile/points?page=${currentPage}&limit=${pageSize}`);
      const newItems = Array.isArray(data) ? data : (data.data || data.results || []);
      const total = data.total ?? data.count ?? null;

      setItems(prev => {
        const updated = currentPage === 1 ? newItems : [...prev, ...newItems];
        if (total !== null) {
          setHasMore(updated.length < total);
        } else {
          setHasMore(newItems.length === pageSize);
        }
        return updated;
      });
    } catch (err) {
      setError(err.message || 'Ошибка загрузки истории');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage);
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleString('ru-RU', { month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatOrderNumber = (description) => {
    if (!description) return 'Операция';
    
    // Извлекаем UUID и сокращаем для отображения
    const uuidMatch = description.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (uuidMatch) {
      const shortUuid = uuidMatch[1].split('-')[0];
      return `Заказ #${shortUuid}`;
    }
    
    // Обработка остальных форматов бэкенда
    return description
      .replace(/Shop order:\s*/i, 'Заказ ')
      .replace(/Attendance at\s*/i, 'Посещение: ')
      .replace(/x\d+$/, '')
      .trim();
  };

  const getTypeMeta = (type, points) => {
    const isPositive = points > 0;
    
    // Точное соответствие типам из бэкенда
    if (type === 'shop_order') return {
      label: 'Покупка в магазине',
      badgeClass: styles.expense,
      role: 'expense'
    };
    if (type === 'refund') return {
      label: 'Возврат средств',
      badgeClass: styles.income,
      role: 'income'
    };
    if (type === 'event_attendance' || type?.includes('event') || type?.includes('registration')) {
      return {
        label: 'Мероприятие',
        badgeClass: styles.income,
        role: 'income'
      };
    }
    
    return {
      label: isPositive ? 'Начисление' : 'Списание',
      badgeClass: isPositive ? styles.income : styles.expense,
      role: isPositive ? 'income' : 'expense'
    };
  };

  if (initialLoad && loading) {
    return (
      <div className={styles.statsEventsHistory}>
        <h3 className={styles.historyTitle}>История операций</h3>
        <div className={styles.noContent}>
          <div className={styles.spinner} />
          <p>Загрузка истории...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.statsEventsHistory}>
        <h3 className={styles.historyTitle}>История операций</h3>
        <div className={styles.noContent}>
          <p style={{ color: '#dc3545', marginBottom: 12 }}>Ошибка: {error}</p>
          <button
            onClick={() => fetchHistory(1)}
            className={styles.loadMoreBtn}
            style={{ maxWidth: 200, margin: '0 auto' }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.statsEventsHistory}>
      <div className={styles.historyHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 className={styles.historyTitle}>История операций</h3>
      </div>

      {items.length === 0 ? (
        <div className={styles.noContent}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#6c757d" style={{ marginBottom: 16 }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V11h-2.8v3.2c0 .83-.67 1.5-1.5 1.5S7.6 15.03 7.6 14.2V9.8c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h2.8V7.8c0-.83-.67-1.5-1.5-1.5S10.4 6.97 10.4 7.8V14c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5z" />
          </svg>
          <h3>История пуста</h3>
          <p>Здесь появятся ваши начисления и покупки</p>
        </div>
      ) : (
        <div className={styles.eventsHistoryList}>
          {items.map(item => {
            const date = formatDate(item.createdAt);
            const meta = getTypeMeta(item.pointsType, item.points);
            const isPositive = item.points > 0;
            const borderColor = isPositive ? '#28a745' : '#dc3545';
            const textColor = isPositive ? '#28a745' : '#dc3545';
            const title = formatOrderNumber(item.description);

            return (
              <div
                key={item.id}
                className={`${styles.eventHistoryItem} ${styles[meta.role]}`}
                style={{ borderLeftColor: borderColor }}
              >
                <div className={styles.eventHistoryDate}>
                  <div className={styles.eventDay}>{date.day}</div>
                  <div className={styles.eventMonth}>{date.month}</div>
                </div>

                <div className={styles.eventHistoryInfo}>
                  <h4 className={styles.eventHistoryName}>{title}</h4>
                  <p className={styles.eventHistoryRole}>
                    {meta.label} • {date.time}
                  </p>
                  <p className={styles.eventHistoryPoints} style={{ color: textColor, fontWeight: 700, fontSize: 16 }}>
                    {isPositive ? '+' : ''}{item.points} баллов
                  </p>
                </div>

                <div className={`${styles.eventHistoryBadge} ${meta.badgeClass}`}>
                  {isPositive ? 'ПРИХОД' : 'РАСХОД'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <button
          className={styles.loadMoreBtn}
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} style={{ marginRight: 8 }} />
              Загрузка...
            </>
          ) : (
            'Загрузить ещё'
          )}
        </button>
      )}

      {!hasMore && items.length > 0 && (
        <p style={{ textAlign: 'center', color: '#6c757d', marginTop: 20, fontSize: 14 }}>
          Вы просмотрели всю историю
        </p>
      )}
    </div>
  );
};

export default PointsHistory;