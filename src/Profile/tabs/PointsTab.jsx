import React from 'react';
import styles from './ProfileTabs.module.css';

// SVG иконки
const StarIcon = () => (
  <svg viewBox='0 0 24 24' fill='currentColor'>
    <path d='M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z' />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox='0 0 24 24' fill='currentColor'>
    <path d='M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z' />
  </svg>
);

const FireIcon = () => (
  <svg viewBox='0 0 24 24' fill='currentColor'>
    <path d='M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z' />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox='0 0 24 24' fill='currentColor'>
    <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' />
  </svg>
);

const SuccessIcon = () => (
  <svg viewBox='0 0 24 24' fill='currentColor'>
    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
  </svg>
);

const PointsTab = ({ totalPoints, currentLevel, allLevels, peBonusPoints = 10 }) => {
  // Вспомогательные функции для работы с уровнями
  const getNextLevel = () => {
    return allLevels.find(level => level.min_points > totalPoints);
  };

  const getPointsToNextLevel = () => {
    const nextLevel = getNextLevel();
    if (!nextLevel) return 0;
    return Math.max(0, nextLevel.min_points - totalPoints);
  };

  const getProgressPercentage = () => {
    const nextLevel = getNextLevel();
    if (!nextLevel) return 100;

    const prevLevelMin = currentLevel?.min_points || 0;
    const nextLevelMin = nextLevel.min_points;
    const range = nextLevelMin - prevLevelMin;

    if (range <= 0) return 100;
    const progress = ((totalPoints - prevLevelMin) / range) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const nextLevel = getNextLevel();
  const isMaxLevel = !nextLevel;
  const pointsNeeded = getPointsToNextLevel();

  // Получаем цвет и бонус текущего уровня
  const levelColor = currentLevel?.color || '#003466';
  const bonusPercent = currentLevel?.bonus_percent || 0;

  // Привилегии уровня (если есть в данных)
  const privileges = currentLevel?.privileges || [];

  return (
    <div className={styles.pointsTab}>
      {/* 1. КАРТОЧКА БАЛЛОВ */}
      <div className={styles.pointsCard}>
        <div className={styles.pointsHeader}>
          <div className={styles.pointsTitleSection}>
            <h3>Мои баллы</h3>
            <span
              className={styles.userLevel}
              style={{ background: `linear-gradient(135deg, ${levelColor}, ${levelColor}dd)` }}
            >
              {currentLevel?.name || 'Новичок'}
            </span>
          </div>
          <div className={styles.pointsTotal}>
            {totalPoints}
            <span>баллов</span>
          </div>
        </div>

        <div className={styles.pointsItem}>
          <span className={styles.pointsLabel}>
            <StarIcon />
            Итого баллов
          </span>
          <span className={styles.pointsValue}>{totalPoints}</span>
        </div>
      </div>

      {/* 2. ПРОГРЕСС УРОВНЯ */}
      <div className={styles.levelProgressCard}>
        <div className={styles.levelProgressHeader}>
          <div className={styles.levelInfoLeft}>
            <div
              className={styles.levelCircle}
              style={{ background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)` }}
            >
              {currentLevel?.id || 1}
            </div>
            <div>
              <h4
                className={styles.levelName}
                style={{ color: levelColor }}
              >
                {currentLevel?.name || 'Новичок'}
              </h4>
              <p className={styles.levelRange}>
                {currentLevel?.min_points || 0} — {isMaxLevel ? '∞' : `${nextLevel.min_points - 1}`} баллов
              </p>
            </div>
          </div>
          {!isMaxLevel && (
            <div className={styles.levelInfoRight}>
              <div className={styles.levelNextLabel}>
                <TrophyIcon />
                Уровень {currentLevel?.id + 1 || 2}
              </div>
              <p className={styles.levelNextValue}>от {nextLevel.min_points} баллов</p>
            </div>
          )}
        </div>

        {!isMaxLevel && (
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${getProgressPercentage()}%`,
                  background: `linear-gradient(90deg, ${levelColor}, ${levelColor}bb)`
                }}
              />
            </div>
            <div className={styles.progressText}>
              <span className={styles.progressTextLeft}>
                До следующего уровня: {pointsNeeded} баллов
              </span>
              <span className={styles.progressTextRight}>
                {totalPoints} / {nextLevel.min_points}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. СЕТКА КАРТОЧЕК */}
      <div className={styles.pointsInfoGrid}>
        {/* Как достичь следующего уровня */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <div
              className={styles.infoCardIcon}
              style={{ background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)` }}
            >
              <CheckIcon />
            </div>
            <h4 className={styles.infoCardTitle}>
              {isMaxLevel ? 'Максимальный уровень достигнут!' : 'Как достичь следующего уровня'}
            </h4>
          </div>
          <p className={styles.infoCardContent}>
            {isMaxLevel
              ? 'Поздравляем! Вы достигли максимального уровня и получаете все доступные привилегии.'
              : `Наберите ещё ${pointsNeeded} баллов, участвуя в мероприятиях спортклуба. Каждый балл приближает вас к новым привилегиям.`}
          </p>
        </div>

        {/* Привилегии уровня */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <div
              className={styles.infoCardIcon}
              style={{ background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)` }}
            >
              <StarIcon />
            </div>
            <h4 className={styles.infoCardTitle}>Привилегии уровня</h4>
          </div>
          <ul className={styles.privilegesList}>
            {privileges.length > 0 ? (
              privileges.map((privilege, index) => (
                <li key={index}>
                  <span
                    className={styles.privilegeCheck}
                    style={{ background: levelColor, color: levelColor }}
                  />
                  {privilege}
                </li>
              ))
            ) : (
              <>
                <li>
                  <span
                    className={styles.privilegeCheck}
                    style={{ background: levelColor, color: levelColor }}
                  />
                  Доступ к эксклюзивным мероприятиям
                </li>
                <li>
                  <span
                    className={styles.privilegeCheck}
                    style={{ background: levelColor, color: levelColor }}
                  />
                  Приоритетная запись на события
                </li>
                <li>
                  <span
                    className={styles.privilegeCheck}
                    style={{ background: levelColor, color: levelColor }}
                  />
                  Уникальный значок профиля
                </li>
              </>
            )}
            {bonusPercent > 0 && (
              <li>
                <span
                  className={styles.privilegeCheck}
                  style={{ background: levelColor, color: levelColor }}
                />
                Бонус {bonusPercent}% по физкультуре
              </li>
            )}
          </ul>
        </div>

        {/* 4. БОНУСЫ ПО ФИЗРЕ */}
        {/* <div className={`${styles.infoCard} ${styles.peCard}`} style={{ borderColor: `${levelColor}33`, gridColumn: '1 / -1' }}>
          <div className={styles.infoCardHeader}>
            <div
              className={styles.infoCardIcon}
              style={{ background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)` }}
            >
              <FireIcon />
            </div>
            <h4 className={styles.infoCardTitle} style={{ color: levelColor }}>
              Бонусы по физической культуре
            </h4>
          </div>

          <div className={styles.peContent}>
            <div className={styles.bonusRow}>
              <span
                className={styles.levelBadgeSmall}
                style={{ background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)` }}
              >
                {currentLevel?.name || 'Новичок'}
              </span>
              <span className={styles.bonusValue}>
                Бонус к регламентным баллам: <span className={styles.bonusPercent} style={{ color: levelColor }}>+{bonusPercent}%</span>
              </span>
            </div>

            <div className={styles.peHeroBlock}>
              <div>
                <div className={styles.peHeroLabel}>Накоплено бонусов по физре</div>
                <div className={styles.peHeroValue} style={{ color: levelColor }}>{peBonusPoints}</div>
                <div className={styles.peHeroUnit}>баллов</div>
              </div>
              <div className={styles.peHeroSide}>
                <div className={styles.peHeroSideItem}>
                  <SuccessIcon />
                  <span>Бонус рассчитан автоматически</span>
                </div>
                <div className={styles.peHeroSideItem}>
                  <SuccessIcon />
                  <span>Сохранён в истории начислений</span>
                </div>
              </div>
            </div>

            <div className={styles.peRegulationList}>
              <h5>Бонус начисляется за мероприятия:</h5>
              <ul>
                <li>
                  <span style={{ position: 'absolute', left: 0, top: 8, width: 6, height: 6, borderRadius: '50%', background: levelColor }}></span>
                  Посещение в качестве зрителя (п.1)
                </li>
                <li>Отдельные мероприятия уровня «Университет» (часть п.4)</li>
                <li>Топ-мероприятия университета (п.5)</li>
                <li>Капитан команды (п.6)</li>
                <li>Обладатель номинации (п.7)</li>
              </ul>
            </div>

            <p className={styles.peDisclaimer}>
              <strong>Важно:</strong> процент бонуса зависит от текущего уровня и фиксируется в момент начисления.
              При повышении уровня прошлые начисления не пересчитываются.
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default PointsTab;