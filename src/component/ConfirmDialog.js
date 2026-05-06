import { useEffect } from 'react';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  isLoading = false,
  showCancel = true 
}) => {
  // Блокировка прокрутки страницы при открытом диалоге
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add(styles.noScroll);
    } else {
      document.body.classList.remove(styles.noScroll);
    }

    // Очистка при размонтировании или закрытии
    return () => {
      document.body.classList.remove(styles.noScroll);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          {showCancel && (
            <button
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </button>
          )}
          <button
            className={`${styles.btn} ${styles.btnConfirm}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;