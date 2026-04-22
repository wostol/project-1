import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
// 🔹 Импортируем только экспортированные хуки — они возвращают уже нормализованные данные
import useEventStore, { useEvents, useEventLoading } from '../Events/eventStore';
import './Footer.css';
import logo from './lion.png';
import VK from './VK.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // 🔹 Получаем НОРМАЛИЗОВАННЫЕ мероприятия и статус загрузки через экспортированные хуки
  const events = useEvents();           // ← state.events (уже после normalizeEvent)
  const loading = useEventLoading();    // ← state.loading
  const fetchEvents = useEventStore((state) => state.fetchEvents);

  // 🔹 Загружаем список, если он ещё пуст (хуки гарантируют реактивность)
  useEffect(() => {
    if (events.length === 0 && !loading) {
      fetchEvents(); // ← после выполнения events в сторе будут уже нормализованы
    }
  }, [events.length, loading, fetchEvents]);

  // 🔹 Берём 3 последних мероприятия (сортировка по startDate ↓)
  const recentEvents = useMemo(() => {
    if (!events?.length) return [];
    return [...events]
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .slice(0, 3);
  }, [events]);

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
              {loading && events.length === 0 ? (
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
                <a href="/events/ski-marathon" className="footer-nav-link">
                  Как это работает
                </a>
              </li>
              <li>
                <a href="/events/basketball" className="footer-nav-link">
                  Команда
                </a>
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
                <a href="tel:+7xxxxxx-xx-xx" className="contact-link-footer">
                  +7 (xxxx) xx-xx-xx
                </a>
              </li>
              <li className="contact-item">
                <span className="contact-label-footer">Пресс-служба</span>
                <a href="tel:+7xxxxxx-xx-xx" className="contact-link-footer">
                  +7 (xxxx) xx-xx-xx
                </a>
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