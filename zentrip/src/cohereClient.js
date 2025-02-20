import { CohereClient } from "cohere-ai";

const client = new CohereClient({ token: import.meta.env.VITE_COHERE_API_KEY });

const generateItinerary = async (message) => {
  try {
    const response = await client.chat({
      message: message,
      model: "command-r7b-12-2024",
      preamble: `You are a travel planning assistant for the ZenTrip platform. 
                 Your goal is to generate detailed travel itineraries based on the user's request. 
                 Only generate a travel itinerary if the user explicitly provides travel details 
                 (e.g., destinations, duration, preferences). 
                 If the user sends a greeting or an unrelated message, respond accordingly in a friendly and professional manner.
                 Detect the user's language and respond in the same language.`,
      temperature: 0.7,
      maxTokens: 500,
      k: 40,
      p: 0.9,
      frequencyPenalty: 0.2,
      presencePenalty: 0.3,
    });

    if (response.text) {
      return response.text;
    } else {
      throw new Error("Invalid response from Cohere");
    }
  } catch (error) {
    console.error("❌ ERROR generando itinerario:", error);
    return "Lo siento, hubo un problema generando tu itinerario. Intenta nuevamente.";
  }
};

export default generateItinerary;
