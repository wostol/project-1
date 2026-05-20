import React from 'react';
import styles from './ProfileTabs.module.css';

const PointsTab = ({ totalPoints, currentLevel, allLevels }) => {
  // Вспомогательные функции для работы с уровнями
  const getNextLevelMinPoints = () => {
    const nextLevel = allLevels.find(level => level.min_points > totalPoints);
    return nextLevel ? nextLevel.min_points : totalPoints + 100;
  };

  const getPointsToNextLevel = () => {
    const nextLevelMin = getNextLevelMinPoints();
    return Math.max(0, nextLevelMin - totalPoints);
  };

  const getProgressPercentage = () => {
    const prevLevelMin = currentLevel?.min_points || 0;
    const nextLevelMin = getNextLevelMinPoints();
    const range = nextLevelMin - prevLevelMin;
    if (range <= 0) return 100;
    const progress = ((totalPoints - prevLevelMin) / range) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <div className={styles.pointsTab}>
      {/* Карточка баллов */}
      <div className={styles.pointsCard}>
        <div className={styles.pointsHeader}>
          <div className={styles.pointsTitleSection}>
            <h3>Мои баллы</h3>
          </div>
          <div className={styles.pointsTotal}>
            {totalPoints}
            <span>баллов</span>
          </div>
        </div>

        <div className={styles.pointsDetails}>
          <div className={`${styles.pointsItem} ${styles.total}`}>
            <span className={styles.pointsLabel}>Итого</span>
            <span className={styles.pointsValue}>
              {totalPoints} баллов
            </span>
          </div>
        </div>
      </div>

      {/* Карточка прогресса уровня */}
      <div className={styles.levelProgressCard}>
        <div className={styles.levelProgressHeader}>
          <div className={styles.levelInfoLeft}>
            <div className={styles.levelCircle}>{currentLevel?.id || 1}</div>
            <div>
              <h4 className={styles.levelName}>{currentLevel?.name || 'Новичок'}</h4>
              <p className={styles.levelRange}>{currentLevel?.min_points || 0} — {getNextLevelMinPoints() - 1} баллов</p>
            </div>
          </div>
          <div className={styles.levelInfoRight}>
            <div className={styles.levelNextLabel}>
              <svg viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z' />
              </svg>
              Уровень {currentLevel?.id + 1 || 2}
            </div>
            <p className={styles.levelNextValue}>от {getNextLevelMinPoints()} баллов</p>
          </div>
        </div>

        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${getProgressPercentage()}%`
              }}
            />
          </div>
          <div className={styles.progressText}>
            <span className={styles.progressTextLeft}>
              До следующего уровня:{' '}
              {getPointsToNextLevel()} баллов
            </span>
            <span className={styles.progressTextRight}>
              {totalPoints} / {getNextLevelMinPoints()}
            </span>
          </div>
        </div>
      </div>

      {/* Нижние карточки */}
      <div className={styles.pointsInfoGrid}>
        {/* Как достичь следующего уровня */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <div className={styles.infoCardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h4 className={styles.infoCardTitle}>
              Как достичь следующего уровня
            </h4>
          </div>
          <p className={styles.infoCardContent}>
            Наберите <strong>200 баллов</strong>, участвуя в мероприятиях
            и выполняя специальные задания. Каждый балл приближает вас к
            новым привилегиям.
          </p>
        </div>

        {/* Привилегии уровня 3 */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <div
              className={styles.infoCardIcon}
              style={{
                background: 'linear-gradient(135deg, #28a745, #20c997)'
              }}
            >
              <svg viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z' />
              </svg>
            </div>
            <h4 className={styles.infoCardTitle}>Привилегии уровня 3</h4>
          </div>
          <ul className={styles.privilegesList}>
            <li>
              <span className={styles.privilegeCheck}></span>
              Доступ к эксклюзивным мероприятиям
            </li>
            <li>
              <span className={styles.privilegeCheck}></span>
              Приоритетная запись на события
            </li>
            <li>
              <span className={styles.privilegeCheck}></span>
              Уникальный значок профиля
            </li>
            <li>
              <span className={styles.privilegeCheck}></span>
              Персональные рекомендации
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PointsTab;