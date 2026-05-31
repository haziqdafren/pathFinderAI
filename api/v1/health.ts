import { enforceMethod, enforceRateLimit, handleOptions, setCommonHeaders } from "../_lib/pathfinder.js";

export default function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  setCommonHeaders(req, res);
  if (!enforceMethod(req, res, "GET")) return;
  if (!enforceRateLimit(req, res, "api")) return;
  res.status(200).json({ status: "ok", mode: process.env.NODE_ENV || "production", platform: "vercel" });
}
