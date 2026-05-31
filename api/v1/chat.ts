import { chatSchema, enforceMethod, enforceRateLimit, fallbackChatReply, generateJson, handleOptions, setCommonHeaders, validate } from "../_lib/pathfinder.js";

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  setCommonHeaders(req, res);
  if (!enforceMethod(req, res, "POST")) return;
  if (!enforceRateLimit(req, res, "ai")) return;

  const body = validate(chatSchema, req, res);
  if (!body) return;

  try {
    const isEn = body.lang === "en";
    const tone = body.mentorStyle === "profesional"
      ? (isEn ? "professional, formal, and focused" : "profesional, baku, dan terfokus")
      : (isEn ? "casual and supportive" : "santai dan suportif");
    const prompt = `
You are Pathy, a career and project assistant.
User message: "${body.message}"
Current dashboard data:
${JSON.stringify(body.sessionData || {})}

Respond in ${isEn ? "English" : "Bahasa Indonesia"} with tone: ${tone}.
Return JSON only:
{"reply":"your answer","updatedData":null}`;
    const result = await generateJson(prompt);
    res.status(200).json({
      reply: result.reply || (isEn ? "I can help you plan the next step." : "Aku bisa bantu susun langkah berikutnya."),
      updatedData: result.updatedData || null,
    });
  } catch (err: any) {
    res.status(200).json({
      reply: fallbackChatReply(body.message, body.sessionData, body.lang),
      updatedData: null,
    });
  }
}
