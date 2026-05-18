import { useState, useEffect, useCallback } from 'react';
import useEventStore, {
  useEvents,
  useEventLoading,
  useEventError
} from '../Events/eventStore';
import EventCard from '../component/EventCard/EventCard.js';
import styles from './MyEvents.module.css';
import { checkAuthAndRefresh } from '../auth/apiClient';
import ConfirmDialog from '../component/ConfirmDialog.js';
import { EventsListSkeleton } from '../component/Skeleton';

function MyEvents() {
  const fetchMyEvents = useEventStore((state) => state.fetchMyEvents);
  const fetchEventDetails = useEventStore((state) => state.fetchEventDetailsOnly);
  const updateEvent = useEventStore((state) => state.updateEvent);
  const events = useEvents();
  const loading = useEventLoading();
  const error = useEventError();
  const unsubscribeFromEvent = useEventStore((state) => state.unsubscribeFromEvent);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  useEffect(() => {
    const loadMyEvents = async () => {
      try {
        // 🔥 ПРОВЕРКА: Если токена нет, делаем рефреш ПЕРЕД запросом данных
        await checkAuthAndRefresh();
        // Теперь делаем запрос к данным, токен должен быть в куках
        await fetchMyEvents();
      } catch (err) {
        console.error('Failed to load my events:', err);
        // Ошибка уже обработана в checkAuthAndRefresh (вызван logout)
      }
    };

    loadMyEvents();
  }, [fetchMyEvents]);

  const registeredEvents = events.filter(event => event.isRegistered === true);

const handleUnsubscribeRequest = useCallback((eventId) => {
    setSelectedEventId(eventId);
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmUnsubscribe = useCallback(async () => {
    if (!selectedEventId) return;

    setIsUnsubscribing(true);
    try {
      await unsubscribeFromEvent(selectedEventId);
      setShowConfirmDialog(false);
      setSelectedEventId(null);
      fetchMyEvents();
    } catch (err) {
      console.error('Ошибка при отписке:', err);
      alert('Не удалось отписаться. Попробуйте позже.');
    } finally {
      setIsUnsubscribing(false);
    }
  }, [selectedEventId, fetchMyEvents, unsubscribeFromEvent]);

  const handleCancelUnsubscribe = useCallback(() => {
    setShowConfirmDialog(false);
    setSelectedEventId(null);
  }, []);


  if (loading && events.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Мои мероприятия</h1>
          <EventsListSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Мои мероприятия</h1>
          <div className={styles.errorState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <h3>Ошибка загрузки</h3>
            <p>{error}</p>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={fetchMyEvents}>
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Мои мероприятия</h1>
        <div className={styles.eventsList}>
          {registeredEvents.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
              </svg>
              <h3>Нет мероприятий</h3>
              <p>Зарегистрируйтесь на мероприятие, чтобы оно появилось здесь</p>
            </div>
            ) : (
            registeredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onUnsubscribe={handleUnsubscribeRequest}
                fetchEventDetails={fetchEventDetails}
                updateEvent={updateEvent}
              />
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Отписка от мероприятия"
        message="Вы уверены, что хотите отписаться от мероприятия?"
        onConfirm={handleConfirmUnsubscribe}
        onCancel={handleCancelUnsubscribe}
        confirmText="Отписаться"
        cancelText="Отмена"
        isLoading={isUnsubscribing}
      />
    </div>
  );
}

export default MyEvents;