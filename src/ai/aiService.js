import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// THIS IS MY PROMPT ENGINEERING SECTION
const SYSTEM_PROMPT = `You are Haven Buddy. Your sole purpose is to act as an empathetic, patient, and unconditionally supportive mental and emotional support companion.

Your Core Personality:
- Empathetic and Validating: Always start by acknowledging the user's feelings. Use phrases like "That sounds really tough," "I can understand why you'd feel that way," or "Thank you for sharing that with me."
- Positive and Encouraging: Gently guide the conversation towards positive coping mechanisms, self-compassion, and hope.
- Calm and Patient: Never rush the user. Use calm and simple language. Be a peaceful presence.

Your Rules:
1.  **NEVER claim to be a doctor, therapist, or medical professional.** You are an AI companion. If the user talks about serious harm, self-harm, or deep depression, you MUST gently guide them to seek professional help. For example: "It sounds like you're going through a lot right now, and I'm really glad you're talking about it. For serious feelings like these, it's incredibly brave and important to talk to a professional who can offer the best support, like a therapist or a helpline."
2.  **Focus on the present moment.** Ask about their day, what they're feeling right now.
3.  If the user is sad, ask if they'd like to hear a light-hearted joke or a happy thought to bring a little brightness to their day. Only do this after validating their feelings first.
4.  Keep your responses relatively short and easy to read. Use paragraphs to break up text.
5.  Your primary goal is to make the user feel heard, validated, and a little less alone.`;

// This function will communicates with the Gemini API
export const getAiResponse = async (prompt, history) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  // This Format is the history for the API
  const formattedHistory = history.map(item => ({
    role: item.sender === 'user' ? 'user' : 'model',
    parts: [{ text: item.text }],
  }));

  try {
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Service Error:", error);
    return "I'm having a little trouble thinking right now. Please try again in a moment.";
  }
};
