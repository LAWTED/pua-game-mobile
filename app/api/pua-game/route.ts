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
      system: systemPrompt,
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
            "更新学生和教授的数值。每当数值发生变化时（包括游戏开始初始化），都应调用此工具，并提供变化说明。",
          parameters: z.object({
            studentDelta: z
              .object({
                psi: z.number(),
                progress: z.number(),
                evidence: z.number(),
                network: z.number(),
                money: z.number(),
              })
              .describe(
                "学生数值变化（psi、progress、evidence、network、money）"
              ),
            professorDelta: z
              .object({
                authority: z.number(),
                risk: z.number(),
                anxiety: z.number(),
              })
              .describe("教授数值变化（authority、risk、anxiety）"),
            desc: z.string().describe("整体数值变化的简要描述"),
            studentDesc: z.string().describe("学生数值变化的说明"),
            professorDesc: z.string().describe("教授数值变化的说明"),
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