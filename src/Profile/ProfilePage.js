import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import cap from '../image/cap.png';
import pen from '../image/pen.png';
import logo from '../component/lionsib.svg';

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('achievements');
  const [userInfo, setUserInfo] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [userAchievements, setUserAchievements] = useState(null);
  const [orders, setOrders] = useState([]);
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Если не авторизован, перенаправляем на главную
  if (!loading && !isAuthenticated) {
    navigate('/');
    return null;
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  // ИЗВЛЕКАЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ ТОЛЬКО ПОСЛЕ ПРОВЕРОК
  const userFullName = user?.userInfo?.userInfo?.full_name || 
                      user?.userInfo?.infoResponse?.full_name || 
                      'Шишкин Иван Иванович';

  const userGroup = user?.userInfo?.studyInfo?.data?.studies?.[0]?.gruppa || '8К32';

  const userInstitute = user?.userInfo?.studyInfo?.data?.studies?.[0]?.department || 'ИШИТР';

  // Сокращаем название института если нужно
  const shortInstitute = userInstitute.includes('Инженерная школа информационных технологий') 
    ? 'ИШИТР' 
    : userInstitute;

  // Данные для достижений
  const achievementsList = userAchievements || {
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

  // Заказы (если с сервера пришли пустые, используем тестовые)
  const displayOrders = orders.length > 0 ? orders : [
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
  ];
  
  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1 className="profile-title">Личный кабинет</h1>
        <button className='profile-exit'>
        <span className='log-img'>
        <img src={logo} alt='Connections Logo' className='log' />
        </span>
        <span className='log-text'>Выход</span>
        </button>
      </header>

      
      <div className="profile-tabs">
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
      
      <div className="student-card">
        <div className="student-info">
          <h2 className="student-name">
            {userFullName}
          </h2>
          <p className="student-details">
            Учащийся | {userGroup} | {shortInstitute}
          </p>
        </div>
      </div>
      
      <div className="tab-content">
        {activeTab === 'notifications' && (
          <div className="notifications-tab">
            <div className="no-content">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="#6c757d">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
              <h3>Новых уведомлений нет</h3>
              <p>Здесь будут появляться важные уведомления и обновления</p>
            </div>
          </div>
        )}

        {activeTab === 'points' && (
          <div className="points-tab">
            <div className="points-card">
              <div className="points-header">
                <div className="points-title-section">
                  <h3>Мои баллы</h3>
                  <div className="user-level">
                    Уровень {userLevel?.level || 2}
                  </div>
                </div>
                <div className="points-total">
                  {userLevel?.points || 125} баллов
                </div>
              </div>
              
              <div className="points-details">
                <div className="points-item">
                  <span className="points-label">Активность на мероприятиях</span>
                  <span className="points-value">
                    +{userLevel?.activity_points || 85} баллов
                  </span>
                </div>
                <div className="points-item">
                  <span className="points-label">Бонус</span>
                  <span className="points-value">
                    +{userLevel?.bonus_points || 40} баллов
                  </span>
                </div>
                <div className="points-item total">
                  <span className="points-label">Итого</span>
                  <span className="points-value">
                    {userLevel?.points || 125} баллов
                  </span>
                </div>
              </div>
              
              <div className="points-progress">
                <div className="level-info">
                  <span className="level-current">Уровень {userLevel?.level || 2}</span>
                  <span className="level-next">
                    Уровень {(userLevel?.level || 2) + 1}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${userLevel?.progress || 50}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  До следующего уровня: {userLevel?.points_to_next_level || 75} баллов
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-tab">
            <div className="achievements-grid">
              {achievementsData.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`achievement-card ${!achievement.achieved ? 'locked' : ''}`}
                >
                  <div className="achievement-icon">
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
          <div className="orders-tab">
            {displayOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-left">
                  <div className="order-image">
                    <img src={order.image || cap} alt={order.product} />
                  </div>
                  <div className="order-info">
                    <h3 className="product-name">{order.product}</h3>
                    <p className="product-description">{order.description}</p>
                    <div className="product-price-profile">{order.price}</div>
                  </div>
                </div>
                
                <div className="order-right">
                  <div className="order-status">
                    <span className={`status-badge ${
                      order.status === 'Доставлен' ? 'status-delivered' : 'status-work'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-datetime">
                    <div className="datetime-item">
                      <span className="datetime-label">Время:</span>
                      <span className="datetime-value">{order.time}</span>
                    </div>
                    <div className="datetime-item">
                      <span className="datetime-label">Дата:</span>
                      <span className="datetime-value">{order.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'statictick' && (
          <div className="statictick-tab">
            <div className="stats-container">
              {/* Заголовок статистики */}
              <div className="stats-header">
                <h2>Моя статистика</h2>
                <p>Достижения и участие в турнирах</p>
              </div>

              {/* Сетка статистики */}
              <div className="stats-grid">
                {/* Участие в турнирах */}
                <div className="stat-card-profile">
                  <div className="stat-icon tournaments">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
                    </svg>
                  </div>
                  <div className="stat-value">24</div>
                  <div className="stat-label">Турниров</div>
                </div>

                {/* Первые места */}
                <div className="stat-card-profile">
                  <div className="stat-icon first">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z"/>
                    </svg>
                  </div>
                  <div className="stat-value">8</div>
                  <div className="stat-label">1-х мест</div>
                </div>

                {/* Вторые места */}
                <div className="stat-card-profile">
                  <div className="stat-icon second">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z"/>
                    </svg>
                  </div>
                  <div className="stat-value">6</div>
                  <div className="stat-label">2-х мест</div>
                </div>

                {/* Третьи места */}
                <div className="stat-card-profile">
                  <div className="stat-icon third">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z"/>
                    </svg>
                  </div>
                  <div className="stat-value">4</div>
                  <div className="stat-label">3-х мест</div>
                </div>

                {/* Болельщик - на всю ширину */}
                <div className="stat-card-profile fan-card">
                  <div className="stat-icon fan">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">15</div>
                    <div className="stat-label">Раз был болельщиком</div>
                  </div>
                </div>

                {/* Прогресс побед */}
                <div className="achievement-bar">
                  <div className="achievement-title">
                    <span>🏆 Процент побед</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '75%'}}></div>
                  </div>
                  <div className="achievement-stats">
                    <span>🥇 {8} первых</span>
                    <span>🥈 {6} вторых</span>
                    <span>🥉 {4} третьих</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;