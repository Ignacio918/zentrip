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
                 7. Para títulos principales, usar el formato: ### Título
                 8. Para subtítulos usar el formato: ## Subtítulo
                 9. Usar viñetas con - para listar items`,
      temperature: 0.7,
      maxTokens: 1000,
      k: 40,
      p: 0.9,
    });

    if (response && response.text) {
      let finalResponse = response.text
        // Títulos principales: se convierten en un div con clases Tailwind
        .replace(
          /### (.*?)$/gm,
          '<div class="text-2xl font-semibold text-black mt-5 mb-4 border-l-4 pl-3 border-pink-600">$1</div>'
        )
        // Subtítulos
        .replace(
          /## (.*?)$/gm,
          '<div class="text-xl font-medium text-black mt-4 mb-2">$1</div>'
        )
        // Texto en negrita: mayor peso con Tailwind (font-extrabold)
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-black">$1</strong>')
        // Viñetas: utilizando utilidades de Tailwind para listas
        .replace(/^- (.*?)$/gm, '<div class="ml-5 list-disc">$1</div>')
        // Saltos de línea en párrafos
        .replace(/\n\n/g, '</p><p>')
        .replace(/^\s*(.+)$/gm, '<p>$1</p>');

      // Eliminar párrafos vacíos y duplicados
      finalResponse = finalResponse
        .replace(/<p>\s*<\/p>/g, '')
        .replace(/<\/p><p>/g, '</p>\n<p>');

      if (!finalResponse.includes('Zen - Tu Asistente de Viajes')) {
        finalResponse += '\n<div class="text-sm text-gray-500 italic mt-4">Zen - Tu Asistente de Viajes</div>';
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
      return `<div class="text-red-500 italic">Disculpa, estoy teniendo algunas dificultades técnicas. 
              Veo que estábamos conversando sobre tu viaje. 
              ¿Podrías reformular tu pregunta?</div>
              
              <div class="text-sm text-gray-500 italic mt-4">Zen - Tu Asistente de Viajes</div>`;
    }

    return `<div class="text-red-500 italic">Lo siento, estoy experimentando dificultades técnicas en este momento. 
            Por favor, intenta tu pregunta nuevamente en unos instantes.</div>
            
            <div class="text-sm text-gray-500 italic mt-4">Zen - Tu Asistente de Viajes</div>`;
  }
};

export default generateItinerary;
