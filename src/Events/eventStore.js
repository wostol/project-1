// stores/eventStore.js
import { create } from 'zustand';

const useEventStore = create((set, get) => ({
  // Состояние
  events: [],
  loading: false,
  error: null,
  selectedEvent: null,

  // Действия
  fetchEvents: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('https://songeng.voold.online/api/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }
      
      const data = await response.json();
      set({ events: data, loading: false });
      return data;
      
    } catch (error) {
      console.error('Ошибка загрузки мероприятий:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },
  
  fetchEventById: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`https://songeng.voold.online/api/events/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }
      
      const data = await response.json();
      set({ selectedEvent: data, loading: false });
      return data;
      
    } catch (error) {
      console.error('Ошибка загрузки мероприятия:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  clearError: () => set({ error: null }),
}));

// Селекторы
export const useEvents = () => useEventStore((state) => state.events);
export const useEventLoading = () => useEventStore((state) => state.loading);
export const useEventError = () => useEventStore((state) => state.error);
export const useSelectedEvent = () => useEventStore((state) => state.selectedEvent);

export default useEventStore;