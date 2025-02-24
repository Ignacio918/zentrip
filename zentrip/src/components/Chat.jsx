import React, { useState, useEffect, useRef } from "react";
import "../styles/Chat.css";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import iconSend from "../assets/icons/icon-send.svg";
import iconSparkle from "../assets/icons/icon-Sparkle.svg";
import iconAI from "../assets/icons/icon-Sparkle.svg";
import generateItinerary from "../cohereClient";

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

/* --- MOVING BORDER --- */
const MovingBorder = ({ children, duration = 5000, rx, ry, ...otherProps }) => {
  const pathRef = useRef(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(progress, (val) =>
    pathRef.current?.getPointAtLength(val).x
  );
  const y = useTransform(progress, (val) =>
    pathRef.current?.getPointAtLength(val).y
  );

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
        <rect fill="none" width="100%" height="100%" rx={rx} ry={ry} ref={pathRef} />
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

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const chipsRef = useRef(null);
  const chatWrapperRef = useRef(null);

  // Medimos el tamaño real del contenedor (.chat-wrapper)
  const [wrapperSize, setWrapperSize] = useState({ width: 720, height: 158 });
  useEffect(() => {
    if (chatWrapperRef.current) {
      const rect = chatWrapperRef.current.getBoundingClientRect();
      setWrapperSize({ width: rect.width, height: rect.height });
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chips = [
    "5 días por Escocia",
    "Una semana por Roma",
    "Una escapada romántica en París",
    "Tour por los castillos de Alemania",
    "Aventura en los Alpes Suizos",
    "Ruta del vino por la Toscana",
    "Islas griegas en velero",
    "Auroras boreales en Islandia",
    "Safari en Kenia y Tanzania",
    "Templos de Angkor en Camboya",
  ];

  // Scroll automático de chips
  const [scrollX, setScrollX] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (chipsRef.current) {
        const maxScroll = chipsRef.current.scrollWidth - chipsRef.current.clientWidth;
        setScrollX((prev) => (prev >= maxScroll ? 0 : prev + 1));
      }
    }, 50);
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    if (chipsRef.current) {
      chipsRef.current.scrollLeft = scrollX;
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
    if (message.trim() !== "") {
      setMessages((prev) => [...prev, { text: message, sender: "user" }]);
      setInputValue("");
      setIsTyping(true);
      setIsExpanded(true);
      try {
        const response = await generateItinerary(message);
        setIsTyping(false);
        setMessages((prev) => [...prev, { text: response, sender: "ai" }]);
      } catch (error) {
        console.error("Error al obtener respuesta:", error);
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            text: "Lo siento, hubo un error al procesar tu mensaje. ¿Podrías intentarlo de nuevo?",
            sender: "ai",
          },
        ]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Función para redirigir a la página de registro
  const handleContinue = () => {
    window.location.href = "/registro";
  };

  if (isExpanded) {
    return (
      <div className="chat-expanded">
        <div className="chat-header">
          <img src={iconSparkle} alt="Sparkle Icon" className="icon-sparkle" />
          zentrip: Tu viaje empieza acá
        </div>
        <div className="chat-divider" />
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === "user" ? "user-message" : "ai-message"}`}
            >
              {msg.sender === "ai" && (
                <div className="message-icon">
                  <img src={iconAI} alt="AI Icon" className="icon-ai" />
                </div>
              )}
              <div className="message-content">
                <div className="message-text" dangerouslySetInnerHTML={{ __html: msg.text }} />
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
          {/* Mensaje final de la IA y botón para continuar aparecen a partir del octavo mensaje */}
          {messages.length >= 8 && (
            <>
              <div className="chat-message ai-message">
                <div className="message-content">
                  <div className="message-text" dangerouslySetInnerHTML={{ __html: `
                    <div class="message-title">¡Tu viaje está tomando forma!</div>
                    <div class="message-text">
                      <p>¡Genial, ya empezamos a planear algo especial! Seguí en el dashboard para:</p>
                      <div class="message-list-item">Perfeccionar tu itinerario a tu medida.</div>
                      <div class="message-list-item">Sumar más ideas o detalles prácticos.</div>
                      <div class="message-list-item">¡Hacer que este viaje sea inolvidable!</div>
                      <p>Dale un toque final haciendo clic abajo.</p>
                    </div>
                  ` }} />
                </div>
              </div>
              <div className="continue-itinerary">
                <button onClick={handleContinue} className="continue-button">
                  Continuar mi itinerario
                </button>
              </div>
            </>
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
            disabled={messages.length >= 8}
            className="flex-1 border-none outline-none bg-transparent text-gray-700 text-base font-sans px-3"
          />
          <button
            className="send-button"
            onClick={() => handleSendMessage()}
            disabled={messages.length >= 8}
          >
            <img src={iconSend} alt="Send Icon" className="icon-send" />
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
          <textarea
            className="chat-textarea"
            placeholder="¿A dónde viajamos?"
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
      <div className="chips-container" ref={chipsRef}>
        <div className="chips-scroll">
          {chips.concat(chips).map((chip, index) => (
            <button key={index} className="chip" onClick={() => handleChipClick(chip)}>
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;