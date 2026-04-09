// stores/eventStore.js
import { create } from 'zustand';
import { fetchEventDetails, fetchFullEvent, mergeEventWithDetails } from './Servisedetail.js';
import authService from '../authService';

const API_BASE_URL = 'https://songeng.voold.online/api';

const useEventStore = create((set, get) => ({
  // Состояние
  events: [],
  loading: false,
  error: null,
  selectedEvent: null,
  forceMockData: false, // Флаг для принудительного использования моков

  // Действия
  
  /**
   * Загрузить все события (базовые данные)
   */
  fetchEvents: async () => {
    set({ loading: true, error: null });
    
    try {
      const { forceMockData } = get();
      
      if (forceMockData) {
        // Для тестов: загружаем моковые события
        const { mockEventDetails } = await import('./mockEventDetails');
        const mockEvents = Object.values(mockEventDetails).map(d => ({
          id: d.id,
          title: d.title || `Событие #${d.id}`,
          description: d.fullDescription?.slice(0, 150) + '...',
          startDate: new Date().toISOString(),
          status: 'active',
          participantPoints: d.rewardsPoints || 0,
          location: d.address || 'Локация не указана',
        }));
        set({ events: mockEvents, loading: false });
        return mockEvents;
      }
      
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }
      
      const data = await response.json();
      set({ events: data, loading: false });
      return data;
      
    } catch (error) {
      console.error('❌ Ошибка загрузки событий:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  /**
   * Загрузить полное событие по ID (базовые данные + детали)
   */
  fetchEventById: async (id) => {
    const { forceMockData } = get();
    set({ loading: true, error: null });
    
    try {
      const event = await fetchFullEvent(id, forceMockData);
      
      if (!event) {
        throw new Error('Событие не найдено');
      }
      
      set({ selectedEvent: event, loading: false });
      return event;
      
    } catch (error) {
      console.error(`❌ Ошибка загрузки события #${id}:`, error);
      set({ error: error.message, loading: false, selectedEvent: null });
      return null;
    }
  },

  /**
   * Загрузить только детали события (для случаев, когда базовые данные уже есть)
   */
  fetchEventDetailsOnly: async (id) => {
    const { forceMockData } = get();
    set({ loading: true, error: null });
    
    try {
      const { events, selectedEvent } = get();
      
      // Ищем базовые данные в уже загруженных событиях
      const baseEvent = events.find(e => e.id === parseInt(id)) || 
                       (selectedEvent?.id === parseInt(id) ? selectedEvent : null);
      
      // Загружаем детали (с fallback)
      const details = await fetchEventDetails(id, forceMockData);
      
      // Если есть базовые данные — объединяем
      const fullEvent = baseEvent 
        ? mergeEventWithDetails(baseEvent, details) 
        : details;
      
      if (!fullEvent) {
        throw new Error('Детали не найдены');
      }
      
      set({ selectedEvent: fullEvent, loading: false });
      return fullEvent;
      
    } catch (error) {
      console.error(`❌ Ошибка загрузки деталей #${id}:`, error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  /**
   * Получить событие из уже загруженного списка
   */
  getEventFromList: (id) => {
    const { events } = get();
    return events.find(e => e.id === parseInt(id)) || null;
  },

  /**
   * Обновить данные события в списке (после регистрации и т.п.)
   */
  updateEvent: (id, updates) => {
    set((state) => ({
      events: state.events.map(e =>
        e.id === parseInt(id) ? { ...e, ...updates } : e
      ),
      selectedEvent: state.selectedEvent?.id === parseInt(id)
        ? { ...state.selectedEvent, ...updates }
        : state.selectedEvent,
    }));
  },

  /**
   * Зарегистрироваться на мероприятие
   */
  registerForEvent: async (eventId, registrationType) => {
    set({ loading: true, error: null });

    try {
      const result = await authService.registerForEvent(eventId, registrationType);
      
      // Обновляем данные события после регистрации
      if (result.event) {
        get().updateEvent(eventId, result.event);
      }

      set({ loading: false });
      return result;

    } catch (error) {
      console.error(`❌ Ошибка регистрации на событие #${eventId}:`, error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Утилиты
  clearSelectedEvent: () => set({ selectedEvent: null }),
  clearError: () => set({ error: null }),
  setForceMockData: (value) => set({ forceMockData: value }),
}));

// Селекторы
export const useEvents = () => useEventStore((state) => state.events);
export const useEventLoading = () => useEventStore((state) => state.loading);
export const useEventError = () => useEventStore((state) => state.error);
export const useSelectedEvent = () => useEventStore((state) => state.selectedEvent);
export const useForceMockData = () => useEventStore((state) => state.forceMockData);

export default useEventStore;