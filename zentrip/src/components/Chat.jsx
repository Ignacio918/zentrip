import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import generateItinerary from '../cohereClient';
import iconSend from '../assets/icons/icon-send.svg';
import iconSparkle from '../assets/icons/icon-Sparkle.svg';
import '../styles/Chat.css';

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
  const [isPathReady, setIsPathReady] = useState(false);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (pathRef.current && pathRef.current.getTotalLength) {
        setIsPathReady(true);
      }
    });
    if (pathRef.current) observer.observe(pathRef.current);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((time) => {
    if (!isPathReady || !pathRef.current || !pathRef.current.getTotalLength)
      return;
    const length = pathRef.current.getTotalLength();
    if (length) progress.set(((time * length) / duration) % length);
  });

  const x = useTransform(progress, (val) => {
    if (!isPathReady || !pathRef.current || !pathRef.current.getPointAtLength)
      return 0;
    try {
      return pathRef.current.getPointAtLength(val)?.x || 0;
    } catch (error) {
      console.warn('Error en getPointAtLength:', error);
      return 0;
    }
  });
  const y = useTransform(progress, (val) => {
    if (!isPathReady || !pathRef.current || !pathRef.current.getPointAtLength)
      return 0;
    try {
      return pathRef.current.getPointAtLength(val)?.y || 0;
    } catch (error) {
      console.warn('Error en getPointAtLength:', error);
      return 0;
    }
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
      {isPathReady && (
        <motion.div
          style={{ transform }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {children}
        </motion.div>
      )}
    </>
  );
};

const ContinueButton = () => {
  const navigate = useNavigate();
  return (
    <button className="continue-button" onClick={() => navigate('/login')}>
      Continuar con mi aventura
    </button>
  );
};

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

const Chat = ({
  onSubmit = generateItinerary,
  initialMessages = [],
  forceExpanded = false,
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
  const navigate = useNavigate();

  // Movimiento de los chips
  const [scrollX, setScrollX] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      if (chipsRef.current) {
        const maxScroll =
          chipsRef.current.scrollWidth - chipsRef.current.clientWidth;
        setScrollX((prev) => (prev >= maxScroll ? 0 : prev + 1));
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chipsRef.current) chipsRef.current.scrollLeft = scrollX;
  }, [scrollX]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChipClick = (chip) => {
    if (isTyping || messages.length >= 16) return;
    console.log('Chip clicked:', chip);
    handleSendMessage(chip);
  };

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim() || isTyping || messages.length >= 16) return;
    console.log('Sending message:', message);

    const userMessage = {
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    if (!isExpanded) {
      setIsExpanded(true);
    }

    try {
      console.log('Calling onSubmit...');
      const context = messages
        .map(
          (msg) => `${msg.sender === 'user' ? 'Usuario' : 'Zen'}: ${msg.text}`
        )
        .join('\n');
      const response = await onSubmit(message, context);
      console.log('Response received:', response);
      const aiMessage = { text: response, sender: 'ai', timestamp: new Date() };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: 'Error técnico, intenta de nuevo.',
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } finally {
      console.log(
        'Setting isTyping to false. Message count:',
        messages.length + 1
      );
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping && messages.length < 16) {
      console.log('Enter pressed');
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isExpanded) {
    return (
      <div className="chat-expanded" style={{ height: '650px' }}>
        <div className="chat-header" style={{ fontSize: '22px' }}>
          <img src={iconSparkle} alt="Sparkle" className="icon-sparkle" />
          Zen: Tu asistente de viaje
        </div>
        <div className="chat-divider" />
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'} mb-4`}
            >
              {msg.sender === 'ai' && (
                <div className="message-icon">
                  <img src={iconSparkle} alt="AI" />
                </div>
              )}
              <div className="message-content">
                <div
                  className="message-text text-[#3B325B] leading-relaxed"
                  style={{ fontSize: '18px' }}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
                {msg.text.includes('[CTA]') && (
                  <div className="continue-itinerary">
                    <ContinueButton />
                  </div>
                )}
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
            placeholder="¿A dónde viajamos?"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isTyping || messages.length >= 16}
            className="flex-1 border-none outline-none bg-transparent text-gray-700 text-base font-sans px-3"
          />
          <button
            className="send-button"
            onClick={() => handleSendMessage()}
            disabled={isTyping || !inputValue.trim() || messages.length >= 16}
            style={{ position: 'absolute', right: '10px', bottom: '10px' }}
          >
            <img src={iconSend} alt="Enviar" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-wrapper" ref={chatWrapperRef}>
        <div className="chat-background">
          <MovingBorder duration={5000} rx="8" ry="8">
            <div className="moving-gradient" />
          </MovingBorder>
        </div>
        <div className="chat-content">
          {messages.length > 0 && (
            <div
              className="chat-messages"
              style={{ maxHeight: '100px', overflowY: 'auto' }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'} mb-4`}
                >
                  <div className="message-content">
                    {msg.components ? (
                      <div className="message-text text-[#3B325B] leading-relaxed">
                        {msg.components.map((component, i) =>
                          typeof component === 'string' ? (
                            <span
                              key={i}
                              dangerouslySetInnerHTML={{ __html: component }}
                            />
                          ) : (
                            component
                          )
                        )}
                      </div>
                    ) : (
                      <div
                        className="message-text text-[#3B325B] leading-relaxed"
                        style={{ fontSize: '18px' }}
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                      />
                    )}
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
            </div>
          )}
          <textarea
            className="chat-textarea"
            placeholder="¿A dónde viajamos?"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isTyping || messages.length >= 16}
          />
          <div className="chat-input-wrapper">
            <button
              className="chat-send-button"
              onClick={() => handleSendMessage()}
              disabled={isTyping || !inputValue.trim() || messages.length >= 16}
              style={{ position: 'absolute', right: '10px', bottom: '10px' }}
            >
              <img src={iconSend} alt="Enviar" />
            </button>
          </div>
        </div>
      </div>
      <div className="chips-container" ref={chipsRef}>
        <div className="chips-scroll">
          {chips.map((chip, index) => (
            <button
              key={index}
              className="chip"
              onClick={() => handleChipClick(chip)}
              disabled={isTyping || messages.length >= 16}
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
