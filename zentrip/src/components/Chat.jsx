import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { LucideSend } from 'lucide-react';
import generateItinerary from '../cohereClient';
import '../styles/Chat.css';

const Chat = ({
  forceExpanded = false,
  onSubmit = () => {},
  initialMessages = [],
  tours = [],
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(forceExpanded);
  const chatContainerRef = useRef(null);
  const [showTours, setShowTours] = useState(false);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    try {
      const context = messages
        .map((msg) => `${msg.sender}: ${msg.text}`)
        .join('\n');
      let response = await generateItinerary(inputMessage, context);

      if (inputMessage.toLowerCase().includes('tours')) {
        const destinationMatch = context.match(/([A-Za-z\s]+)(?=\s*[-,]|$)/i);
        if (destinationMatch) {
          const destination = destinationMatch[1].trim().toLowerCase();
          const destinationTours = tours.filter((t) =>
            t.destination?.toLowerCase().includes(destination)
          );
          if (destinationTours.length > 0) {
            response += `
              <h4 class="text-sm font-semibold mt-2 text-[#3B325B]">Tours en ${destination.charAt(0).toUpperCase() + destination.slice(1)}:</h4>
              <ul class="list-disc ml-5">${destinationTours
                .slice(0, 3)
                .map(
                  (t) =>
                    `<li>${t.name} - $${t.price || 'N/A'} - ${t.description || 'Detalles no disponibles'}</li>`
                )
                .join('')}</ul>`;
          } else {
            response += `<p class="text-sm text-gray-600">No hay tours disponibles para ${destination} en este momento.</p>`;
          }
        } else {
          response +=
            '<p class="text-sm text-gray-600">Por favor, especifica un destino para los tours.</p>';
        }
      }

      if (
        response.includes('Tu viaje está tomando forma') ||
        response.includes('Sigue en el dashboard')
      ) {
        response = response
          .replace(
            /¡Tu viaje está tomando forma!.*Sigue en el dashboard para:.*/s,
            ''
          )
          .trim();
      }

      const aiMessage = { text: response, sender: 'ai', timestamp: new Date() };
      setMessages((prev) => [...prev, aiMessage]);
      if (onSubmit) onSubmit(response);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Error al generar respuesta: ' + error.message,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTourToggle = () => {
    setShowTours(!showTours);
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className={`chat-container ${isExpanded ? 'expanded' : ''}`}>
      <div className="chat-header" onClick={handleToggleExpand}>
        <h3 className="chat-title">Habla con Zen</h3>
        <span className={`expand-icon ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>
      <div className="chat-body" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`chat-message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            custom={index}
          >
            <div
              className="message-content"
              dangerouslySetInnerHTML={{ __html: message.text }}
            />
            <span className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            className="chat-message ai-message"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="message-content">Pensando...</div>
          </motion.div>
        )}
      </div>
      <div className="chat-footer">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className="chat-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={isLoading}
          >
            <LucideSend size={20} />
          </button>
        </form>
        {tours.length > 0 && (
          <button onClick={handleTourToggle} className="tour-toggle-button">
            {showTours ? 'Ocultar Tours' : 'Mostrar Tours'}
          </button>
        )}
        {showTours && tours.length > 0 && (
          <div className="tour-list">
            <h4 className="tour-list-title">Tours Sugeridos:</h4>
            <ul className="tour-list-items">
              {tours.slice(0, 3).map((tour, index) => (
                <li key={index} className="tour-item">
                  {tour.name} - ${tour.price || 'N/A'} -{' '}
                  {tour.description || 'Sin detalles'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
