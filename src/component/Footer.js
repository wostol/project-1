import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../auth/apiClient';
import './Footer.css';
import logo from './lion.png';
import VK from './VK.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Локальное состояние для последних мероприятий (не зависит от основного store)
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загружаем 3 последних мероприятия независимо от основного store
  useEffect(() => {
    const fetchRecentEvents = async () => {
      if (recentEvents.length > 0 || loading) return;

      setLoading(true);
      try {
        const data = await apiRequest('/events', {
          method: 'GET',
        });
        const normalized = Array.isArray(data) ? data.map(event => ({
          id: event.uuid,
          title: event.title,
          startDate: event.startDate,
        })) : [];

        // Сортируем по дате начала (убывание) и берём первые 3
        const sorted = normalized
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
          .slice(0, 3);

        setRecentEvents(sorted);
      } catch (error) {
        console.error('Failed to fetch recent events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentEvents();
  }, [recentEvents.length, loading]);

  return (
    <footer className="footer">
      <div className="footer-logo-wrapper">
        <div className="footer-logo-container">
          <img src={logo} alt="Сибирские Львы" className="footer-logo" />
        </div>
      </div>

      <div className="footer-container">
        <div className="footer-nav-contacts">
          <div className="footer-nav">
            <h3 className="footer-nav-title">МЕРОПРИЯТИЯ</h3>
            <ul className="footer-nav-list">
              {loading && recentEvents.length === 0 ? (
                <li className="footer-nav-link">Загрузка...</li>
              ) : recentEvents.length > 0 ? (
                recentEvents.map(event => (
                  <li key={event.id}>
                    <Link
                      to={`/event/${event.id}`}
                      className="footer-nav-link"
                    >
                      {event.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="footer-nav-link">Мероприятий пока нет</li>
              )}
            </ul>
          </div>
          <div className="footer-nav">
            <h3 className="footer-nav-title">О нас</h3>
            <ul className="footer-nav-list">
              <li>
                <span className="footer-nav-link">Как это работает</span>
              </li>
              <li>
                <span className="footer-nav-link">Команда</span>
              </li>
            </ul>
          </div>

          <div className="footer-nav footer-nav-center">
          </div>
          {/* Личный кабинет */}
          <div className="footer-nav">
            <h3 className="footer-nav-title">ЛИЧНЫЙ КАБИНЕТ</h3>
            <ul className="footer-nav-list">
              <li>
                <a href="/profile?tab=points" className="footer-nav-link">
                  Мои баллы
                </a>
              </li>
              <li>
                <a href="/profile?tab=achievements" className="footer-nav-link">
                  Достижения
                </a>
              </li>
              <li>
                <a href="/profile?tab=statictick" className="footer-nav-link">
                  Статистика
                </a>
              </li>
            </ul>
          </div>

          {/* Контакты */}
       <div className="footer-nav">
            <h3 className="footer-nav-title">КОНТАКТЫ</h3>
            <ul className="footer-nav-list">
              <li className="contact-item">
                <span className="contact-label-footer">Руководитель</span>
                <span className="contact-link-footer">+7 (xxxx) xx-xx-xx</span>
              </li>
              <li className="contact-item">
                <span className="contact-label-footer">Пресс-служба</span>
                <span className="contact-link-footer">+7 (xxxx) xx-xx-xx</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Социальные сети */}
        <div className="footer-social">
          <a
            href="https://vk.com/sib_lions"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="ВКонтакте"
          >
            <img src={VK} alt="VK" className="social_img" />
          </a>
        </div>

        {/* Нижняя часть с копирайтом */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Национальный исследовательский Томский политехнический университет
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer