import { create } from 'zustand';
// ❌ Убираем импорт Servisedetail.js, если он больше нигде не используется
// import { fetchEventDetails, fetchFullEvent } from './Servisedetail.js';
import authService from '../authService';

const normalizeEvent = (raw) => {
  if (!raw) return null;

  const start = new Date(raw.startDate);
  const end = new Date(raw.endDate);
  const durationMs = end - start;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.round((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const duration = minutes > 0 ? `${hours} ч. ${minutes} мин.` : `${hours} ч.`;

  const reg = raw.userRegistration || {};

  return {
    id: raw.uuid,
    title: raw.title,
    description: raw.description || '',
    fullDescription: raw.fullDescription || raw.description || '',

    // 🎯 Ключевые поля
    myRole: raw.myRole || raw.registrationType || reg.role || 'participant',
    registeredAt: raw.registeredAt || reg.registeredAt || raw.createdAt || null,
    teamName: raw.teamName || reg.teamName || null,

    // 📊 Основные данные
    startDate: raw.startDate,
    endDate: raw.endDate,
    duration,
    location: raw.location || 'Адрес не указан',
    organizerId: raw.organizerId,
    participantPoints: raw.participantPoints || 0,
    fanPoints: raw.fanPoints || 0,
    maxParticipants: raw.maxParticipants || 0,
    currentParticipants: raw.currentParticipants || 0,
    currentFans: raw.currentFans || 0,

    // 🛡️ Статус регистрации: приоритет прямого флага, fallback на объект
    isRegistered: Boolean(raw.isRegistered || reg.status),
    userRegistration: reg,

    status: raw.status || 'registration',
    eventType: raw.eventType || 'event',
    registrationDeadline: raw.registrationDeadline || null,

    // 🛡️ Дефолты
    level: raw.level || 'Не указан',
    price: raw.price ?? 0,
    requirements: raw.requirements || 'Не указаны',
    rules: raw.rules || 'Не указаны',
    equipment: raw.equipment || 'Не требуется',
    contactEmail: raw.contactEmail || null,
    contactPhone: raw.contactPhone || null,
    organizer: raw.organizerId ? `ID: ${raw.organizerId}` : 'Не указан',
    rewardsPoints: raw.participantPoints || 0,
  };
};

const useEventStore = create((set, get) => ({
  events: [],
  loading: false,
  error: null,
  selectedEvent: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await authService.fetchWithRefresh('https://songeng.voold.online/api/events', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map(normalizeEvent) : [];
      set({ events: normalized, loading: false });
      return normalized;
    } catch (error) {
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // ✅ Прямой запрос без Servisedetail.js + безопасное слияние
  fetchEventById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.fetchWithRefresh(`https://songeng.voold.online/api/events/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
      const rawData = await response.json();

      const normalized = normalizeEvent(rawData);

      set((state) => {
        const existingIndex = state.events.findIndex(e => e.id === normalized.id);

        // 🔄 Слияние: старые данные + новые. Флаги из списка не теряются.
        const mergedEvent = existingIndex !== -1
          ? { ...state.events[existingIndex], ...normalized }
          : normalized;

        const newEvents = existingIndex !== -1
          ? state.events.map((e, i) => i === existingIndex ? mergedEvent : e)
          : [...state.events, mergedEvent];

        return {
          selectedEvent: mergedEvent,
          events: newEvents,
          loading: false,
        };
      });

      return normalized;
    } catch (error) {
      set({ error: error.message, loading: false, selectedEvent: null });
      return null;
    }
  },

  fetchEventDetailsOnly: async (id) => get().fetchEventById(id),
  getEventFromList: (id) => {
    const { events } = get();
    return events.find((e) => e.id === parseInt(id)) || null;
  },
  updateEvent: (id, updates) => {
    set((state) => ({
      events: state.events.map((e) => (e.id === parseInt(id) ? { ...e, ...updates } : e)),
      selectedEvent: state.selectedEvent?.id === parseInt(id)
        ? { ...state.selectedEvent, ...updates }
        : state.selectedEvent,
    }));
  },
  registerForEvent: async (eventId, registrationType) => {
    set({ loading: true, error: null });
    try {
      const result = await authService.registerForEvent(eventId, registrationType);
      await get().fetchEventById(eventId);
      set({ loading: false });
      return result;
    } catch (error) {
      console.error(`❌ Ошибка регистрации на событие #${eventId}:`, error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  unsubscribeFromEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.fetchWithRefresh(`https://songeng.voold.online/api/events/${eventId}/unregister`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Ошибка API: ${response.status}`);
      }
      set((state) => ({
        events: state.events.filter((e) => e.id !== eventId),
        selectedEvent: state.selectedEvent?.id === eventId ? null : state.selectedEvent,
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      console.error(`❌ Ошибка отписки от события #${eventId}:`, error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  clearSelectedEvent: () => set({ selectedEvent: null }),
  clearError: () => set({ error: null }),
}));

export const useEvents = () => useEventStore((state) => state.events);
export const useEventLoading = () => useEventStore((state) => state.loading);
export const useEventError = () => useEventStore((state) => state.error);
export const useSelectedEvent = () => useEventStore((state) => state.selectedEvent);
export default useEventStore;