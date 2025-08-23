"use client";

import { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { PixelInteractionPanel, PixelStatsPanel } from "@/components/pua-game-mobile";
import { type InteractionMode, type Choice } from "@/hooks/useGameState";

type PanelView = "stats" | "interaction";

interface SlidingInteractionPanelProps {
  // 交互面板相关
  interactionMode: InteractionMode;
  currentChoices: Choice[];
  diceValue: number | null;
  isManualRolling: boolean;
  gameStarted: boolean;
  
  // 回调函数
  onSelectChoice: (choice: string, toolCallId: string) => void;
  onDiceClick: () => void;
  onSendHelp: () => void;
  onStartGame: () => void;
  onTimingResult?: (result: 'perfect' | 'good' | 'okay' | 'miss') => void;
  
  // 计时条相关
  timingActionName?: string;
  timingDifficulty?: 'easy' | 'medium' | 'hard';
  
  // 动态高度回调
  onHeightChange: (height: number) => void;
  
  // 数值面板相关
  statsHistory: {
    studentStats: {
      mentalResilience: number;  // 心理韧性 🧠
      academicProgress: number;  // 学术进展 📈
      awarenessLevel: number;    // 觉察水平 🔍
      money?: number;            // 经济状况 💰 (optional)
    };
    desc: string;
    studentDesc: string;
    time: number;
  }[];
  statsHighlight: boolean;
  currentStats: {
    student: { mentalResilience: number; academicProgress: number; awarenessLevel: number; money?: number };
  };
  selectedCharacter?: string;
  evidenceCount?: number;
}

export function SlidingInteractionPanel({
  interactionMode,
  currentChoices,
  diceValue,
  isManualRolling,
  gameStarted,
  onSelectChoice,
  onDiceClick,
  onSendHelp,
  onStartGame,
  onTimingResult,
  timingActionName,
  timingDifficulty,
  onHeightChange,
  statsHistory,
  statsHighlight,
  currentStats,
  evidenceCount = 0,
}: SlidingInteractionPanelProps) {
  const [view, setView] = useState<PanelView>("stats");
  const [elementRef, bounds] = useMeasure();
  const [api, setApi] = useState<CarouselApi>();

  // 自动切换视图
  useEffect(() => {
    if (interactionMode !== "idle") {
      setView("interaction");
      api?.scrollTo(1);
    } else {
      setView("stats");
      api?.scrollTo(0);
    }
  }, [interactionMode, api]);

  // 监听 carousel 变化
  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      const index = api.selectedScrollSnap();
      setView(index === 0 ? "stats" : "interaction");
    });
  }, [api]);

  // 高度变化回调
  useEffect(() => {
    if (bounds.height > 0) {
      onHeightChange(bounds.height);
    }
  }, [bounds.height, onHeightChange]);

  // 手动切换页面
  const handleViewChange = (newView: PanelView) => {
    setView(newView);
    api?.scrollTo(newView === "stats" ? 0 : 1);
  };

  // 游戏未开始时显示开始按钮
  if (!gameStarted) {
    return (
      <div className="fixed bottom-[4px] left-0 right-0 z-30 p-4">
        <div ref={elementRef} className="pixel-panel bg-white">
          <div className="px-6 py-8 text-center">
            <h2 className="pixel-text text-lg font-bold mb-4 text-gray-800">
              学术PUA生存游戏
            </h2>
            <p className="pixel-text text-sm text-gray-600 mb-6">
              在这个模拟游戏中，你将扮演一名研究生，面对学术PUA导师郑凤教授的各种压力和挑战。
            </p>
            <button
              onClick={onStartGame}
              className="pixel-button px-8 py-4 bg-green-500 text-white text-lg font-bold hover:bg-green-600 transition-colors"
            >
              开始游戏
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-[4px] left-0 right-0 z-30 p-4">
      <div ref={elementRef} className="pixel-panel bg-white">
        {/* 轮播内容区 */}
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent className="h-auto">
            <CarouselItem className="h-auto">
              <div className="px-4 py-3 h-auto">
                <PixelStatsPanel
                  statsHistory={statsHistory}
                  statsHighlight={statsHighlight}
                  showBorder={false}
                  currentStats={currentStats}
                  showMoney={true}
                  evidenceCount={evidenceCount}
                />
              </div>
            </CarouselItem>
            <CarouselItem className="h-auto">
              <div className="px-4 py-3 h-auto">
                <PixelInteractionPanel
                  interactionMode={interactionMode}
                  currentChoices={currentChoices}
                  diceValue={diceValue}
                  isManualRolling={isManualRolling}
                  gameStarted={gameStarted}
                  onSelectChoice={onSelectChoice}
                  onDiceClick={onDiceClick}
                  onSendHelp={onSendHelp}
                  onTimingResult={onTimingResult}
                  timingActionName={timingActionName}
                  timingDifficulty={timingDifficulty}
                />
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        {/* 翻页指示器 */}
        <div className="flex justify-center py-2 border-t border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewChange("stats")}
              className={`w-2 h-2 rounded-full transition-colors ${
                view === "stats" ? "bg-blue-500" : "bg-gray-300"
              }`}
              aria-label="数值面板"
            />
            <button
              onClick={() => handleViewChange("interaction")}
              className={`w-2 h-2 rounded-full transition-colors ${
                view === "interaction" ? "bg-blue-500" : "bg-gray-300"
              }`}
              aria-label="交互面板"
            />
          </div>
        </div>
      </div>
    </div>
  );
}