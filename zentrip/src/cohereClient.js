import { CohereClient } from 'cohere-ai';

const client = new CohereClient({
  token: import.meta.env.VITE_COHERE_API_KEY,
  timeout: 15000,
});

let currentConversation = {
  messages: [],
  lastUpdated: null,
};

const generateItinerary = async (message) => {
  try {
    currentConversation.messages.push({
      content: message,
      timestamp: new Date().toISOString(),
    });

    if (currentConversation.messages.length > 5) {
      currentConversation.messages = currentConversation.messages.slice(-5);
    }

    currentConversation.lastUpdated = new Date().toISOString();

    const response = await client.chat({
      message: message,
      model: 'command-r7b-12-2024',
      preamble: `Eres Zen, el asistente virtual especializado de ZenTrip. Eres experto en viajes y turismo
                 a nivel mundial. Tu conocimiento abarca todos los destinos, culturas y experiencias de viaje posibles.

                 CONTEXTO DE LA CONVERSACIÓN:
                 ${currentConversation.messages.map((m) => `- ${m.content}`).join('\n')}

                 REGLAS IMPORTANTES:
                 1. Mantén SIEMPRE el contexto de la conversación
                 2. Si el usuario pregunta sobre hospedaje, actividades, o cualquier aspecto del viaje,
                    usa el contexto de la conversación para dar respuestas específicas
                 3. Si ya has proporcionado información en mensajes anteriores, referénciala y expándela
                 4. SIEMPRE responde en el mismo idioma que usa el usuario
                 5. Da respuestas detalladas y específicas para el destino que se está discutiendo
                 6. Si ocurre un error, intenta mantener el contexto de la conversación
                 7. Para títulos importantes, usar el formato: ### Título
                 8. Usar viñetas con - para listar items`,
      temperature: 0.7,
      maxTokens: 1000,
      k: 40,
      p: 0.9,
    });

    if (response && response.text) {
      let finalResponse = response.text.replace(
        /### (.*?)$/gm,
        '<div class="message-title">$1</div>'
      );

      // Dar formato a las listas
      finalResponse = finalResponse.replace(
        /^\- (.*?)$/gm,
        '<div class="message-list-item">$1</div>'
      );

      if (!finalResponse.includes('Zen - Tu Asistente de Viajes')) {
        finalResponse += '\n\n<div class="message-signature">Zen - Tu Asistente de Viajes</div>';
      }
      
      return finalResponse;
    }

    throw new Error('No se pudo generar una respuesta válida');
  } catch (error) {
    console.error('❌ Error detallado:', {
      message: error.message,
      stack: error.stack,
      type: error.name,
    });

    const lastMessages = currentConversation.messages;
    if (lastMessages.length > 0) {
      return `<div class="message-error">Disculpa, estoy teniendo algunas dificultades técnicas. 
              Veo que estábamos conversando sobre tu viaje. 
              ¿Podrías reformular tu pregunta?</div>
              
              <div class="message-signature">Zen - Tu Asistente de Viajes</div>`;
    }

    return `<div class="message-error">Lo siento, estoy experimentando dificultades técnicas en este momento. 
            Por favor, intenta tu pregunta nuevamente en unos instantes.</div>
            
            <div class="message-signature">Zen - Tu Asistente de Viajes</div>`;
  }
};

export default generateItinerary;