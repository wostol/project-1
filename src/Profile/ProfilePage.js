import React, { useState, useEffect } from 'react'
import { useImageLoading } from '../hooks/useLoading'
import './ProfilePage.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../component/lionsib.svg'
import useAuth from '../auth/useAuth'
import { apiRequest } from '../auth/apiClient'
import { ProfileSkeleton } from '../component/Skeleton'
import { PointsTab, AchievementsTab, OrdersTab, StatisticsTab, NotificationsTab } from './tabs'

function ProfilePage () {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'achievements')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [allLevels, setAllLevels] = useState([])
  const [levelsLoading, setLevelsLoading] = useState(true)

  const { user, loading, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  // 🔥 Получаем актуальные баллы из user.totalPoints (бэкенд/локальное хранилище)
  const totalPoints = user?.totalPoints || 0

  // Загрузка заказов
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await apiRequest('/profile/orders')
        setOrders(data)
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error)
        setOrders([])
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Загрузка всех уровней из БД
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const data = await apiRequest('/levels')
        setAllLevels(data)
      } catch (error) {
        console.error('Ошибка загрузки уровней:', error)
        // Fallback данные если API не доступен
        setAllLevels([
          {
            id: 1,
            name: 'Новичок',
            min_points: 0,
            description: 'Начальный этап. Добро пожаловать в клуб!',
            color: '#003466'
          },
          {
            id: 2,
            name: 'Львенок',
            min_points: 50,
            description: 'Вы делаете первые шаги. Продолжайте в том же духе!',
            color: '#28a745'
          },
          {
            id: 3,
            name: 'Хищник',
            min_points: 200,
            description: 'Эксклюзивные мероприятия и приоритетная запись.',
            color: '#0056b3'
          },
          {
            id: 4,
            name: 'Царь зверей',
            min_points: 500,
            description: 'Максимальные привилегии и доступ ко всем событиям.',
            color: '#FFD700'
          },
          {
            id: 5,
            name: 'Легенда',
            min_points: 1000,
            description: 'Высший уровень. Непревзойдённая активность.',
            color: '#FF6B6B'
          }
        ])
      } finally {
        setLevelsLoading(false) // ← Завершаем загрузку уровней
      }
    }

    fetchLevels()
  }, [])

  const handleUpdateName = () => {
    const newName = prompt('Введите новое имя:', user.name || '')
    if (newName && newName !== user.name) {
      updateUser({ name: newName })
    }
  }

  const handleLogout = async () => {
  try {
    // 1. Ждём завершения очистки localStorage и запроса к серверу
    await logout();
    navigate('/', { replace: true });
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    // Даже при ошибке переходим на главную, так как локальная очистка уже прошла
    navigate('/', { replace: true });
  }
};

  // ИЗВЛЕКАЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
  const userFullName =
    user?.lastName && user?.firstName && user?.middleName
      ? `${user.lastName} ${user.firstName} ${user.middleName}`
      : user?.email || 'Пользователь'

  const userGroup =
    user?.userInfo?.studyInfo?.data?.studies?.[0]?.gruppa || '8К32'
  const userInstitute =
    user?.userInfo?.studyInfo?.data?.studies?.[0]?.department || 'ИШИТР'

  const shortInstitute = userInstitute.includes(
    'Инженерная школа информационных технологий'
  )
    ? 'ИШИТР'
    : userInstitute

  // Определяем статус для каждого уровня
  const getLevelStatus = levelMinPoints => {
    if (totalPoints >= levelMinPoints) {
      return 'completed';
    }
    return 'locked';
  };

  // Находим текущий уровень
  const getCurrentLevel = () => {
    const sortedLevels = [...allLevels].sort(
      (a, b) => b.min_points - a.min_points
    );
    return (
      sortedLevels.find(level => totalPoints >= level.min_points) ||
      allLevels[0]
    );
  };

  // Данные для достижений (заглушка, можно загружать с бэкенда)
  const achievementsList = {
    ach1: false,
    ach2: false,
    ach3: false,
    ach4: false
  };

  const achievementsData = [
    {
      id: 1,
      icon: '🏅',
      title: 'Активный участник',
      description: 'Посетил 10+ мероприятий',
      achieved: achievementsList.ach1
    },
    {
      id: 2,
      icon: '🎓',
      title: 'Отличник',
      description: 'Высокая успеваемость',
      achieved: achievementsList.ach2
    },
    {
      id: 3,
      icon: '🌟',
      title: 'Звезда месяца',
      description: 'Лучший студент ноября',
      achieved: achievementsList.ach3
    },
    {
      id: 4,
      icon: '🔒',
      title: 'Лидер курса',
      description: 'Стань лучшим на потоке',
      achieved: achievementsList.ach4
    }
  ];

  // Заказы - используем данные с бэкенда напрямую, fallback только если пусто и не загружается
  const displayOrders = orders.length > 0 ? orders : [];

  // Извлекаем все URL изображений из заказов для предзагрузки
  const orderImageSources = displayOrders.map(o => o.image);
  const { loaded: orderImagesLoaded } = useImageLoading([...orderImageSources, logo]);

  const currentLevel = getCurrentLevel();

  // Вспомогательные функции для работы с уровнями
  const getNextLevelMinPoints = () => {
    const nextLevel = allLevels.find(level => level.min_points > totalPoints)
    return nextLevel ? nextLevel.min_points : totalPoints + 100
  }

  const getPointsToNextLevel = () => {
    const nextLevelMin = getNextLevelMinPoints()
    return Math.max(0, nextLevelMin - totalPoints)
  }

  const getProgressPercentage = () => {
    const prevLevelMin = currentLevel?.min_points || 0
    const nextLevelMin = getNextLevelMinPoints()
    const range = nextLevelMin - prevLevelMin
    if (range <= 0) return 100
    const progress = ((totalPoints - prevLevelMin) / range) * 100
    return Math.min(100, Math.max(0, progress))
  }

  // 🔥 Ждём завершения загрузки: auth + уровни + заказы + изображения
  if (loading || levelsLoading || ordersLoading || !orderImagesLoaded) {
    return (
      <div className='profile-page'>
        <ProfileSkeleton />
      </div>
    )
  }

  return (
    <div className='profile-page'>
      <header className='profile-header'>
        <h1 className='profile-title'>Личный кабинет</h1>
        <button className='profile-exit' onClick={handleLogout}>
          <span className='log-img'>
            <img src={logo} alt='Выход' className='log' />
          </span>
          <span className='log-text'>Выход</span>
        </button>
      </header>

      <div className='profile-tabs'>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Уведомления
        </button>

        <button
          className={`tab-btn ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          Мои баллы
        </button>
        <button
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Достижения
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Мои заказы
        </button>
        <button
          className={`tab-btn ${activeTab === 'statictick' ? 'active' : ''}`}
          onClick={() => setActiveTab('statictick')}
        >
          Статистика
        </button>
      </div>

      <div className='student-card'>
        <div className='student-info'>
          <h2 className='student-name'>{userFullName}</h2>
          <p className='student-details'>
            Учащийся | {userGroup} | {shortInstitute}
          </p>
        </div>
      </div>

      <div className='tab-content'>
        {activeTab === 'notifications' && (
          <NotificationsTab />
        )}

        {activeTab === 'points' && (
          <PointsTab
            totalPoints={totalPoints}
            currentLevel={currentLevel}
            allLevels={allLevels}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsTab
            achievementsData={achievementsData}
            allLevels={allLevels}
            totalPoints={totalPoints}
            currentLevel={currentLevel}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab orders={displayOrders} />
        )}

        {activeTab === 'statictick' && (
          <StatisticsTab />
        )}
      </div>
    </div>
  )
}

export default ProfilePage