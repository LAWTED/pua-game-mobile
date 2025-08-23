"use client";

import { useState } from "react";
import { PixelTimingBar } from "@/components/pua-game-mobile/pixel-timing-bar";
import { PixelDice } from "@/components/pua-game-mobile/pixel-dice";

type GameType = 'none' | 'timing' | 'dice';

export default function TestGamePage() {
  const [results, setResults] = useState<Array<{
    type: 'timing' | 'dice';
    result: any;
    action: string;
    timestamp: string;
  }>>([]);

  const [currentGameType, setCurrentGameType] = useState<GameType>('none');
  const [currentAction, setCurrentAction] = useState('测试游戏');

  const handleTimingComplete = (result: 'perfect' | 'good' | 'okay' | 'miss') => {
    const newResult = {
      type: 'timing' as const,
      result,
      action: currentAction,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setResults(prev => [newResult, ...prev]);
    setCurrentGameType('none');
  };

  const handleDiceComplete = (result: number) => {
    const newResult = {
      type: 'dice' as const,
      result,
      action: currentAction,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setResults(prev => [newResult, ...prev]);
    setCurrentGameType('none');
  };

  const startTimingTest = () => {
    setCurrentGameType('timing');
  };

  const startDiceTest = () => {
    setCurrentGameType('dice');
  };

  const resetAll = () => {
    setCurrentGameType('none');
    setResults([]);
  };

  const getResultColor = (type: string, result: any) => {
    if (type === 'timing') {
      switch (result) {
        case 'perfect': return 'text-green-600 font-bold';
        case 'good': return 'text-blue-600';
        case 'okay': return 'text-yellow-600';
        case 'miss': return 'text-red-600';
        default: return 'text-gray-600';
      }
    } else {
      // 骰子结果
      if (result >= 18) return 'text-green-600 font-bold';
      if (result >= 12) return 'text-blue-600';
      if (result >= 6) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  const getResultEmoji = (type: string, result: any) => {
    if (type === 'timing') {
      switch (result) {
        case 'perfect': return '🎯';
        case 'good': return '👍';
        case 'okay': return '👌';
        case 'miss': return '❌';
        default: return '❓';
      }
    } else {
      return '🎲';
    }
  };

  const formatResult = (type: string, result: any) => {
    if (type === 'timing') {
      return result.toUpperCase();
    } else {
      return `${result}/20`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* 标题 */}
        <div className="pixel-panel bg-white p-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🎮 小游戏测试中心
          </h1>
          <p className="text-sm text-gray-600">
            测试力度条摆动和投骰子游戏
          </p>
        </div>

        {/* 控制面板 */}
        <div className="pixel-panel bg-white p-4">
          <h2 className="text-lg font-bold mb-3">测试配置</h2>
          
          {/* 游戏类型选择 */}
          <div className="mb-4">
            <label className="text-sm font-bold mb-2 block">游戏类型:</label>
            <div className="flex gap-2">
              <button
                onClick={startTimingTest}
                disabled={currentGameType !== 'none'}
                className={`flex-1 px-3 py-2 text-xs border-2 border-black ${
                  currentGameType === 'timing'
                    ? 'bg-blue-500 text-white'
                    : currentGameType === 'none'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                }`}
              >
                🎯 力度条
              </button>
              <button
                onClick={startDiceTest}
                disabled={currentGameType !== 'none'}
                className={`flex-1 px-3 py-2 text-xs border-2 border-black ${
                  currentGameType === 'dice'
                    ? 'bg-purple-500 text-white'
                    : currentGameType === 'none'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                }`}
              >
                🎲 骰子
              </button>
            </div>
          </div>

          {/* 行动名称 */}
          <div className="mb-4">
            <label className="text-sm font-bold mb-2 block">行动名称:</label>
            <input
              type="text"
              value={currentAction}
              onChange={(e) => setCurrentAction(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 text-sm"
              placeholder="输入行动名称"
              disabled={currentGameType !== 'none'}
            />
          </div>

          {/* 重置按钮 */}
          <button
            onClick={resetAll}
            className="w-full px-4 py-2 bg-red-500 text-white border-2 border-black hover:bg-red-600"
          >
            重置所有
          </button>
        </div>

        {/* 力度条游戏区域 */}
        {currentGameType === 'timing' && (
          <div className="pixel-panel bg-white p-6">
            <h2 className="text-lg font-bold mb-4 text-center">🎯 力度条游戏</h2>
            
            <div className="text-center mb-4 text-sm text-gray-600">
              <strong>当前行动:</strong> {currentAction}
            </div>
            
            <PixelTimingBar
              onComplete={handleTimingComplete}
              actionName={currentAction}
            />
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <p><strong>观察指针:</strong> 应该看到指针在力度条上左右摆动</p>
              <p><strong>测试方法:</strong> 等待指针摆动，然后点击 "TAP NOW!" 停止</p>
            </div>
          </div>
        )}

        {/* 骰子游戏区域 */}
        {currentGameType === 'dice' && (
          <div className="pixel-panel bg-white p-6">
            <h2 className="text-lg font-bold mb-4 text-center">🎲 投骰子游戏</h2>
            
            <div className="text-center mb-4 text-sm text-gray-600">
              <strong>当前行动:</strong> {currentAction}
            </div>
            
            <PixelDice
              onRoll={handleDiceComplete}
              actionName={currentAction}
            />
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <p><strong>投骰子:</strong> 点击按钮随机生成1-20的结果</p>
              <p><strong>分数规则:</strong> 18-20优秀，12-17良好，6-11一般，1-5较差</p>
            </div>
          </div>
        )}

        {/* 游戏选择提示 */}
        {currentGameType === 'none' && (
          <div className="pixel-panel bg-white p-6 text-center">
            <h2 className="text-lg font-bold mb-4">选择游戏开始测试</h2>
            <p className="text-gray-600 text-sm">
              点击上方 🎯力度条 或 🎲骰子 按钮选择要测试的游戏
            </p>
          </div>
        )}

        {/* 测试结果 */}
        <div className="pixel-panel bg-white p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">测试结果</h2>
            {results.length > 0 && (
              <span className="text-sm text-gray-500">
                共 {results.length} 次测试
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              还没有测试结果
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getResultEmoji(result.type, result.result)}</span>
                    <div>
                      <div className={`text-sm ${getResultColor(result.type, result.result)}`}>
                        {result.type === 'timing' ? '力度条' : '骰子'} - {formatResult(result.type, result.result)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.action}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {result.timestamp}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 统计信息 */}
          {results.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center text-xs">
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {results.filter(r => r.type === 'timing').length}
                  </div>
                  <div className="text-gray-600">力度条测试</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">
                    {results.filter(r => r.type === 'dice').length}
                  </div>
                  <div className="text-gray-600">骰子测试</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 返回按钮 */}
        <div className="text-center">
          <a
            href="/"
            className="inline-block px-6 py-2 bg-gray-500 text-white border-2 border-black hover:bg-gray-600"
          >
            返回主游戏
          </a>
        </div>
      </div>

      {/* 像素风格CSS */}
      <style jsx>{`
        .pixel-panel {
          border: 3px solid #000;
          border-radius: 0;
          box-shadow: 6px 6px 0 0 rgba(0,0,0,0.2);
          font-family: "Courier New", monospace;
        }

        button {
          font-family: "Courier New", monospace;
          transition: all 0.1s;
        }

        button:active:not(:disabled) {
          transform: translate(1px, 1px);
          box-shadow: 2px 2px 0 0 rgba(0,0,0,0.2);
        }

        input {
          font-family: "Courier New", monospace;
        }
      `}</style>
    </div>
  );
}