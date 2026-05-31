import { enforceMethod, enforceRateLimit, handleOptions, readyPayload, setCommonHeaders } from "../_lib/pathfinder.js";

export default function handler(req: any, res: any) {
  try {
    if (handleOptions(req, res)) return;
    setCommonHeaders(req, res);
    if (!enforceMethod(req, res, "GET")) return;
    if (!enforceRateLimit(req, res, "api")) return;
    const payload = readyPayload();
    res.status(payload.status === "ready" ? 200 : 503).json({ ...payload, mode: process.env.NODE_ENV || "production", platform: "vercel" });
  } catch (err: any) {
    res.status(503).json({ status: "error", message: err?.message || "Service unavailable" });
  }
}
