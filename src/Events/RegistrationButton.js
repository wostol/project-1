import React, { useState } from 'react';
import './RegistrationButton.css'; // или ваш файл со стилями

const RegistrationButton = ({ 
  registrationType, 
  canRegisterAsParticipant, 
  canRegisterAsSpectator,
  onRegister 
}) => {
  const [buttonState, setButtonState] = useState('ready'); // ready, loading, complete
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState(null);

  const isDisabled = (registrationType === 'participant' && !canRegisterAsParticipant) ||
                     (registrationType === 'spectator' && !canRegisterAsSpectator);

  const getButtonText = () => {
    if (registrationType === 'participant') {
      return canRegisterAsParticipant ? 'Записаться как участник' : 'Мест нет';
    }
    return canRegisterAsSpectator ? 'Записаться как болельщик' : 'Мест нет';
  };

  const handleClick = async () => {
    if (isDisabled) return;
    
    setButtonState('loading');
    setError(null);
    
    try {
      // Имитация асинхронного запроса
      await onRegister();
      
      setButtonState('complete');
      setRegistrationSuccess(true);
      
      // Через 2 секунды возвращаем кнопку в исходное состояние
      setTimeout(() => {
        setButtonState('ready');
        setRegistrationSuccess(false);
      }, 2000);
      
    } catch (err) {
      setButtonState('ready');
      setError(err.message);
    }
  };

  return (
    <>
      <button 
        className={`register-btn ${buttonState}`}
        onClick={handleClick}
        disabled={isDisabled || buttonState !== 'ready'}
      >
        {/* Сообщение отправки */}
        <div className="message submitMessage">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 12.2">
            <polyline stroke="currentColor" points="2,7.1 6.5,11.1 11,7.1 "/>
            <line stroke="currentColor" x1="6.5" y1="1.2" x2="6.5" y2="10.3"/>
          </svg>
          <span className="button-text">
            {getButtonText().split('').map((char, index) => (
              <span 
                key={index} 
                style={{ '--d': `${index * 0.02}s`, '--dr': `${(getButtonText().length - index) * 0.02}s` }}
              >
                {char}
              </span>
            ))}
          </span>
        </div>
        
        {/* Сообщение загрузки */}
        <div className="message loadingMessage">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 17">
            <circle className="loadingCircle" cx="2.2" cy="10" r="1.6"/>
            <circle className="loadingCircle" cx="9.5" cy="10" r="1.6"/>
            <circle className="loadingCircle" cx="16.8" cy="10" r="1.6"/>
          </svg>
        </div>
        
        {/* Сообщение успеха */}
        <div className="message successMessage">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 11">
            <polyline stroke="currentColor" points="1.4,5.8 5.1,9.5 11.6,2.1 "/>
          </svg>
          <span className="button-text">
            <span>Успешно!</span>
          </span>
        </div>
      </button>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {registrationSuccess && buttonState === 'complete' && (
        <div className="success-message">
          Регистрация прошла успешно!
        </div>
      )}
    </>
  );
};

export default RegistrationButton;