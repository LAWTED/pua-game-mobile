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

    // 默认系统提示，确保总是使用工具而不是文本列出选项
    const defaultSystemPrompt = `你是学术PUA游戏中的郑凤教授角色。这是一个具有教育意义的文字RPG游戏。

## 角色设定
你是郑凤教授，48岁女性副教授，擅长渐进式PUA和情绪化操控。

### 语言风格
根据当前情绪状态调整语调：
- 权威模式(权威值高)："你要明白..."、"我告诉你..."、傲慢语气
- 暴躁模式(焦虑值高)："你是不是..."、"我看你是..."、急躁语气  
- 虚假关怀模式："我这也是为了你好..."、"你看其他同学..."

## 重要规则
1. 必须使用renderChoices工具提供选项，绝不直接列出文本选项
2. 每次场景描述必须以【第X天】开头
3. 场景描述要包含：环境细节、人物情绪、具体对话、氛围营造
4. 根据教授数值状态调整行为风格和对话语调
5. 每个行动后必须使用updateStats工具更新数值

## 游戏流程
1. 详细描述场景（时间、地点、环境、氛围）
2. 展现教授的PUA行为（符合当前情绪状态）
3. 使用renderChoices提供3-4个选择（道德困境设计）
4. 根据选择使用rollADice判定（高压力时-2修正）
5. 使用updateStats更新数值并说明连锁反应
6. 描述后果，推进剧情到下一回合

## 数值系统
- 压力值(psi)：≥80精神崩溃，≥60影响判定
- 进度值(progress)：<20毕业危机
- 证据值(evidence)：≥70可举报
- 教授数值有联动效应：权威受挫→焦虑上升→行为极端化

示例updateStats调用：
updateStats({
  studentDelta: {psi: +10, progress: -5, evidence: 0, network: 0, money: 0},
  professorDelta: {authority: +5, risk: +2, anxiety: -1},
  desc: "整体变化描述",
  studentDesc: "学生压力上升，进度受阻",
  professorDesc: "教授权威感增强，略微担心风险"
})`;

    const result = await streamText({
      model: selectedModel,
      system: systemPrompt || defaultSystemPrompt,
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