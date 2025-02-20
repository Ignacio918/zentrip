import { CohereClient } from "cohere-ai";

const client = new CohereClient({ 
  token: import.meta.env.VITE_COHERE_API_KEY,
  timeout: 15000
});

// Estado de la conversación actual
let currentConversation = {
  messages: [],
  lastUpdated: null
};

const generateItinerary = async (message) => {
  try {
    // Agregar el mensaje actual al historial
    currentConversation.messages.push({
      content: message,
      timestamp: new Date().toISOString()
    });

    // Mantener solo los últimos 5 mensajes para contexto relevante
    if (currentConversation.messages.length > 5) {
      currentConversation.messages = currentConversation.messages.slice(-5);
    }

    currentConversation.lastUpdated = new Date().toISOString();

    const response = await client.chat({
      message: message,
      model: "command-r7b-12-2024",
      preamble: `Eres Zen, el asistente virtual especializado de ZenTrip. Eres experto en viajes y turismo
                 a nivel mundial. Tu conocimiento abarca todos los destinos, culturas y experiencias de viaje posibles.

                 CONTEXTO DE LA CONVERSACIÓN:
                 ${currentConversation.messages.map(m => `- ${m.content}`).join('\n')}

                 REGLAS IMPORTANTES:
                 1. Mantén SIEMPRE el contexto de la conversación
                 2. Si el usuario pregunta sobre hospedaje, actividades, o cualquier aspecto del viaje,
                    usa el contexto de la conversación para dar respuestas específicas
                 3. Si ya has proporcionado información en mensajes anteriores, referénciala y expándela
                 4. SIEMPRE responde en el mismo idioma que usa el usuario
                 5. Da respuestas detalladas y específicas para el destino que se está discutiendo
                 6. Si ocurre un error, intenta mantener el contexto de la conversación
                 7. Para títulos importantes, usar el formato: <h>Título</h>
                 8. Ejemplo: "<h>Atracciones Turísticas</h>" en lugar de "**Atracciones Turísticas**"`,
      temperature: 0.7,
      maxTokens: 1000,
      k: 40,
      p: 0.9
    });

    if (response && response.text) {
      // Formatear los títulos manteniendo todo el resto igual
      let finalResponse = response.text.replace(
        /<h>(.*?)<\/h>/g,
        '<span class="text-black font-archivo text-lg font-semibold leading-relaxed block mb-2">$1</span>'
      );
      if (!finalResponse.includes("Zen - Tu Asistente de Viajes")) {
        finalResponse += "\n\nZen - Tu Asistente de Viajes";
      }
      return finalResponse;
    }

    throw new Error('No se pudo generar una respuesta válida');

  } catch (error) {
    console.error("❌ Error detallado:", {
      message: error.message,
      stack: error.stack,
      type: error.name
    });

    // Intentar dar una respuesta contextual basada en la conversación actual
    const lastMessages = currentConversation.messages;
    if (lastMessages.length > 0) {
      return `Disculpa, estoy teniendo algunas dificultades técnicas. 
              Veo que estábamos conversando sobre tu viaje. 
              ¿Podrías reformular tu pregunta?

              Zen - Tu Asistente de Viajes`;
    }

    return `Lo siento, estoy experimentando dificultades técnicas en este momento. 
            Por favor, intenta tu pregunta nuevamente en unos instantes.

            Zen - Tu Asistente de Viajes`;
  }
};

export default generateItinerary;