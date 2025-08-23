import React from 'react';
import { Dices } from 'lucide-react';

interface PixelDiceProps {
  onRoll: (result: number) => void;
  disabled?: boolean;
  actionName?: string;
}

export function PixelDice({ onRoll, disabled = false, actionName = "ACTION" }: PixelDiceProps) {
  const [value, setValue] = React.useState<number | null>(null);
  const [isRolling, setIsRolling] = React.useState(false);

  const handleRoll = () => {
    if (disabled || isRolling) return;
    
    setIsRolling(true);
    setValue(null);
    
    // 模拟投骰子动画延迟
    setTimeout(() => {
      const result = Math.floor(Math.random() * 20) + 1;
      setValue(result);
      setIsRolling(false);
      onRoll(result);
    }, 300);
  };
  const getDiceResult = () => {
    if (value === null) return null;
    if (value >= 16) return { text: 'CRITICAL!', color: '#10b981', emoji: '🔥' };
    if (value >= 12) return { text: 'SUCCESS!', color: '#f59e0b', emoji: '✅' };
    if (value >= 8) return { text: 'PARTIAL', color: '#6b7280', emoji: '⚡' };
    return { text: 'FAILED!', color: '#ef4444', emoji: '💥' };
  };

  const result = getDiceResult();

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className={`pixel-dice-enhanced ${isRolling ? 'rolling' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={disabled ? undefined : handleRoll}
      >
        {value !== null ? (
          <div className="dice-result">
            <span className="dice-number">{value}</span>
          </div>
        ) : (
          <Dices size={48} className="dice-icon" />
        )}
      </div>

      {/* Roll button */}
      {!isRolling && (
        <button
          onClick={handleRoll}
          disabled={disabled}
          className="pixel-button px-6 py-2 bg-orange-500 text-white font-bold border-2 border-black hover:bg-orange-600 disabled:bg-gray-400"
        >
          {value !== null ? '再次投掷' : '投掷骰子'}
        </button>
      )}

      {isRolling && (
        <div className="text-center text-sm text-gray-600 font-mono">
          🎲 投掷中...
        </div>
      )}

      {result && (
        <div className="pixel-result-panel">
          <div className="result-line" style={{ backgroundColor: result.color }}>
            <span className="result-emoji">{result.emoji}</span>
            <span className="result-text">{result.text}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .pixel-dice-enhanced {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 4px solid #1f2937;
          box-shadow:
            0 0 0 4px #ffffff,
            0 0 0 8px #1f2937,
            8px 8px 0 8px rgba(31, 41, 55, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.1s ease;
          font-family: "Courier New", monospace;
          image-rendering: pixelated;
          position: relative;
          overflow: hidden;
        }

        .pixel-dice-enhanced:hover:not(.disabled) {
          transform: translate(-2px, -2px);
          box-shadow:
            0 0 0 4px #ffffff,
            0 0 0 8px #1f2937,
            10px 10px 0 8px rgba(31, 41, 55, 0.3);
        }

        .pixel-dice-enhanced:active:not(.disabled) {
          transform: translate(2px, 2px);
          box-shadow:
            0 0 0 4px #ffffff,
            0 0 0 8px #1f2937,
            6px 6px 0 6px rgba(31, 41, 55, 0.3);
        }

        .pixel-dice-enhanced.disabled {
          cursor: not-allowed;
          opacity: 0.6;
          filter: grayscale(0.3);
        }

        .pixel-dice-enhanced.rolling {
          animation: roll-bounce 0.1s infinite alternate;
        }

        .dice-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .dice-number {
          font-size: 3rem;
          font-weight: bold;
          color: #1f2937;
          line-height: 1;
          text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.8);
        }

        .dice-icon {
          color: #4b5563;
          filter: drop-shadow(2px 2px 0px rgba(255, 255, 255, 0.8));
        }

        .pixel-result-panel {
          background: #f9fafb;
          border: 3px solid #1f2937;
          box-shadow: 4px 4px 0 0 rgba(31, 41, 55, 0.2);
          padding: 8px 12px;
          min-width: 160px;
          text-align: center;
        }

        .result-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 4px 8px;
          border: 2px solid #1f2937;
          font-family: "Courier New", monospace;
          font-weight: bold;
          color: #ffffff;
        }

        .result-emoji {
          font-size: 1rem;
        }

        .result-text {
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        @keyframes roll-bounce {
          0% { 
            transform: rotate(-3deg) scale(1); 
          }
          100% { 
            transform: rotate(3deg) scale(1.05); 
          }
        }

        .pixel-button {
          font-family: "Courier New", monospace;
          transition: all 0.1s;
          cursor: pointer;
        }

        .pixel-button:active:not(:disabled) {
          transform: translate(1px, 1px);
        }

      `}</style>
    </div>
  );
}