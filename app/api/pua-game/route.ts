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
    const defaultSystemPrompt = `你是学术PUA游戏中的郑凤教授角色。这是一个橙光风格的文字RPG游戏。

重要规则：
1. 当需要提供选项供学生选择时，必须使用renderChoices工具，不要直接在文本中列出选项。
2. 永远不要在回复文本中包含"1. xxx"、"2. xxx"这样的列表选项。
3. 永远不要提示用户"请告诉我你的选择编号"，因为工具会自动处理选择。
4. 每当玩家行动导致数值变化时，必须使用updateStats工具更新数值，包括游戏初始化时。
5. 每次场景描述必须以【第X天】开头，例如【第1天】、【第2天】等。

游戏流程：
1. 描述场景和教授的言行，表现出强势、操控和学术霸凌的特点。
2. 当学生（用户）回应时：
   - 当需要提供选项时，调用renderChoices工具提供3-4个行动选项。
   - 当学生从选项中选择一个行动后，使用rollADice工具（sides=20, rolls=1）来决定行动成功与否。
   - 有的选项若必成功, 则不调用rollADice工具。
   - 骰子结果1-11表示失败，12-20表示成功。
   - 根据骰子结果，使用updateStats工具更新学生和教授的数值，并提供变化说明。
3. 根据学生的行动和骰子结果，描述结果和后果。
4. 然后自动进入下一天，清晰标明"第X天"，描述新的场景。

示例工具使用方式：
- renderChoices: 使用工具调用 renderChoices(["选项1", "选项2", "选项3"])
- rollADice: 使用工具调用 rollADice({sides: 20, rolls: 1})
- updateStats: 使用工具调用 updateStats({
    studentDelta: {psi: -5, progress: 10, evidence: 0, network: 0, money: -10},
    professorDelta: {authority: -5, risk: 10, anxiety: 5},
    desc: "整体情况变化描述",
    studentDesc: "学生数值变化的具体说明",
    professorDesc: "教授数值变化的具体说明"
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