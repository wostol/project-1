import React from 'react';
import styles from './ProfileTabs.module.css';

const AchievementsTab = ({ achievementsData, allLevels, totalPoints, currentLevel }) => {
  // Определяем статус для каждого уровня
  const getLevelStatus = (levelMinPoints) => {
    if (totalPoints >= levelMinPoints) {
      return 'completed';
    }
    return 'locked';
  };

  // Находим следующий уровень
  const getNextLevelMinPoints = () => {
    const nextLevel = allLevels.find(level => level.min_points > totalPoints);
    return nextLevel ? nextLevel.min_points : totalPoints + 100;
  };

  return (
    <div className={styles.achievementsTab}>
      {/* БЛОК УРОВНЕЙ */}
      <div className={styles.levelsSection}>
        <h3 className={styles.levelsTitle}>Все уровни</h3>
        <div className={styles.levelsList}>
          {allLevels.map(level => {
            const status = getLevelStatus(level.min_points);
            const isCurrent = currentLevel?.id === level.id;
            const pointsNeeded = level.min_points > totalPoints ? level.min_points - totalPoints : 0;

            // Определяем цвет для кружка уровня
            let circleBackground;
            if (status === 'completed') {
              circleBackground = `linear-gradient(135deg, ${level.color || '#003466'}, ${level.color || '#0056b3'})`;
            } else if (isCurrent) {
              circleBackground = `linear-gradient(135deg, #28a745, #20c997)`;
            } else {
              circleBackground = `linear-gradient(135deg, #e9ecef, #dee2e6)`;
            }

            return (
              <div
                key={level.id}
                className={`${styles.levelItem} ${styles[status]} ${isCurrent ? styles.current : ''}`}
              >
                <div
                  className={styles.levelCircle}
                  style={{ background: circleBackground }}
                >
                  {level.id}
                </div>
                <div className={styles.levelInfoBlock}>
                  <div className={styles.levelHeader}>
                    <h4 className={styles.levelName}>{level.name}</h4>
                    {status === 'completed' && (
                      <span className={`${styles.levelBadge} ${styles.completed}`}>
                        ПРОЙДЕН
                      </span>
                    )}
                    {isCurrent && (
                      <span className={`${styles.levelBadge} ${styles.current}`}>ТЕКУЩИЙ</span>
                    )}
                    {status === 'locked' && pointsNeeded > 0 && (
                      <span className={`${styles.levelBadge} ${styles.locked}`}>
                        {pointsNeeded} БАЛЛОВ
                      </span>
                    )}
                  </div>
                  <p className={styles.levelPoints}>от {level.min_points} баллов</p>
                  <p className={styles.levelDescription}>{level.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Сетка достижений */}
      <div className={styles.achievementsGrid}>
        {achievementsData.map(achievement => (
          <div
            key={achievement.id}
            className={`${styles.achievementCard} ${!achievement.achieved ? styles.locked : ''}`}
          >
            <div className={styles.achievementIcon}>
              {achievement.achieved ? achievement.icon : '🔒'}
            </div>
            <h4>{achievement.title}</h4>
            <p>{achievement.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsTab;