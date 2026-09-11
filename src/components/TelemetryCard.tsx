import React from 'react';
import { SimulationTelemetry } from '../types';
import { Gauge, Compass, Activity, Clock, Compass as OrbitIcon } from 'lucide-react';

interface TelemetryCardProps {
  telemetry: SimulationTelemetry | null;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({ telemetry }) => {
  if (!telemetry) return null;

  return (
    <div id="telemetry-dashboard" className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-800">Dữ Liệu Đo Đạc Thời Gian Thực (Telemetry)</h3>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
          ● Đang cập nhật
        </span>
      </div>

      {/* Primary Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Thời gian (t)</div>
          <div className="text-lg font-mono font-bold text-slate-800 mt-0.5">
            {telemetry.time.toFixed(2)} <span className="text-xs font-normal text-slate-500">s</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
          <div className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">Vận tốc tức thời (v)</div>
          <div className="text-lg font-mono font-bold text-emerald-800 mt-0.5">
            {telemetry.velocity.toFixed(2)} <span className="text-xs font-normal text-emerald-600">m/s</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100">
          <div className="text-[11px] font-medium text-rose-700 uppercase tracking-wider">Gia tốc (a)</div>
          <div className="text-lg font-mono font-bold text-rose-800 mt-0.5">
            {telemetry.acceleration.toFixed(2)} <span className="text-xs font-normal text-rose-600">m/s²</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
          <div className="text-[11px] font-medium text-blue-700 uppercase tracking-wider">Tọa độ (x, y, z)</div>
          <div className="text-xs font-mono font-bold text-blue-900 mt-1 truncate" title={`(${telemetry.x.toFixed(2)}, ${telemetry.y.toFixed(2)}, ${telemetry.z.toFixed(2)})`}>
            ({telemetry.x.toFixed(1)}, {telemetry.y.toFixed(1)}, {telemetry.z.toFixed(1)})
          </div>
        </div>
      </div>

      {/* Specific Derived Physical Quantities */}
      {telemetry.extraInfo && telemetry.extraInfo.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-600 mb-2">Đại lượng vật lý chuyên biệt:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {telemetry.extraInfo.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/60">
                <span className="text-slate-600 font-medium">{item.label}:</span>
                <span className="font-mono font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
