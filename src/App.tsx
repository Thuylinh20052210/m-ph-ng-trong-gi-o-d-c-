import React, { useState } from 'react';
import { TOPICS, TOPIC_QUIZZES } from './data/curriculumData';
import { TopicId, TopicDefinition, SimulationTelemetry } from './types';
import { SimulationCanvas } from './components/SimulationCanvas';
import { TelemetryCard } from './components/TelemetryCard';
import { ControlPanel } from './components/ControlPanel';
import { PhysicsInsightPanel } from './components/PhysicsInsightPanel';
import { QuizModal } from './components/QuizModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { 
  Atom, 
  Sliders, 
  BookOpen, 
  HelpCircle, 
  Bot, 
  Info, 
  Orbit, 
  CircleDot, 
  Waves, 
  Compass,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [currentTopicId, setCurrentTopicId] = useState<TopicId>('circle-wheel');
  const activeTopic = TOPICS.find((t) => t.id === currentTopicId) || TOPICS[0];

  // Parameter state per topic
  const [paramsState, setParamsState] = useState<Record<TopicId, Record<string, number>>>({
    'circle-wheel': { ...TOPICS[0].initialParams },
    'circle-earth': { ...TOPICS[1].initialParams },
    'ellipse-kepler': { ...TOPICS[2].initialParams },
    'parabola-projectile': { ...TOPICS[3].initialParams },
    'helix-lorentz': { ...TOPICS[4].initialParams },
    'sine-harmonic': { ...TOPICS[5].initialParams },
    'custom-parametric': { ...TOPICS[6].initialParams },
  });

  const currentParams = paramsState[currentTopicId] || activeTopic.initialParams;

  // Real-time telemetry state
  const [telemetry, setTelemetry] = useState<SimulationTelemetry | null>(null);

  // Canvas visual toggles
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTrail, setShowTrail] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Right-side active tab
  const [activeTab, setActiveTab] = useState<'params' | 'insight' | 'quiz' | 'ai'>('params');

  // Help info modal
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Handle parameter adjustment
  const handleParamChange = (paramId: string, value: number) => {
    setParamsState((prev) => ({
      ...prev,
      [currentTopicId]: {
        ...prev[currentTopicId],
        [paramId]: value,
      },
    }));
  };

  // Reset parameters for active topic
  const handleResetParams = () => {
    setParamsState((prev) => ({
      ...prev,
      [currentTopicId]: { ...activeTopic.initialParams },
    }));
  };

  // Switch topic
  const handleSelectTopic = (id: TopicId) => {
    setCurrentTopicId(id);
    setTelemetry(null);
  };

  const currentQuizzes = TOPIC_QUIZZES[currentTopicId] || [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Application Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Mô Phỏng Toán - Lý Không Gian 3D
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Từ công thức & hình học không gian đến định luật vật lý THPT
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
            >
              <Info className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Hướng dẫn thao tác 3D</span>
            </button>
          </div>
        </div>

        {/* Topic Selector Horizontal Ribbon */}
        <div className="border-t border-slate-100 bg-slate-50/70 overflow-x-auto py-2 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center space-x-2 min-w-max">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pr-1">
              Chuyên đề:
            </span>
            {TOPICS.map((topic) => {
              const isSelected = topic.id === currentTopicId;
              return (
                <button
                  key={topic.id}
                  id={`topic-select-${topic.id}`}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{topic.title.split('→')[0].trim()}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isSelected
                        ? 'bg-blue-800 text-blue-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {topic.gradeLevel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: 3D Simulation Canvas & Real-time Telemetry (7/12 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* 3D Canvas Box */}
          <div className="h-[460px] sm:h-[520px] w-full">
            <SimulationCanvas
              topic={activeTopic}
              parameters={currentParams}
              onTelemetryUpdate={setTelemetry}
              showVectors={showVectors}
              showTrail={showTrail}
              showGrid={showGrid}
              onToggleVectors={() => setShowVectors(!showVectors)}
              onToggleTrail={() => setShowTrail(!showTrail)}
              onToggleGrid={() => setShowGrid(!showGrid)}
            />
          </div>

          {/* Real-time Telemetry Card */}
          <TelemetryCard telemetry={telemetry} />
        </section>

        {/* Right Column: Interactive Tabs (5/12 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-3">
          {/* Tab Selection Header */}
          <div className="grid grid-cols-4 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold">
            <button
              id="tab-btn-params"
              type="button"
              onClick={() => setActiveTab('params')}
              className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition-all ${
                activeTab === 'params'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Số Liệu</span>
            </button>

            <button
              id="tab-btn-insight"
              type="button"
              onClick={() => setActiveTab('insight')}
              className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition-all ${
                activeTab === 'insight'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Toán - Lý</span>
            </button>

            <button
              id="tab-btn-quiz"
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition-all ${
                activeTab === 'quiz'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Trắc Nghiệm</span>
            </button>

            <button
              id="tab-btn-ai"
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition-all ${
                activeTab === 'ai'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Thầy AI</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="w-full">
            {activeTab === 'params' && (
              <ControlPanel
                topic={activeTopic}
                parameters={currentParams}
                onParamChange={handleParamChange}
                onResetParams={handleResetParams}
              />
            )}

            {activeTab === 'insight' && (
              <PhysicsInsightPanel topic={activeTopic} />
            )}

            {activeTab === 'quiz' && (
              <QuizModal questions={currentQuizzes} topicTitle={activeTopic.title} />
            )}

            {activeTab === 'ai' && (
              <AIAssistantModal topic={activeTopic} parameters={currentParams} />
            )}
          </div>
        </section>
      </main>

      {/* 3D Navigation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-2 text-blue-600 mb-3">
              <Compass className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">
                Hướng Dẫn Tương Tác Không Gian 3D
              </h3>
            </div>
            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-2.5">
                <span className="font-bold text-blue-600">1.</span>
                <div>
                  <strong className="text-slate-900">Xoay góc nhìn không gian (Orbit):</strong>
                  <p className="text-slate-600 mt-0.5">Nhấp giữ chuột trái (hoặc vuốt 1 ngón trên cảm ứng) rồi kéo để xoay quanh vật thể.</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-2.5">
                <span className="font-bold text-blue-600">2.</span>
                <div>
                  <strong className="text-slate-900">Phóng to / Thu nhỏ (Zoom):</strong>
                  <p className="text-slate-600 mt-0.5">Lăn con trỏ cuộn chuột (hoặc chụm 2 ngón tay) để lại gần hoặc ra xa.</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-2.5">
                <span className="font-bold text-blue-600">3.</span>
                <div>
                  <strong className="text-slate-900">Di chuyển tầm nhìn (Pan):</strong>
                  <p className="text-slate-600 mt-0.5">Nhấp giữ chuột phải hoặc giữ phím Shift + kéo chuột.</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-2.5">
                <span className="font-bold text-blue-600">4.</span>
                <div>
                  <strong className="text-slate-900">Góc nhìn chuẩn 2D / 3D:</strong>
                  <p className="text-slate-600 mt-0.5">Sử dụng các nút góc nhìn "Mặt trước 2D", "Nhìn từ trên", "3D Góc nhìn" trên đỉnh khung mô phỏng.</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              Đã Hiểu, Bắt Đầu Khám Phá
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
