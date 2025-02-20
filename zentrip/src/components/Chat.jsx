'use client';
import React, { useState, useEffect, useRef } from 'react';
import '../styles/Chat.css';
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import iconSend from '../assets/icons/icon-send.svg';
import iconSparkle from '../assets/icons/icon-Sparkle.svg';
import iconUser from '../assets/icons/icon-user.svg';
import iconAI from '../assets/icons/icon-Sparkle.svg';
import generateItinerary from '../cohereClient';

const MovingBorder = ({ children, duration = 2000, rx, ry, ...otherProps }) => {
  const pathRef = React.useRef();
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).x
  );
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).y
  );

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="moving-border-svg"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          transform,
        }}
        className="moving-border-motion"
      >
        {children}
      </motion.div>
    </>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const [scrollX, setScrollX] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const chips = [
    '5 días por Escocia',
    'Una semana por Roma',
    'Una escapada romántica en París',
    'Tour por los castillos de Alemania',
    'Aventura en los Alpes Suizos',
    'Ruta del vino por la Toscana',
    'Islas griegas en velero',
    'Auroras boreales en Islandia',
    'Safari en Kenia y Tanzania',
    'Templos de Angkor en Camboya',
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (containerRef.current) {
        const maxScroll =
          containerRef.current.scrollWidth - containerRef.current.clientWidth;
        setScrollX((prevScrollX) =>
          prevScrollX >= maxScroll ? 0 : prevScrollX + 1
        );
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollX;
    }
  }, [scrollX]);

  const handleChipClick = (chip) => {
    setInputValue(chip);
    handleSendMessage(chip);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async (message = inputValue) => {
    if (message.trim() !== '') {
      setMessages([...messages, { text: message, sender: 'user' }]);
      setInputValue('');
      setIsTyping(true);
      setIsExpanded(true);
      
      try {
        const response = await generateItinerary(message);
        setIsTyping(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: response,
            sender: 'ai',
          },
        ]);
      } catch (error) {
        console.error('Error al obtener respuesta:', error);
        setIsTyping(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Lo siento, hubo un error al procesar tu mensaje. ¿Podrías intentarlo de nuevo?",
            sender: 'ai',
          },
        ]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isExpanded) {
    return (
      <div className="chat-expanded">
        <div className="chat-header">
          <img src={iconSparkle} alt="Sparkle Icon" className="icon-sparkle" />
          zentrip AI
        </div>
        <div className="chat-divider" />
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              
              <div className="message-content">
                <div className="message-text">{msg.text}</div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-message ai-message">
              <div className="message-icon">
                <img src={iconAI} alt="AI Icon" className="icon-ai" />
              </div>
              <div className="message-content">
                <div className="message-text typing">Escribiendo...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            placeholder="Mensaje..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button className="send-button" onClick={() => handleSendMessage()}>
            <img src={iconSend} alt="Send Icon" className="icon-send" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-wrapper">
        <div className="chat-background">
          <MovingBorder duration={5000} rx="30%" ry="30%">
            <div className="moving-gradient" />
          </MovingBorder>
        </div>
        <div className="chat-content">
          <textarea
            className="chat-textarea"
            placeholder="Mensaje..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <div className="chat-input-wrapper">
            <button className="chat-send-button" onClick={() => handleSendMessage()}>
              <img src={iconSend} alt="Send Icon" className="icon-send" />
            </button>
          </div>
        </div>
      </div>
      <div className="chips-container" ref={containerRef}>
        <div className="chips-scroll">
          {chips.concat(chips).map((chip, index) => (
            <button
              key={index}
              className="chip"
              onClick={() => handleChipClick(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat; 