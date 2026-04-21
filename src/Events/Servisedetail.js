// services/eventDetailsService.js
import { getMockEventDetails } from './mockEventDetails';

const API_BASE_URL = 'https://songeng.voold.online/api';

/**
 * Получить детали мероприятия по ID
 * Приоритет: API → Mock (fallback при ошибке)
 * @param {number|string} id - ID мероприятия
 * @param {boolean} forceMock - принудительно использовать моки (для тестов)
 * @returns {Promise<Object|null>}
 */
export const fetchEventDetails = async (id, forceMock = false) => {
  const numericId = parseInt(id);

  // Принудительный режим моков (для разработки/тестов)
  if (forceMock) {
    console.log(`📦 [Mock] Загрузка деталей события #${numericId}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Имитация задержки сети
    return getMockEventDetails(numericId);
  }

  try {
    console.log(`🌐 [API] Загрузка деталей события #${numericId}...`);
    
    const response = await fetch(`${API_BASE_URL}/events/${numericId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
      credentials: 'include', 
    });

    // Если API вернул 404 — детали не найдены, пробуем моки
    if (response.status === 404) {
      console.warn(`⚠️ [API] Детали #${numericId} не найдены (404), используем fallback`);
      return getMockEventDetails(numericId);
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const details = await response.json();
    console.log(`✅ [API] Детали события #${numericId} успешно загружены`);
    
    return details;

  } catch (error) {
    // Логирование ошибки
    console.error(`❌ [API] Ошибка загрузки деталей #${numericId}:`, error.message);
    
    // Fallback на моковые данные
    const mockDetails = getMockEventDetails(numericId);
    
    if (mockDetails) {
      console.log(`📦 [Mock] Используем моковые данные для #${numericId}`);
      return mockDetails;
    }
    
    console.warn(`⚠️ Моковые данные для #${numericId} также не найдены`);
    return null;
  }
};

/**
 * Объединить базовые данные события с деталями
 * @param {Object} baseEvent - базовые данные из /api/events/{id}
 * @param {Object} details - детали из /api/events/details/{id} или моков
 * @returns {Object}
 */
export const mergeEventWithDetails = (baseEvent, details) => {
  if (!baseEvent) return null;
  
  // Если деталей нет, возвращаем базовые данные с дефолтными значениями
  if (!details) {
    return {
      ...baseEvent,
      // Дефолтные значения для отсутствующих полей
      date: baseEvent.startDate || details.startDate || null,
      fullDescription: baseEvent.description || '',
      category: baseEvent.eventType?.toUpperCase() || 'Мероприятие',
      currentParticipants: 0,
      currentSpectators: 0,
      contactEmail: '',
      contactPhone: '',
      requirements: '',
      price: 0,
      rewardsPoints: baseEvent.participantPoints || 0,
      duration: 'Не указано',
      level: 'Любительский',
      rules: '',
      equipment: '',
      address: '',
      format: '',
      teamName: null,
      registeredAt: null,
    };
  }

  // Объединяем: базовые поля из API, детали — из ответа (API или моки)
  return {
    // Базовые данные из API (всегда приоритет)
    ...baseEvent,
    date: baseEvent.startDate || details.startDate || null,
    // Детали (перезаписывают или дополняют базовые)
    fullDescription: details.fullDescription || baseEvent.description,
    category: details.category || baseEvent.eventType?.toUpperCase(),
    currentParticipants: details.currentParticipants ?? 0,
    currentSpectators: details.currentSpectators ?? 0,
    contactEmail: details.contactEmail || '',
    contactPhone: details.contactPhone || '',
    requirements: details.requirements || '',
    price: details.price ?? 0,
    rewardsPoints: details.rewardsPoints ?? baseEvent.participantPoints ?? 0,
    duration: details.duration || 'Не указано',
    level: details.level || 'Любительский',
    rules: details.rules || '',
    equipment: details.equipment || '',
    address: details.address || '',
    format: details.format || '',
    teamName: details.teamName || null,
    registeredAt: details.registeredAt || null,
  };
};

/**
 * Получить полное событие (базовые данные + детали)
 * @param {number|string} id
 * @param {boolean} forceMock
 * @returns {Promise<Object|null>}
 */
export const fetchFullEvent = async (id, forceMock = false) => {
  try {
    // 1. Загружаем базовые данные
    const baseResponse = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!baseResponse.ok) {
      throw new Error(`Базовые данные не найдены: ${baseResponse.status}`);
    }
    
    const baseEvent = await baseResponse.json();
    
    // 2. Загружаем детали (с fallback на моки)
    const details = await fetchEventDetails(id, forceMock);
    
    // 3. Объединяем
    return mergeEventWithDetails(baseEvent, details);
    
  } catch (error) {
    console.error(`❌ Ошибка загрузки полного события #${id}:`, error.message);
    
    // Полный fallback: пробуем получить моковые базовые данные + моковые детали
    if (forceMock === false) {
      console.log('📦 Пробуем полный fallback на моки...');
      const mockDetails = getMockEventDetails(parseInt(id));
      if (mockDetails) {
        return {
          id: parseInt(id),
          title: mockDetails.title || `Событие #${id}`,
          description: mockDetails.fullDescription?.slice(0, 100) + '...' || '',
          date: mockDetails.startDate || new Date().toISOString(),
          startDate: mockDetails.startDate || new Date().toISOString(),
          ...mockDetails,
        };
      }
    }
    
    return null;
  }
};