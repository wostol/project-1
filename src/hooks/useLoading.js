import { useState, useEffect, useCallback } from 'react';

/**
 * Хук для отслеживания загрузки изображений
 * @param {string[]} imageSources - Массив URL изображений
 * @returns {Object} { loaded, total, progress, error }
 */
export const useImageLoading = (imageSources = []) => {
  const [loadedImages, setLoadedImages] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!imageSources || imageSources.length === 0) {
      setTotalImages(0);
      setLoadedImages(0);
      return;
    }

    const validSources = imageSources.filter(src => src && typeof src === 'string');
    setTotalImages(validSources.length);
    setLoadedImages(0);
    setError(null);

    if (validSources.length === 0) {
      return;
    }

    let loadedCount = 0;
    let errorCount = 0;

    const handleLoad = () => {
      loadedCount++;
      setLoadedImages(prev => prev + 1);
    };

    const handleError = (e) => {
      errorCount++;
      console.warn('Failed to load image:', e.target.src);

      // Считаем errored изображения как загруженные (чтобы не блокировать загрузку навсегда)
      loadedCount++;
      setLoadedImages(prev => prev + 1);

      if (errorCount === validSources.length) {
        setError('Не удалось загрузить изображения');
      }
    };

    const images = [];

    validSources.forEach(src => {
      const img = new Image();
      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = src;
      images.push(img);
    });

    return () => {
      images.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imageSources]);

  const progress = totalImages > 0 ? (loadedImages / totalImages) * 100 : 100;
  const loaded = loadedImages === totalImages;

  return {
    loaded,
    total: totalImages,
    loadedCount: loadedImages,
    progress,
    error
  };
};

/**
 * Хук для отслеживания загрузки данных с сервера
 * @param {Function} fetchData - Функция для получения данных
 * @param {Array} dependencies - Зависимости для повторного вызова
 * @returns {Object} { data, loading, error, refetch }
 */
export const useDataLoading = (fetchData, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Ошибка загрузки данных');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchData, ...dependencies]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    refetch: fetch
  };
};

/**
 * Хук для комбинированной загрузки (данные + изображения)
 * @param {Object} options - { fetchData, imageSources }
 * @returns {Object} { ready, loading, progress, data, imagesLoaded }
 */
export const useCombinedLoading = ({ fetchData, imageSources = [] }) => {
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  const imageLoading = useImageLoading(imageSources);

  const loadData = useCallback(async () => {
    if (!fetchData) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    setDataError(null);
    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setDataError(err.message || 'Ошибка загрузки данных');
    } finally {
      setDataLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Общий прогресс: 70% данные, 30% изображения
  const dataWeight = fetchData ? 0.7 : 0;
  const imageWeight = imageSources.length > 0 ? 0.3 : 0;

  const dataProgress = dataLoading ? 0 : 100;
  const overallProgress = (dataProgress * dataWeight) + (imageLoading.progress * imageWeight);

  const ready = !dataLoading && imageLoading.loaded;
  const loading = dataLoading || !imageLoading.loaded;

  return {
    ready,
    loading,
    progress: overallProgress,
    data,
    dataError,
    imagesLoaded: imageLoading.loaded,
    imageProgress: imageLoading.progress,
    refetchData: loadData
  };
};

export default {
  useImageLoading,
  useDataLoading,
  useCombinedLoading
};