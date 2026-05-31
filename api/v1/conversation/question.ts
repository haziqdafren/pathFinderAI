import { conversationSchema, enforceMethod, enforceRateLimit, generateJson, handleOptions, setCommonHeaders, validate } from "../../_lib/pathfinder.js";

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  setCommonHeaders(req, res);
  if (!enforceMethod(req, res, "POST")) return;
  if (!enforceRateLimit(req, res, "ai")) return;

  const body = validate(conversationSchema, req, res);
  if (!body) return;

  const isEn = body.lang === "en";
  if (body.question_index !== 2) {
    res.status(200).json({ question: isEn ? "Static question" : "Pertanyaan statis", tip: "..." });
    return;
  }

  try {
    const prompt = isEn
      ? `User answered Q1: "${body.previous_answer}". Generate Q2 asking what specific task engages them for hours. Return JSON ONLY: {"question":"...","tip":"..."}`
      : `User menjawab Q1: "${body.previous_answer}". Buat Q2 yang menanyakan task spesifik apa yang bikin dia lupa waktu. Return JSON ONLY: {"question":"...","tip":"..."}`;
    const result = await generateJson(prompt);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(200).json({
      question: isEn
        ? "From your project story, which specific task makes you lose track of time?"
        : "Dari ceritamu tadi, bagian mana yang sering bikin kamu lupa waktu?",
      tip: isEn
        ? "This helps PathFinder match the role to your real working style."
        : "Ini membantu PathFinder mencocokkan role dengan gaya kerjamu yang sebenarnya.",
      degraded: true,
    });
  }
}
