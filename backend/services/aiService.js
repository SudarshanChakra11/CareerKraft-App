import Groq from "groq-sdk";

// ===============================
// Groq Client
// ===============================
let groq = null;

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groq;
};

// ===============================
// AI Response Generator
// ===============================
export const generateAIResponse = async (messages) => {
  try {
    const chatHistory = messages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\n");

    const prompt = `
You are CareerKraft AI, an expert career mentor for engineering students.

Your responsibilities:
- Provide personalized career guidance.
- Help students choose suitable career paths.
- Generate structured learning roadmaps.
- Recommend practical projects and resources.
- Give concise, actionable, and easy-to-follow advice.

If the user requests a roadmap, use this structure:

Phase 1: Foundation
- Topics
- Tasks

Phase 2: Intermediate
- Topics
- Tasks

Phase 3: Advanced
- Topics
- Tasks

Phase 4: Projects & Placement
- Projects
- Interview Preparation

Guidelines:
- Keep responses clear and well-structured.
- Be practical and encouraging.
- Avoid unnecessary verbosity.

Conversation History:
${chatHistory}

Assistant:
`;

    const completion = await getGroqClient().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI Service Error:", error);

    return "I'm sorry, but I'm currently unable to process your request. Please try again in a few moments.";
  }
};