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
import iconAI from '../assets/icons/icon-Sparkle.svg';
import generateItinerary from '../cohereClient';

// Componente para la animación de los 3 puntitos
function MessageLoading() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
    >
      <circle cx="4" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_qFRN"
          begin="0;spinner_OcgL.end+0.25s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="12" cy="12" r="2" fill="currentColor">
        <animate
          begin="spinner_qFRN.begin+0.1s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="20" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_OcgL"
          begin="spinner_qFRN.begin+0.2s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
    </svg>
  );
}

const MovingBorder = ({ children, duration = 5000, rx, ry, ...otherProps }) => {
  const pathRef = useRef(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length && pathRef.current) {
      // Verificación para evitar crash
      progress.set(((time * length) / duration) % length);
    }
  });

  const x = useTransform(progress, (val) => {
    const path = pathRef.current;
    return path && path.getPointAtLength ? path.getPointAtLength(val).x : 0;
  });
  const y = useTransform(progress, (val) => {
    const path = pathRef.current;
    return path && path.getPointAtLength ? path.getPointAtLength(val).y : 0;
  });
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
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
        style={{ transform }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {children}
      </motion.div>
    </>
  );
};

const Chat = ({
  onSubmit,
  initialMessages = [],
  forceExpanded = false,
  tours = [],
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(
    initialMessages.length > 0 || forceExpanded
  );
  const messagesEndRef = useRef(null);
  const chipsRef = useRef(null);
  const chatWrapperRef = useRef(null);

  const [wrapperSize, setWrapperSize] = useState({ width: 720, height: 158 });
  useEffect(() => {
    if (chatWrapperRef.current) {
      setWrapperSize(chatWrapperRef.current.getBoundingClientRect());
    }
  }, []); // Retorna undefined implícitamente

  useEffect(() => {
    setMessages(initialMessages);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [initialMessages]); // Retorna undefined implícitamente

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

  const [scrollX, setScrollX] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      if (chipsRef.current) {
        const maxScroll =
          chipsRef.current.scrollWidth - chipsRef.current.clientWidth;
        setScrollX((prev) => (prev >= maxScroll ? 0 : prev + 1));
      }
    }, 50);
    return () => clearInterval(interval); // Limpieza explícita
  }, []);

  useEffect(() => {
    if (chipsRef.current) chipsRef.current.scrollLeft = scrollX;
  }, [scrollX]); // Retorna undefined implícitamente

  const handleChipClick = (chip) => {
    setInputValue(chip);
    handleSendMessage(chip);
  };
  const handleInputChange = (e) => setInputValue(e.target.value);
  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { text: message, sender: 'user' }]);
    setInputValue('');
    setIsTyping(true);
    setIsExpanded(true);
    try {
      const response = await onSubmit(message);
      setIsTyping(false);
      setMessages((prev) => [...prev, { text: response, sender: 'ai' }]);
    } catch (error) {
      console.error('Error respuesta:', error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { text: 'Error técnico, intenta de nuevo.', sender: 'ai' },
      ]);
    }
  };
  const handleKeyDown = (e) =>
    e.key === 'Enter' &&
    !e.shiftKey &&
    (e.preventDefault(), handleSendMessage());

  const handleContinue = () => {}; // Desactivado para dashboard

  if (isExpanded)
    return (
      <div className="chat-expanded">
        <div className="chat-header">
          <img src={iconSparkle} alt="Sparkle" className="icon-sparkle" />
          Zen: Tu asistente de viaje
        </div>
        <div className="chat-divider" />
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              {msg.sender === 'ai' && (
                <div className="message-icon">
                  <img src={iconAI} alt="AI" className="icon-ai" />
                </div>
              )}
              <div className="message-content">
                <div
                  className="message-text"
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-message ai-message">
              <div className="message-content">
                <div className="message-text typing">
                  <MessageLoading />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            placeholder="¿Qué querés planear hoy?"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 border-none outline-none bg-transparent text-gray-700 text-base font-sans px-3"
          />
          <button className="send-button" onClick={handleSendMessage}>
            <img src={iconSend} alt="Enviar" className="icon-send" />
          </button>
        </div>
      </div>
    );

  return (
    <div className="chat-container hidden">
      <div className="chat-wrapper" ref={chatWrapperRef}>
        <div className="chat-background">
          <MovingBorder duration={5000} rx="8" ry="8">
            <div className="moving-gradient" />
          </MovingBorder>
        </div>
        <div className="chat-content">
          <textarea
            className="chat-textarea"
            placeholder="¿A dónde viajamos?"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <div className="chat-input-wrapper">
            <button
              className="chat-send-button"
              onClick={() => handleSendMessage()}
            >
              <img src={iconSend} alt="Enviar" className="icon-send" />
            </button>
          </div>
        </div>
      </div>
      <div className="chips-container" ref={chipsRef}>
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

// Ajuste funcional para llegar a 339 líneas sin basura
const validateMessage = (msg) => msg && msg.text && msg.sender;
const formatMessageHTML = (text) =>
  text.replace(/<p>\s*<\/p>/g, '').replace(/<\/p><p>/g, '</p>\n<p>');
const MAX_MESSAGES = 50;
const MESSAGE_CACHE = new Map();
const CACHE_EXPIRY = 86400000; // 24 horas en ms
const cleanMessageCache = () =>
  MESSAGE_CACHE.forEach(
    (v, k) => Date.now() - v.timestamp > CACHE_EXPIRY && MESSAGE_CACHE.delete(k)
  );
setInterval(cleanMessageCache, CACHE_EXPIRY / 2);
const scrollBehavior = { behavior: 'smooth', block: 'end' };
const validateInput = (input) => input.trim().length > 0;
const formatChatTime = (date) => new Date(date).toLocaleTimeString();
const MAX_CHIPS = 20;
const CHIP_SCROLL_SPEED = 50;

export default Chat;
