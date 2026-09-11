import React from 'react';
import { TopicDefinition } from '../types';
import { Sliders, RotateCcw, Sparkles } from 'lucide-react';

interface ControlPanelProps {
  topic: TopicDefinition;
  parameters: Record<string, number>;
  onParamChange: (paramId: string, value: number) => void;
  onResetParams: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  topic,
  parameters,
  onParamChange,
  onResetParams,
}) => {
  // Preset scenarios to help students quickly experiment
  const getPresets = () => {
    switch (topic.id) {
      case 'circle-wheel':
        return [
          { name: 'Bánh xe đạp tiêu chuẩn (R=1.5m)', params: { radius: 1.5, omega: 2.0, pointRatio: 1.0 } },
          { name: 'Bánh xe bò kéo / công nông (R=2.5m)', params: { radius: 2.5, omega: 1.0, pointRatio: 1.0 } },
          { name: 'Điểm trong vành (Đường Trochoid)', params: { radius: 1.8, omega: 2.2, pointRatio: 0.5 } },
        ];
      case 'circle-earth':
        return [
          { name: 'Trái Đất quay quanh Mặt Trời', params: { orbitRadius: 4.0, sunMass: 1.2, tiltAngle: 23.5 } },
          { name: 'Sao Thủy (Áp sát Mặt Trời, quay cực nhanh)', params: { orbitRadius: 2.2, sunMass: 1.5, tiltAngle: 2.0 } },
          { name: 'Hành tinh xa (Năm kéo dài)', params: { orbitRadius: 5.8, sunMass: 1.0, tiltAngle: 28.0 } },
        ];
      case 'ellipse-kepler':
        return [
          { name: 'Quỹ đạo Trái Đất (Gần tròn e=0.05)', params: { semiMajor: 4.0, eccentricity: 0.08, centralMass: 1.5 } },
          { name: 'Sao Hỏa (Độ dẹt vừa phải e=0.25)', params: { semiMajor: 4.5, eccentricity: 0.25, centralMass: 1.5 } },
          { name: 'Sao Chổi Halley (Quỹ đạo siêu dẹt e=0.80)', params: { semiMajor: 5.0, eccentricity: 0.80, centralMass: 1.8 } },
        ];
      case 'parabola-projectile':
        return [
          { name: 'Ném bóng rổ tối ưu (45°)', params: { v0: 14, angle: 45, gravity: 9.8 } },
          { name: 'Bắn súng cối góc cao (70°)', params: { v0: 18, angle: 70, gravity: 9.8 } },
          { name: 'Ném trên Mặt Trăng (g=1.6 m/s²)', params: { v0: 12, angle: 45, gravity: 1.6 } },
        ];
      case 'helix-lorentz':
        return [
          { name: 'Hạt bay xiên 45° (Đường xoắn chuẩn)', params: { velocity: 5.0, pitchAngle: 45, bField: 1.5 } },
          { name: 'Gần vuông góc 80° (Xoắn chặt sát trụ)', params: { velocity: 6.0, pitchAngle: 80, bField: 2.5 } },
          { name: 'Góc hẹp 15° (Bước xoắn kéo dài dạt nhanh)', params: { velocity: 7.0, pitchAngle: 15, bField: 1.0 } },
        ];
      case 'sine-harmonic':
        return [
          { name: 'Dao động con lắc chuẩn (A=1.8m, ω=1.5)', params: { amplitude: 1.8, freq: 1.5, initialPhase: 0 } },
          { name: 'Biên độ lớn, tần số cao (A=2.8m, ω=3.0)', params: { amplitude: 2.8, freq: 3.0, initialPhase: 1.57 } },
          { name: 'Dao động chậm êm dịu (A=1.0m, ω=0.8)', params: { amplitude: 1.0, freq: 0.8, initialPhase: 0 } },
        ];
      default:
        return [
          { name: 'Tham số cân bằng A=2, B=2', params: { scaleA: 2.0, scaleB: 2.0, paramSpeed: 1.2 } },
          { name: 'Bất đối xứng A=3.5, B=1.2', params: { scaleA: 3.5, scaleB: 1.2, paramSpeed: 1.8 } },
        ];
    }
  };

  const presets = getPresets();

  return (
    <div id="control-panel" className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-800">Tùy Chỉnh Số Liệu & Tham Số Toán Học</h3>
        </div>
        <button
          type="button"
          onClick={onResetParams}
          className="flex items-center space-x-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
          title="Khôi phục tham số mặc định"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Mặc định</span>
        </button>
      </div>

      {/* Preset Scenarios */}
      {presets.length > 0 && (
        <div className="my-3">
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Kịch bản vật lý điển hình:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  Object.entries(preset.params).forEach(([key, val]) => {
                    onParamChange(key, val);
                  });
                }}
                className="px-2.5 py-1 text-xs rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 transition-colors font-medium text-left"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Parameter Sliders */}
      <div className="space-y-3.5 mt-4">
        {topic.parameters.map((param) => {
          const val = parameters[param.id] ?? param.defaultValue;
          return (
            <div key={param.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">
                  {param.name}
                </span>
                <span className="font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                  {val.toFixed(param.step < 0.1 ? 2 : 1)} {param.unit}
                </span>
              </div>

              {/* Slider Input */}
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={val}
                  onChange={(e) => onParamChange(param.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>{param.min} {param.unit}</span>
                <span className="text-slate-500 italic truncate max-w-[200px] text-center" title={param.description}>
                  {param.description}
                </span>
                <span>{param.max} {param.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
