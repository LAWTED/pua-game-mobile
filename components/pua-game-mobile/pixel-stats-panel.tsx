import React from "react";

interface StatsHistory {
  studentStats: {
    psi: number;
    progress: number;
    evidence: number;
    network: number;
    money: number;
  };
  professorStats: {
    authority: number;
    risk: number;
    anxiety: number;
  };
  desc: string;
  studentDesc: string;
  professorDesc: string;
  time: number;
}

interface PixelStatsPanelProps {
  statsHistory: StatsHistory[];
  statsHighlight: boolean;
  currentStats: {
    student: {
      psi: number;
      progress: number;
      evidence: number;
      network: number;
      money: number;
    };
    professor: {
      authority: number;
      risk: number;
      anxiety: number;
    };
  };
}

export function PixelStatsPanel({
  statsHistory,
  statsHighlight,
  currentStats
}: PixelStatsPanelProps) {
  const stats = currentStats.student;
  const professorStats = currentStats.professor;

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

  return (
    <div className={`pixel-panel bg-gray-100 p-4 ${statsHighlight ? 'animate-pulse' : ''}`}>
      <div className="grid grid-cols-2 gap-4">
        {/* 学生数值 */}
        <div className="space-y-2">
          <h3 className="pixel-text text-sm font-bold mb-2">STUDENT</h3>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="pixel-text text-xs">Ψ PSI</span>
              <span className="pixel-text text-xs">{stats.psi}</span>
            </div>
            <StatBar value={stats.psi} color="#ef4444" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="pixel-text text-xs">🛠 PROG</span>
              <span className="pixel-text text-xs">{stats.progress}</span>
            </div>
            <StatBar value={stats.progress} color="#3b82f6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="pixel-text text-xs">📂 EVID</span>
              <span className="pixel-text text-xs">{stats.evidence}</span>
            </div>
            <StatBar value={stats.evidence} color="#10b981" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="pixel-text text-xs">🤝 NET</span>
              <span className="pixel-text text-xs">{stats.network}</span>
            </div>
            <StatBar value={stats.network} color="#8b5cf6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="pixel-text text-xs">💰 MONEY</span>
              <span className="pixel-text text-xs">{stats.money}</span>
            </div>
            <StatBar value={stats.money} color="#f59e0b" />
          </div>
        </div>

        {/* 教授数值 */}
        <div className="space-y-2">
          <h3 className="pixel-text text-sm font-bold mb-2">PROFESSOR</h3>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="pixel-text text-xs">⚖️ AUTH</span>
              <span className="pixel-text text-xs">{professorStats.authority}</span>
            </div>
            <StatBar value={professorStats.authority} color="#6b7280" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="pixel-text text-xs">📉 RISK</span>
              <span className="pixel-text text-xs">{professorStats.risk}</span>
            </div>
            <StatBar value={professorStats.risk} color="#dc2626" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="pixel-text text-xs">😰 ANX</span>
              <span className="pixel-text text-xs">{professorStats.anxiety}</span>
            </div>
            <StatBar value={professorStats.anxiety} color="#7c3aed" />
          </div>
        </div>
      </div>

      {/* 最新变化提示 */}
      {statsHistory.length > 0 && (
        <div className="mt-3 pt-3 border-t-2 border-black">
          <p className="pixel-text text-xs text-gray-700">
            {statsHistory[0].studentDesc}
          </p>
        </div>
      )}

      <style jsx>{`
        .pixel-bar-bg {
          width: 100%;
          height: 8px;
          background-color: #000;
          border: 1px solid #000;
          position: relative;
        }

        .pixel-bar-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
}