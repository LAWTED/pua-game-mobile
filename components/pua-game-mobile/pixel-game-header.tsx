import React from "react";
import { Info, Zap, ZapOff } from "lucide-react";

interface PixelGameHeaderProps {
  gameDay: number;
  onShowInstructions: () => void;
  isAutoMode?: boolean;
  onToggleAutoMode?: () => void;
}

export function PixelGameHeader({
  gameDay,
  onShowInstructions,
  isAutoMode = false,
  onToggleAutoMode
}: PixelGameHeaderProps) {
  return (
    <div className="pixel-header bg-black text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="pixel-text text-xl font-bold">PUA GAME</h1>
          <div className="pixel-text text-sm">
            Day: {gameDay}
          </div>
          {isAutoMode && (
            <div className="flex items-center gap-1 pixel-button-small p-1 bg-green-600">
              <Zap size={12} />
              <span className="text-xs">AUTO</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleAutoMode && (
            <button
              onClick={onToggleAutoMode}
              className={`pixel-button-small p-2 flex items-center gap-1 ${
                isAutoMode 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={isAutoMode ? "关闭自动模式" : "开启自动模式"}
            >
              {isAutoMode ? <Zap size={16} /> : <ZapOff size={16} />}
              <span className="text-xs">{isAutoMode ? 'AUTO' : 'MANUAL'}</span>
            </button>
          )}
          
          <button
            onClick={onShowInstructions}
            className="pixel-button-small p-2 bg-blue-600 hover:bg-blue-700"
            title="游戏说明"
          >
            <Info size={16} />
          </button>

          <div className="pixel-button-small p-2 bg-purple-600 flex items-center gap-1">
            <span className="text-xs">DeepSeek</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pixel-header {
          border-bottom: 4px solid #fff;
          box-shadow: 0 4px 0 0 rgba(0,0,0,0.2);
        }

        .pixel-button-small {
          font-family: "Courier New", monospace;
          border: 2px solid #fff;
          image-rendering: pixelated;
          transition: all 0.1s;
        }

        .pixel-button-small:active {
          transform: translate(1px, 1px);
        }

        .pixel-button-small:hover {
          box-shadow: 2px 2px 0 0 rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}