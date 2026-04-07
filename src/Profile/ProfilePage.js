import React, { useState, useEffect } from 'react'
import './ProfilePage.css'
import { useNavigate } from 'react-router-dom'
import cap from '../image/cap.png'
import pen from '../image/pen.png'
import logo from '../component/lionsib.svg'
import useAuth from '../auth/useAuth'

function ProfilePage () {
  const [activeTab, setActiveTab] = useState('achievements')
  const [userInfo, setUserInfo] = useState(null)
  const [userLevel, setUserLevel] = useState(null)
  const [userAchievements, setUserAchievements] = useState(null)
  const [orders, setOrders] = useState([])
  const [allLevels, setAllLevels] = useState([]) // ← НОВОЕ: все уровни из БД

  const { user, loading, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  // Загрузка всех уровней из БД
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await fetch('/api/levels') // ← Замените на ваш endpoint
        const data = await response.json()
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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
    const totalPoints = user?.total_points || userLevel?.points || 125
    if (totalPoints >= levelMinPoints) {
      return 'completed'
    }
    return 'locked'
  }

  // Находим текущий уровень
  const getCurrentLevel = () => {
    const totalPoints = user?.total_points || userLevel?.points || 125
    const sortedLevels = [...allLevels].sort(
      (a, b) => b.min_points - a.min_points
    )
    return (
      sortedLevels.find(level => totalPoints >= level.min_points) ||
      allLevels[0]
    )
  }

  // Данные для достижений
  const achievementsList = userAchievements || {
    ach1: false,
    ach2: false,
    ach3: false,
    ach4: false
  }

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
  ]

  // Заказы
  const displayOrders =
    orders.length > 0
      ? orders
      : [
          {
            id: 1,
            image: cap,
            product: 'Кружка',
            description: 'Керамическая кружка 350мл',
            price: '90 Б',
            status: 'В работе',
            time: '16:15',
            date: '12.12.2025'
          },
          {
            id: 2,
            image: cap,
            product: 'Кружка',
            description: 'Керамическая кружка 350мл',
            price: '90 Б',
            status: 'Доставлен',
            time: '16:15',
            date: '12.12.2025'
          },
          {
            id: 3,
            image: pen,
            product: 'Ручка',
            description: 'Ручка с логотипом университета',
            price: '40 Б',
            status: 'В работе',
            time: '14:30',
            date: '10.12.2025'
          }
        ]

  const currentLevel = getCurrentLevel()
  const totalPoints = user?.total_points || userLevel?.points || 125

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
        {/* <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Уведомления
        </button> */}

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
          <div className='notifications-tab'>
            <div className='no-content'>
              <svg width='64' height='64' viewBox='0 0 24 24' fill='#6c757d'>
                <path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z' />
              </svg>
              <h3>Новых уведомлений нет</h3>
              <p>Здесь будут появляться важные уведомления и обновления</p>
            </div>
          </div>
        )}

        {activeTab === 'points' && (
          <div className='points-tab'>
            {/* Карточка баллов */}
            <div className='points-card'>
              <div className='points-header'>
                <div className='points-title-section'>
                  <h3>Мои баллы</h3>
                </div>
                <div className='points-total'>
                  {userLevel?.points || 125}
                  <span>баллов</span>
                </div>
              </div>

              <div className='points-details'>
                <div className='points-item'>
                  <span className='points-label'>
                    Активность на мероприятиях
                  </span>
                  <span className='points-value'>
                    +{userLevel?.activity_points || 85} баллов
                  </span>
                </div>
                <div className='points-item'>
                  <span className='points-label'>
                    Бонус
                  </span>
                  <span className='points-value'>
                    +{userLevel?.bonus_points || 40} баллов
                  </span>
                </div>
                <div className='points-item total'>
                  <span className='points-label'>Итого</span>
                  <span className='points-value'>
                    {userLevel?.points || 125} баллов
                  </span>
                </div>
              </div>
            </div>

            {/* Карточка прогресса уровня */}
            <div className='level-progress-card'>
              <div className='level-progress-header'>
                <div className='level-info-left'>
                  <div className='level-circle'>{userLevel?.level || 2}</div>
                  <div>
                    <h4 className='level-name'>Львёнок</h4>
                    <p className='level-range'>50 — 199 баллов</p>
                  </div>
                </div>
                <div className='level-info-right'>
                  <div className='level-next-label'>
                    <svg viewBox='0 0 24 24' fill='currentColor'>
                      <path d='M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z' />
                    </svg>
                    Уровень 3
                  </div>
                  <p className='level-next-value'>от 200 баллов</p>
                </div>
              </div>

              <div className='progress-bar-container'>
                <div className='progress-bar'>
                  <div
                    className='progress-fill'
                    style={{
                      width: `${((userLevel?.points || 125) / 200) * 100}%`
                    }}
                  />
                </div>
                <div className='progress-text'>
                  <span className='progress-text-left'>
                    До следующего уровня:{' '}
                    {userLevel?.points_to_next_level || 75} баллов
                  </span>
                  <span className='progress-text-right'>
                    {userLevel?.points || 125} / 200
                  </span>
                </div>
              </div>
            </div>

            {/* Нижние карточки */}
            <div className='points-info-grid'>
              {/* Как достичь следующего уровня */}
              <div className='info-card'>
                <div className='info-card-header'>
                  <div className='info-card-icon'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                  </div>
                  <h4 className='info-card-title'>
                    Как достичь следующего уровня
                  </h4>
                </div>
                <p className='info-card-content'>
                  Наберите <strong>200 баллов</strong>, участвуя в мероприятиях
                  и выполняя специальные задания. Каждый балл приближает вас к
                  новым привилегиям.
                </p>
              </div>

              {/* Привилегии уровня 3 */}
              <div className='info-card'>
                <div className='info-card-header'>
                  <div
                    className='info-card-icon'
                    style={{
                      background: 'linear-gradient(135deg, #28a745, #20c997)'
                    }}
                  >
                    <svg viewBox='0 0 24 24' fill='currentColor'>
                      <path d='M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z' />
                    </svg>
                  </div>
                  <h4 className='info-card-title'>Привилегии уровня 3</h4>
                </div>
                <ul className='privileges-list'>
                  <li>
                    <span className='privilege-check'>
                    </span>
                    Доступ к эксклюзивным мероприятиям
                  </li>
                  <li>
                    <span className='privilege-check'>
                    </span>
                    Приоритетная запись на события
                  </li>
                  <li>
                    <span className='privilege-check'>
                    </span>
                    Уникальный значок профиля
                  </li>
                  <li>
                    <span className='privilege-check'>
                    </span>
                    Персональные рекомендации
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className='achievements-tab'>
            {/* БЛОК УРОВНЕЙ - НОВОЕ */}
            <div className='levels-section'>
              <h3 className='levels-title'>Все уровни</h3>
              <div className='levels-list'>
                {allLevels.map(level => {
                  const status = getLevelStatus(level.min_points)
                  const isCurrent = currentLevel?.id === level.id
                  const pointsNeeded =
                    level.min_points > totalPoints
                      ? level.min_points - totalPoints
                      : 0

                  return (
                    <div
                      key={level.id}
                      className={`level-item ${status} ${
                        isCurrent ? 'current' : ''
                      }`}
                    >
                      <div
                        className='level-circle'
                        style={{
                          background:
                            status === 'completed'
                              ? `linear-gradient(135deg, ${
                                  level.color || '#003466'
                                }, ${level.color || '#0056b3'})`
                              : status === 'current'
                              ? `linear-gradient(135deg, #28a745, #20c997)`
                              : 'linear-gradient(135deg, #e9ecef, #dee2e6)'
                        }}
                      >
                        {level.id}
                      </div>
                      <div className='level-info-block'>
                        <div className='level-header'>
                          <h4 className='level-name'>{level.name}</h4>
                          {status === 'completed'  && (
                            <span className='level-badge completed'>
                              ПРОЙДЕН
                            </span>
                          )}
                          {isCurrent && (
                            <span className='level-badge current'>ТЕКУЩИЙ</span>
                          )}
                          {status === 'locked' && pointsNeeded > 0 && (
                            <span className='level-badge locked'>
                              {pointsNeeded} БАЛЛОВ
                            </span>
                          )}
                        </div>
                        <p className='level-points'>
                          от {level.min_points} баллов
                        </p>
                        <p className='level-description'>{level.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Сетка достижений */}
            <div className='achievements-grid'>
              {achievementsData.map(achievement => (
                <div
                  key={achievement.id}
                  className={`achievement-card ${
                    !achievement.achieved ? 'locked' : ''
                  }`}
                >
                  <div className='achievement-icon'>
                    {achievement.achieved ? achievement.icon : '🔒'}
                  </div>
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className='orders-tab'>
            {displayOrders.map(order => (
              <div key={order.id} className='order-card'>
                <div className='order-image-container'>
                  <img src={order.image || cap} alt={order.product} />
                </div>
                <div className='order-info-container'>
                  <h3 className='product-name'>{order.product}</h3>
                  <div className='order-details'>
                    <div className='detail-row'>
                      <span className='detail-label'>Статус:</span>
                      <span className='detail-value'>{order.status}</span>
                    </div>
                    <div className='detail-row'>
                      <span className='detail-label'>Время:</span>
                      <span className='detail-value'>{order.time}</span>
                    </div>
                    <div className='detail-row'>
                      <span className='detail-label'>Дата:</span>
                      <span className='detail-value'>{order.date}</span>
                    </div>
                  </div>
                </div>
                <div className='order-price-container'>
                  <span className='order-price'>
                    -{order.price.replace(' Б', '')} Б
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'statictick' && (
  <div className='statistics-tab'>
    {/* Заголовок статистики */}
    {/* <div className='stats-header-section'>
      <h2 className='stats-main-title'>Моя статистика</h2>
      <p className='stats-subtitle'>Ваши достижения и активность в системе</p>
    </div> */}

    {/* Основные показатели */}
    <div className='stats-overview'>
      <div className='stat-card-modern'>
        <div className='stat-card-icon tournaments'>
          <svg width='32' height='32' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z'/>
          </svg>
        </div>
        <div className='stat-card-content'>
          <div className='stat-value-large'>24</div>
          <div className='stat-label-medium'>Участий в мероприятиях</div>
        </div>
      </div>

      <div className='stat-card-modern'>
        <div className='stat-card-icon points'>
          <svg width='32' height='32' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z'/>
          </svg>
        </div>
        <div className='stat-card-content'>
          <div className='stat-value-large'>125</div>
          <div className='stat-label-medium'>Всего баллов</div>
        </div>
      </div>

      <div className='stat-card-modern'>
        <div className='stat-card-icon level'>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
        </div>
        <div className='stat-card-content'>
          <div className='stat-value-large'>2</div>
          <div className='stat-label-medium'>Текущий уровень</div>
        </div>
      </div>
    </div>

    {/* Достижения по местам */}
    <div className='stats-achievements-grid'>
      <div className='achievement-place-card first'>
        <div className='place-icon'>🥇</div>
        <div className='place-value'>8</div>
        <div className='place-label'>Первых мест</div>
        <div className='place-percentage'>33%</div>
      </div>

      <div className='achievement-place-card second'>
        <div className='place-icon'>🥈</div>
        <div className='place-value'>6</div>
        <div className='place-label'>Вторых мест</div>
        <div className='place-percentage'>25%</div>
      </div>

      <div className='achievement-place-card third'>
        <div className='place-icon'>🥉</div>
        <div className='place-value'>4</div>
        <div className='place-label'>Третьих мест</div>
        <div className='place-percentage'>17%</div>
      </div>
    </div>

    {/* История мероприятий */}
    <div className='stats-events-history'>
      <h3 className='history-title'>История мероприятий</h3>
      <div className='events-history-list'>
        <div className='event-history-item'>
          <div className='event-history-date'>
            <div className='event-day'>15</div>
            <div className='event-month'>Дек 2025</div>
          </div>
          <div className='event-history-info'>
            <h4 className='event-history-name'>Гандбольный турнир</h4>
            <p className='event-history-role'>Участник • 3 место 🥉</p>
            <p className='event-history-points'>+150 баллов</p>
          </div>
          <div className='event-history-badge participant'>Участник</div>
        </div>

        <div className='event-history-item'>
          <div className='event-history-date'>
            <div className='event-day'>20</div>
            <div className='event-month'>Ноя 2025</div>
          </div>
          <div className='event-history-info'>
            <h4 className='event-history-name'>Шахматный турнир</h4>
            <p className='event-history-role'>Участник • 1 место 🥇</p>
            <p className='event-history-points'>+200 баллов</p>
          </div>
          <div className='event-history-badge winner'>Победитель</div>
        </div>

        <div className='event-history-item'>
          <div className='event-history-date'>
            <div className='event-day'>10</div>
            <div className='event-month'>Ноя 2025</div>
          </div>
          <div className='event-history-info'>
            <h4 className='event-history-name'>Баскетбол 3x3</h4>
            <p className='event-history-role'>Болельщик</p>
            <p className='event-history-points'>+30 баллов</p>
          </div>
          <div className='event-history-badge spectator'>Болельщик</div>
        </div>

        <div className='event-history-item'>
          <div className='event-history-date'>
            <div className='event-day'>05</div>
            <div className='event-month'>Окт 2025</div>
          </div>
          <div className='event-history-info'>
            <h4 className='event-history-name'>Лыжный марафон</h4>
            <p className='event-history-role'>Участник • 2 место 🥈</p>
            <p className='event-history-points'>+175 баллов</p>
          </div>
          <div className='event-history-badge participant'>Участник</div>
        </div>

        <div className='event-history-item'>
          <div className='event-history-date'>
            <div className='event-day'>28</div>
            <div className='event-month'>Сен 2025</div>
          </div>
          <div className='event-history-info'>
            <h4 className='event-history-name'>Волейбольный турнир</h4>
            <p className='event-history-role'>Участник • 1 место 🥇</p>
            <p className='event-history-points'>+180 баллов</p>
          </div>
          <div className='event-history-badge winner'>Победитель</div>
        </div>
      </div>
      
      {/* <button className='load-more-btn'>
        Загрузить еще
        <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z'/>
        </svg>
      </button> */}
    </div>
  </div>
)}
      </div>
    </div>
  )
}

export default ProfilePage
