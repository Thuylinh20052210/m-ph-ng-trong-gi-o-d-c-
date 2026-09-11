import React, { useState } from 'react';
import { TopicDefinition } from '../types';
import { MathFormula } from './MathFormula';
import { BookOpen, Lightbulb, Compass, Award, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface PhysicsInsightPanelProps {
  topic: TopicDefinition;
}

export const PhysicsInsightPanel: React.FC<PhysicsInsightPanelProps> = ({ topic }) => {
  const [showProblemDetail, setShowProblemDetail] = useState<boolean>(false);

  // Sample high school physics exam problems tailored to each topic
  const getExamProblem = () => {
    switch (topic.id) {
      case 'circle-wheel':
        return {
          title: 'Bài toán THPT: Vận tốc tức thời của các điểm trên vành bánh xe',
          question:
            'Một bánh xe đạp bán kính R = 35 cm đang lăn không trượt trên mặt đường nhựa nằm ngang với vận tốc không đổi v₀ = 5 m/s. Xác định độ lớn vận tốc tức thời của điểm tiếp xúc A với mặt đường, điểm B ở tâm bánh xe và điểm C ở đỉnh cao nhất của bánh xe.',
          solution: [
            'Bước 1 (Bản chất hình học & động học): Chuyển động lăn không trượt là sự kết hợp giữa chuyển động tịnh tiến với vận tốc v₀ và chuyển động quay quanh tâm với tốc độ góc ω = v₀ / R.',
            'Bước 2 (Điểm tiếp xúc A): Véc tơ vận tốc quay v_q = ωR = v₀ hướng ngược chiều chuyển động. Vận tốc tổng hợp v_A = v₀ - v₀ = 0 m/s. Điểm A là tâm quay tức thời.',
            'Bước 3 (Tâm bánh xe B): Không tham gia chuyển động quay (khoảng cách đến trục quay = 0), do đó v_B = v₀ = 5 m/s.',
            'Bước 4 (Đỉnh bánh xe C): Véc tơ vận tốc quay cùng chiều chuyển động tịnh tiến, do đó v_C = v₀ + ωR = 2v₀ = 2 * 5 = 10 m/s.',
          ],
        };
      case 'circle-earth':
        return {
          title: 'Bài toán THPT: Chu kỳ chuyển động và vệ tinh địa tĩnh quanh Trái Đất',
          question:
            'Một vệ tinh nhân tạo có khối lượng m chuyển động tròn đều quanh Trái Đất ở độ cao h so với mặt đất. Cho biết bán kính Trái Đất R = 6400 km, khối lượng Trái Đất M = 6.10²⁴ kg và hằng số hấp dẫn G = 6.67.10⁻¹¹ N.m²/kg². Viết biểu thức vận tốc dài v và chu kỳ quay T của vệ tinh.',
          solution: [
            'Bước 1 (Lực hướng tâm): Lực hấp dẫn của Trái Đất tác dụng lên vệ tinh đóng vai trò là lực hướng tâm: F_hd = G*(M*m)/(R+h)² = m*v²/(R+h).',
            'Bước 2 (Vận tốc dài): Rút gọn m ta được v = √(G*M / (R+h)). Khi h = 0, đây là vận tốc vũ trụ cấp 1 (xấp xỉ 7.9 km/s).',
            'Bước 3 (Chu kỳ quay): T = 2π(R+h)/v = 2π * √((R+h)³ / (G*M)). Để vệ tinh đứng yên so với mặt đất (vệ tinh địa tĩnh), ta chọn độ cao h sao cho T đúng bằng 24 giờ (khoảng 36.000 km).',
          ],
        };
      case 'ellipse-kepler':
        return {
          title: 'Bài toán THPT: Định luật bảo toàn mômen động lượng trên quỹ đạo Elip',
          question:
            'Một vệ tinh nhân tạo chuyển động quanh Trái Đất trên quỹ đạo elip. Khoảng cách gần nhất đến tâm Trái Đất là r₁ = 7000 km và vận tốc tại đó là v₁ = 8.2 km/s. Khoảng cách xa nhất là r₂ = 14000 km. Tìm vận tốc v₂ của vệ tinh tại điểm xa nhất.',
          solution: [
            'Bước 1 (Định luật II Kepler & bảo toàn mômen động lượng): Vì lực hấp dẫn là lực xuyên tâm (không tạo ra mômen lực quanh tâm hấp dẫn), mômen động lượng L của hệ được bảo toàn: L = m*r*v = hằng số.',
            'Bước 2 (Thiết lập phương trình): Tại cận điểm và viễn điểm, véc tơ vận tốc vuông góc với véc tơ bán kính: m * r₁ * v₁ = m * r₂ * v₂.',
            'Bước 3 (Tính toán): v₂ = (r₁ / r₂) * v₁ = (7000 / 14000) * 8.2 = 4.1 km/s. Vận tốc tại viễn điểm giảm đi một nửa so với cận điểm!',
          ],
        };
      case 'parabola-projectile':
        return {
          title: 'Bài toán THPT: Khảo sát tầm bay xa và tầm bay cao của vật ném xiên',
          question:
            'Từ mặt đất, một quả cầu được ném lên với vận tốc ban đầu v₀ = 20 m/s hợp với phương ngang một góc α = 45°. Lấy g = 10 m/s². Tính tầm bay cao cực đại H_max và tầm bay xa L của quả cầu.',
          solution: [
            'Bước 1 (Phân tích chuyển động): Vận tốc ban đầu theo phương Ox: v₀x = v₀*cos(α) = 20*cos(45°) ≈ 14.14 m/s. Vận tốc Oy: v₀y = 20*sin(45°) ≈ 14.14 m/s.',
            'Bước 2 (Tầm cao H_max): Tại đỉnh parabol, vy = 0. H_max = v₀y² / (2g) = 14.14² / 20 = 10 m.',
            'Bước 3 (Tầm xa L): Thời gian bay t = 2*v₀y / g = 2*14.14 / 10 = 2.83 s. Tầm xa L = v₀x * t = (v₀² * sin(2α)) / g = (400 * sin(90°)) / 10 = 40 m.',
          ],
        };
      case 'helix-lorentz':
        return {
          title: 'Bài toán THPT: Quỹ đạo xoắn ốc của hạt proton trong từ trường đều',
          question:
            'Một hạt proton (m = 1.67.10⁻²⁷ kg, q = 1.6.10⁻¹⁹ C) bay vào vùng từ trường đều B = 0.2 T với vận tốc v = 2.10⁶ m/s hợp với véc tơ cảm ứng từ B một góc α = 60°. Tính bán kính quỹ đạo xoắn R và bước xoắn h của proton.',
          solution: [
            'Bước 1 (Phân tích vận tốc): Thành phần vuông góc: v_perp = v*sin(60°) ≈ 1.732.10⁶ m/s. Thành phần song song: v_parallel = v*cos(60°) = 1.0.10⁶ m/s.',
            'Bước 2 (Bán kính xoắn R): Lực Lorentz đóng vai trò lực hướng tâm: q*v_perp*B = m*v_perp² / R => R = m*v_perp / (q*B) ≈ (1.67.10⁻²⁷ * 1.732.10⁶) / (1.6.10⁻¹⁹ * 0.2) ≈ 0.09 m (9 cm).',
            'Bước 3 (Bước xoắn h): Chu kỳ quay T = 2πm / (qB) ≈ 3.28.10⁻⁷ s. Bước xoắn h = v_parallel * T = 1.0.10⁶ * 3.28.10⁻⁷ ≈ 0.328 m (32.8 cm).',
          ],
        };
      case 'sine-harmonic':
        return {
          title: 'Bài toán THPT: Mối liên hệ dao động điều hòa và chuyển động tròn đều',
          question:
            'Một chất điểm chuyển động tròn đều với bán kính R = 6 cm và tốc độ góc ω = 5 rad/s. Tìm phương trình dao động điều hòa của hình chiếu chất điểm lên trục Ox đi qua tâm đường tròn, biết tại t = 0 chất điểm có tọa độ góc φ = π/3 rad.',
          solution: [
            'Bước 1 (Biên độ dao động): Biên độ dao động A bằng bán kính đường tròn Fresnel: A = R = 6 cm.',
            'Bước 2 (Tần số góc): Tần số góc dao động ω bằng tốc độ góc quay tròn: ω = 5 rad/s.',
            'Bước 3 (Phương trình): x(t) = A*cos(ωt + φ) = 6*cos(5t + π/3) cm. Vận tốc cực đại qua VTCB: v_max = ωA = 30 cm/s.',
          ],
        };
      default:
        return {
          title: 'Bài toán THPT: Động lực học chất điểm theo quỹ đạo không gian 3D',
          question:
            'Chất điểm chuyển động theo phương trình tham số r(t) = (A*cos(ωt), A*sin(ωt), v₀*t). Chứng minh rằng hợp lực tác dụng lên chất điểm luôn vuông góc với trục Z và có độ lớn không đổi.',
          solution: [
            'Bước 1: Đạo hàm cấp 1 tìm vận tốc: v(t) = (-Aω*sin(ωt), Aω*cos(ωt), v₀).',
            'Bước 2: Đạo hàm cấp 2 tìm gia tốc: a(t) = (-Aω²*cos(ωt), -Aω²*sin(ωt), 0).',
            'Bước 3: Lực F = m*a(t) có thành phần Z bằng 0, độ lớn F = m*A*ω² = hằng số, luôn hướng vào tâm trục Z.',
          ],
        };
    }
  };

  const examProblem = getExamProblem();

  return (
    <div id="physics-insight-panel" className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-800">
          Mối Liên Hệ Giữa Toán Học & Vật Lý Cấp 3
        </h3>
      </div>

      {/* 1. Mathematical Foundation */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>1. Công Thức Toán Học & Không Gian Hình Học:</span>
        </div>
        <MathFormula math={topic.mathFormula} />
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          {topic.mathExplanation}
        </p>
      </div>

      {/* 2. Physics Law & Intuition */}
      <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60">
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 mb-1.5">
          <Lightbulb className="w-4 h-4 text-emerald-600" />
          <span>2. Bản Chất Vật Lý & Quy Luật Chuyển Động:</span>
        </div>
        <div className="font-semibold text-xs text-emerald-900 mb-1">
          {topic.physicsTopic}
        </div>
        <MathFormula math={topic.physicsFormula} />
        <p className="text-xs text-slate-700 mt-2 leading-relaxed">
          {topic.physicsExplanation}
        </p>
      </div>

      {/* 3. Real-world applications */}
      <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/60">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-800 mb-1">
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          <span>Ứng Dụng Thực Tiễn & Kỹ Thuật:</span>
        </div>
        <p className="text-xs text-amber-900/90 leading-relaxed">
          {topic.realWorldApp}
        </p>
      </div>

      {/* 4. Classic Exam Problem Breakdown */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3.5">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowProblemDetail(!showProblemDetail)}>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-indigo-900">
              {examProblem.title}
            </h4>
          </div>
          <button type="button" className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center">
            {showProblemDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-xs text-indigo-950 mt-2 italic bg-white/70 p-2.5 rounded border border-indigo-100">
          "{examProblem.question}"
        </p>

        {showProblemDetail && (
          <div className="mt-3 pt-3 border-t border-indigo-200/60 space-y-2">
            <div className="text-xs font-semibold text-indigo-900">Phương pháp giải chi tiết từng bước:</div>
            {examProblem.solution.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
