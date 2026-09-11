import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Tutor explanation endpoint
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { topic, formula, parameters, question } = req.body;
      const ai = getAIClient();

      const prompt = `Bạn là một chuyên gia sư phạm Toán học và Vật lý cấp 3 (THPT) nhiệt huyết, uyên bác và diễn đạt trực quan.
Học sinh đang quan sát mô phỏng giáo dục sau:
- Chủ đề: ${topic || "Liên hệ Toán - Lý Không gian"}
- Công thức toán: ${formula || "N/A"}
- Tham số hiện tại: ${JSON.stringify(parameters || {})}
- Câu hỏi hoặc yêu cầu của học sinh: ${question || "Hãy giải thích trực quan mối liên hệ giữa hình học này và bài toán vật lý thực tế tương ứng."}

Hãy trả lời bằng tiếng Việt, súc tích, dễ hiểu với học sinh lớp 10-12:
1. Bản chất hình học không gian của công thức.
2. Tại sao quy luật vật lý tự nhiên lại biểu diễn bằng hình học này (nguyên nhân lực, động học, bảo toàn năng lượng).
3. Hiện tượng thực tế nổi bật (ví dụ: chuyển động bánh xe, chuyển động vệ tinh/hành tinh, hạt trong từ trường, v.v.).
4. Một bài toán hoặc câu hỏi tư duy kinh điển kèm hướng dẫn giải ngắn gọn.
Định dạng trình bày rõ ràng với gạch đầu dòng và công thức khoa học dễ đọc.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      res.json({
        success: true,
        answer: response.text || "Không nhận được phản hồi từ AI.",
      });
    } catch (error: any) {
      console.error("AI explain error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Lỗi khi kết nối với AI.",
      });
    }
  });

  // AI Quiz generator endpoint
  app.post("/api/ai/generate-quiz", async (req, res) => {
    try {
      const { topic, formula } = req.body;
      const ai = getAIClient();

      const prompt = `Hãy tạo 2 câu hỏi trắc nghiệm vật lý cấp 3 (lớp 10, 11 hoặc 12) liên hệ trực tiếp với chủ đề hình học: "${topic}" và công thức: "${formula}".
Trả về duy nhất định dạng JSON chuẩn (không bọc trong markdown block hoặc nếu có thì thuần JSON parse được) với mảng:
[
  {
    "question": "Nội dung câu hỏi...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correctIndex": 0,
    "explanation": "Lời giải chi tiết giải thích vì sao đáp án đó đúng và liên hệ với hình học..."
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      const text = response.text || "[]";
      let jsonMatch = text.match(/\[[\s\S]*\]/);
      let parsed = [];
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = [];
        }
      }

      res.json({ success: true, quizzes: parsed });
    } catch (error: any) {
      console.error("AI quiz error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Lỗi khi tạo câu hỏi.",
      });
    }
  });

  // Vite middleware in dev or static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
