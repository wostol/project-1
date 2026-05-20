import React from 'react';
import styles from './ProfileTabs.module.css';

const StatisticsTab = () => {
  return (
    <div className={styles.statisticsTab}>
      {/* Основные показатели */}
      <div className={styles.statsOverview}>
        <div className={styles.statCardModern}>
          <div className={`${styles.statCardIcon} ${styles.tournaments}`}>
            <svg width='32' height='32' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z'/>
            </svg>
          </div>
          <div className={styles.statCardContent}>
            <div className={styles.statValueLarge}>24</div>
            <div className={styles.statLabelMedium}>Участий в мероприятиях</div>
          </div>
        </div>

        <div className={styles.statCardModern}>
          <div className={`${styles.statCardIcon} ${styles.points}`}>
            <svg width='32' height='32' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z'/>
            </svg>
          </div>
          <div className={styles.statCardContent}>
            <div className={styles.statValueLarge}>125</div>
            <div className={styles.statLabelMedium}>Всего баллов</div>
          </div>
        </div>

        <div className={styles.statCardModern}>
          <div className={`${styles.statCardIcon} ${styles.level}`}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <div className={styles.statCardContent}>
            <div className={styles.statValueLarge}>2</div>
            <div className={styles.statLabelMedium}>Текущий уровень</div>
          </div>
        </div>
      </div>

      {/* Достижения по местам */}
      <div className={styles.statsAchievementsGrid}>
        <div className={`${styles.achievementPlaceCard} ${styles.first}`}>
          <div className={styles.placeIcon}>🥇</div>
          <div className={styles.placeValue}>8</div>
          <div className={styles.placeLabel}>Первых мест</div>
          <div className={styles.placePercentage}>33%</div>
        </div>

        <div className={`${styles.achievementPlaceCard} ${styles.second}`}>
          <div className={styles.placeIcon}>🥈</div>
          <div className={styles.placeValue}>6</div>
          <div className={styles.placeLabel}>Вторых мест</div>
          <div className={styles.placePercentage}>25%</div>
        </div>

        <div className={`${styles.achievementPlaceCard} ${styles.third}`}>
          <div className={styles.placeIcon}>🥉</div>
          <div className={styles.placeValue}>4</div>
          <div className={styles.placeLabel}>Третьих мест</div>
          <div className={styles.placePercentage}>17%</div>
        </div>
      </div>

      {/* История мероприятий */}
      <div className={styles.statsEventsHistory}>
        <h3 className={styles.historyTitle}>История мероприятий</h3>
        <div className={styles.eventsHistoryList}>
          <div className={styles.eventHistoryItem}>
            <div className={styles.eventHistoryDate}>
              <div className={styles.eventDay}>15</div>
              <div className={styles.eventMonth}>Дек 2025</div>
            </div>
            <div className={styles.eventHistoryInfo}>
              <h4 className={styles.eventHistoryName}>Гандбольный турнир</h4>
              <p className={styles.eventHistoryRole}>Участник • 3 место 🥉</p>
              <p className={styles.eventHistoryPoints}>+150 баллов</p>
            </div>
            <div className={`${styles.eventHistoryBadge} ${styles.participant}`}>Участник</div>
          </div>

          <div className={styles.eventHistoryItem}>
            <div className={styles.eventHistoryDate}>
              <div className={styles.eventDay}>20</div>
              <div className={styles.eventMonth}>Ноя 2025</div>
            </div>
            <div className={styles.eventHistoryInfo}>
              <h4 className={styles.eventHistoryName}>Шахматный турнир</h4>
              <p className={styles.eventHistoryRole}>Участник • 1 место 🥇</p>
              <p className={styles.eventHistoryPoints}>+200 баллов</p>
            </div>
            <div className={`${styles.eventHistoryBadge} ${styles.winner}`}>Победитель</div>
          </div>

          <div className={styles.eventHistoryItem}>
            <div className={styles.eventHistoryDate}>
              <div className={styles.eventDay}>10</div>
              <div className={styles.eventMonth}>Ноя 2025</div>
            </div>
            <div className={styles.eventHistoryInfo}>
              <h4 className={styles.eventHistoryName}>Баскетбол 3x3</h4>
              <p className={styles.eventHistoryRole}>Болельщик</p>
              <p className={styles.eventHistoryPoints}>+30 баллов</p>
            </div>
            <div className={`${styles.eventHistoryBadge} ${styles.spectator}`}>Болельщик</div>
          </div>

          <div className={styles.eventHistoryItem}>
            <div className={styles.eventHistoryDate}>
              <div className={styles.eventDay}>05</div>
              <div className={styles.eventMonth}>Окт 2025</div>
            </div>
            <div className={styles.eventHistoryInfo}>
              <h4 className={styles.eventHistoryName}>Лыжный марафон</h4>
              <p className={styles.eventHistoryRole}>Участник • 2 место 🥈</p>
              <p className={styles.eventHistoryPoints}>+175 баллов</p>
            </div>
            <div className={`${styles.eventHistoryBadge} ${styles.participant}`}>Участник</div>
          </div>

          <div className={styles.eventHistoryItem}>
            <div className={styles.eventHistoryDate}>
              <div className={styles.eventDay}>28</div>
              <div className={styles.eventMonth}>Сен 2025</div>
            </div>
            <div className={styles.eventHistoryInfo}>
              <h4 className={styles.eventHistoryName}>Волейбольный турнир</h4>
              <p className={styles.eventHistoryRole}>Участник • 1 место 🥇</p>
              <p className={styles.eventHistoryPoints}>+180 баллов</p>
            </div>
            <div className={`${styles.eventHistoryBadge} ${styles.winner}`}>Победитель</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab;