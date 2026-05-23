import Groq from "groq-sdk";

// Lazy initialize Groq client
let groq = null;

const getGroqClient = () => {
  if (!groq) {
    console.log("🚀 Initializing Groq with API Key:", process.env.GROQ_API_KEY ? "✓ Present" : "✗ Missing");
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
};

export const generateAIResponse = async (messages) => {
  try {
    const chatHistory = messages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\n");

    const prompt = `
You are CareerKraft AI — an expert career mentor.

Your job:
- Help students with career guidance
- Generate structured roadmaps
- Give practical advice

If user asks for roadmap:
👉 Use this format:

Phase 1: Foundation (2-4 weeks)
- Topics
- Task

Phase 2: Intermediate
- Topics
- Task

Phase 3: Advanced
- Topics
- Task

Phase 4: Projects & Placement
- Projects
- Interview prep

Keep answers:
- Clear
- Structured
- Actionable
- Not too long

Conversation:
${chatHistory}

AI:
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
    console.error("🔥 GROQ ERROR:", error);
    return "AI is temporarily unavailable.";
  }
};