import { NextRequest, NextResponse } from "next/server";
import { deepseek } from "@ai-sdk/deepseek";
import { streamText } from "ai";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json();

    if (!messages) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // 使用 DeepSeek 模型
    const selectedModel = deepseek("deepseek-chat");


    const result = await streamText({
      model: selectedModel,
      system: systemPrompt + "\n\n重要：每次开始回应前，先简短说明你正在做什么（比如'analyzing situation', 'plotting response', 'calculating odds'等），让玩家知道郑教授的思考状态。",
      messages: messages,
      tools: {
        renderChoices: {
          description:
            "最重要, 最核心的工具, 没有之一, 每当用户需要做决策或选择行动时, 必须调用此工具。不要直接输出选项文本或让用户自由输入, 务必用此工具以按钮形式呈现明确选项, 这是游戏流程的关键。渲染一组可供用户选择的按钮。 最常出现在 '请选择你的行动：' 之后",
          parameters: z.object({
            choices: z.array(z.string()).describe("要渲染为交互按钮的选项列表"),
          }),
        },
        rollADice: {
          description: "掷骰子工具，用于指定面数的骰子。",
          parameters: z.object({
            sides: z.number().int().min(2).describe("骰子的面数"),
            rolls: z.number().int().min(1).describe("掷骰子的次数"),
          }),
        },
        updateStats: {
          description:
            "更新学生的核心生存数值。每当数值发生变化时（包括游戏开始初始化），都应调用此工具，并提供变化说明。",
          parameters: z.object({
            studentStats: z
              .object({
                mentalResilience: z.number().min(0).max(100).describe("心理韧性最终数值（0-100）"),
                academicProgress: z.number().min(0).max(100).describe("学术进展最终数值（0-100）"),
                awarenessLevel: z.number().min(0).max(100).describe("觉察水平最终数值（0-100）"),
              })
              .describe(
                "学生最终数值（mentalResilience、academicProgress、awarenessLevel）"
              ),
            desc: z.string().describe("整体数值变化的简要描述"),
            studentDesc: z.string().describe("学生数值变化的说明"),
          }),
        },
        setGameDay: {
          description: "设置当前游戏天数。每当进入新的一天或需要更新游戏进度时调用此工具。",
          parameters: z.object({
            day: z.number().int().min(1).max(10).describe("游戏天数（1-10）"),
            dayDescription: z.string().describe("这一天的简短描述"),
          }),
        },
        endGame: {
          description: "结束游戏并显示最终结局。当故事达到自然结论时调用此工具。",
          parameters: z.object({
            ending: z.string().describe("结局类型（如'完美毕业'、'华丽转身'、'逃跑路线'等）"),
            summary: z.string().describe("结局总结文本"),
            finalMessage: z.string().describe("给玩家的最终消息"),
          }),
        },
      },
      experimental_continueSteps: true,
      maxSteps: 100,
      toolCallStreaming: true,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in PUA game API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}