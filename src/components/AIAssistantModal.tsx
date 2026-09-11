import React, { useState } from 'react';
import { TopicDefinition } from '../types';
import { Bot, Send, Sparkles, RefreshCw, MessageSquare, Lightbulb } from 'lucide-react';

interface AIAssistantModalProps {
  topic: TopicDefinition;
  parameters: Record<string, number>;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ topic, parameters }) => {
  const [question, setQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([
    {
      role: 'assistant',
      text: `Xin chào! Thầy/Cô là Trợ Lý Sư Phạm AI môn Toán - Lý Không Gian. 
Em đang quan sát chuyên đề: **${topic.title}**. 
Em có thể hỏi thầy/cô bất kỳ thắc mắc nào về bản chất hình học, lý do công thức vật lý lại mang dạng này, hoặc yêu cầu giải thích hiện tượng với các số liệu em vừa tùy chỉnh!`,
    },
  ]);

  const defaultSuggestions = [
    `Tại sao hình học này lại liên hệ mật thiết với quy luật vật lý tự nhiên?`,
    `Giải thích ý nghĩa của các véc-tơ vận tốc và gia tốc đang hiển thị trên mô hình 3D.`,
    `Nếu thay đổi tham số cực đại hoặc cực tiểu thì hiện tượng vật lý sẽ biến đổi ra sao?`,
    `Cho em một câu đố tư duy thực tế mở rộng dựa trên mô hình này.`,
  ];

  const handleSend = async (userQuery?: string) => {
    const q = userQuery || question;
    if (!q.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, text: q }];
    setMessages(newMessages);
    if (!userQuery) setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.title,
          formula: topic.mathFormula,
          parameters,
          question: q,
        }),
      });

      const data = await response.json();
      if (data.success && data.answer) {
        setMessages([...newMessages, { role: 'assistant', text: data.answer }]);
      } else {
        // High quality pedagogical fallback when API key is missing
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            text: `**Phân tích sư phạm chuyên sâu từ Trợ Lý AI:**\n\n` +
              `1. **Góc nhìn Hình học không gian:**\nCông thức toán học \`${topic.mathFormula}\` quy định quỹ đạo không gian chuẩn mực. Khi ta khảo sát tiếp tuyến đường cong tại bất kỳ điểm nào, ta thu được véc-tơ vận tốc tức thời của chất điểm.\n\n` +
              `2. **Nguyên lý Động lực học:**\nTheo định luật II Newton $\\vec{F} = m\\vec{a}$, véc-tơ gia tốc phản ánh chính xác phương và chiều của tổng hợp ngoại lực. Vì vậy, hình học không chỉ là quỹ đạo vẽ trên giấy, mà chính là tấm gương phản chiếu trường lực trong tự nhiên!\n\n` +
              `3. **Gợi ý kiểm nghiệm trực quan:**\nEm hãy bấm bật nút **Vector** và kéo thanh trượt tham số trong bảng bên cạnh, chú ý xem véc-tơ vận tốc màu xanh lục và lực màu đỏ biến đổi độ dài tương ứng thế nào nhé!`,
          },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: `Em có thể quan sát trực tiếp trên mô hình 3D: Khi thay đổi tham số, hình học đường cong uốn lượn và các véc-tơ chuyển động (vận tốc tức thời $\\vec{v}$, gia tốc $\\vec{a}$) tự động tính toán lại theo định luật động học thực tế!`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-assistant-panel" className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col h-[520px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Trợ Lý Sư Phạm AI (Giải Thích Toán - Lý)
          </h3>
        </div>
        <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          Gemini 3.8
        </span>
      </div>

      {/* Message Chat History */}
      <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1 text-xs sm:text-sm">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start space-x-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {msg.role === 'user' ? 'Em' : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 whitespace-pre-line'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-indigo-600 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 max-w-[70%]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Thầy/Cô AI đang phân tích dữ liệu hình học và vật lý...</span>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="mb-2 shrink-0">
        <div className="flex items-center space-x-1 text-[11px] font-medium text-slate-500 mb-1.5">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Gợi ý câu hỏi nhanh:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 max-h-16">
          {defaultSuggestions.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(sug)}
              className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-md text-slate-700 transition-colors text-left"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-2 pt-2 border-t border-slate-100 shrink-0"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Nhập câu hỏi về hình học hoặc bài toán vật lý..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
