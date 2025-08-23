import React from "react";
import NumberFlow  from "@number-flow/react";

interface StatsHistory {
  studentStats: {
    mentalResilience: number;  // 心理韧性 🧠
    academicProgress: number;  // 学术进展 📈
    awarenessLevel: number;    // 觉察水平 🔍
    money?: number;            // 经济状况 💰 (optional)
  };
  desc: string;
  studentDesc: string;
  time: number;
}

interface PixelStatsPanelProps {
  statsHistory: StatsHistory[];
  statsHighlight: boolean;
  showBorder?: boolean;
  showMoney?: boolean; // Whether to display money stat
  evidenceCount?: number; // Evidence collection counter
  currentStats: {
    student: {
      mentalResilience: number;
      academicProgress: number;
      awarenessLevel: number;
      money?: number;
    };
  };
}

export function PixelStatsPanel({
  statsHistory,
  statsHighlight,
  showBorder = true,
  showMoney = false,
  evidenceCount = 0,
  currentStats
}: PixelStatsPanelProps) {
  const stats = currentStats.student;

  const StatBar = ({ value, max = 100, color }: { value: number; max?: number; color: string }) => {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    return (
      <div className="pixel-bar-bg">
        <div
          className="pixel-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    );
  };

  const getHealthColor = (value: number) => {
    if (value >= 70) return "#10b981"; // green
    if (value >= 40) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  return (
    <div className={`${showBorder ? 'pixel-panel' : ''} bg-gray-100 p-4 ${statsHighlight ? 'animate-pulse' : ''}`}>
      <div className="space-y-4">
        {/* 核心生存指标 */}
        <div className="space-y-3">
          <h3 className="pixel-text text-sm font-bold mb-2 text-center">生存指标</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="pixel-text text-xs">🧠 心理韧性</span>
              <span className="pixel-text text-xs">
                <NumberFlow value={stats.mentalResilience} />
              </span>
            </div>
            <StatBar value={stats.mentalResilience} color={getHealthColor(stats.mentalResilience)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="pixel-text text-xs">📈 学术进展</span>
              <span className="pixel-text text-xs">
                <NumberFlow value={stats.academicProgress} />
              </span>
            </div>
            <StatBar value={stats.academicProgress} color={getHealthColor(stats.academicProgress)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="pixel-text text-xs">🔍 觉察水平</span>
              <span className="pixel-text text-xs">
                <NumberFlow value={stats.awarenessLevel} />
              </span>
            </div>
            <StatBar value={stats.awarenessLevel} color={getHealthColor(stats.awarenessLevel)} />
          </div>

          {/* Money stat - simple universal display */}
          {showMoney && stats.money !== undefined && (
            <div className="space-y-2 border-t border-gray-300 pt-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="pixel-text text-xs">💰 经济状况</span>
                <span className="pixel-text text-xs">
                  <NumberFlow value={stats.money} />
                </span>
              </div>
              <StatBar value={stats.money} color={getHealthColor(stats.money)} />
            </div>
          )}

          {/* Evidence counter */}
          {evidenceCount > 0 && (
            <div className="border-t border-gray-300 pt-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="pixel-text text-xs">📋 收集证据</span>
                <span className="pixel-text text-xs font-bold text-blue-600">
                  <NumberFlow value={evidenceCount} />
                </span>
              </div>
              <div className="pixel-text text-[10px] text-gray-500 mt-1">
                {evidenceCount >= 3 ? "🎯 证据充足，可提前胜利" : "🔍 继续收集中..."}
              </div>
            </div>
          )}
        </div>

        {/* 状态说明 */}
        {statsHistory.length > 0 && (
          <div className="space-y-1 border-t border-gray-300 pt-2">
            <div className="pixel-text text-xs text-gray-600">
              {statsHistory[0].studentDesc}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .pixel-bar-bg {
          width: 100%;
          height: 8px;
          background: #d1d5db;
          border: 1px solid #374151;
          image-rendering: pixelated;
          position: relative;
        }

        .pixel-bar-fill {
          height: 100%;
          transition: width 0.3s ease;
          image-rendering: pixelated;
        }

        .pixel-text {
          font-family: "Courier New", monospace;
          image-rendering: pixelated;
          letter-spacing: 0.05em;
        }

        .pixel-panel {
          border: 4px solid #000;
          image-rendering: pixelated;
          box-shadow: 4px 4px 0 0 rgba(0,0,0,0.3);
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 4px 4px 0 0 rgba(0,0,0,0.3);
          }
          50% {
            box-shadow: 4px 4px 0 0 rgba(59, 130, 246, 0.6);
          }
        }
      `}</style>
    </div>
  );
}