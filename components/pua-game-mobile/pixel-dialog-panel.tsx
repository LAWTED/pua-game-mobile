import React, { useRef, useEffect } from "react";
import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PixelDialogPanelProps {
  messages: Message[];
  status: string;
  gameStarted: boolean;
  gameIntroduction: string;
}

export function PixelDialogPanel({
  messages,
  status,
  gameStarted,
  gameIntroduction
}: PixelDialogPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  console.log(messages);

  return (
    <div className="space-y-4">
      {!gameStarted && (
        <div className="pixel-panel bg-white p-6">
          <div className="pixel-text prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-4 pixel-text">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mb-3 pixel-text">{children}</h2>
                ),
                p: ({ children }) => (
                  <p className="mb-2 text-sm pixel-text">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2 text-sm pixel-text">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="mb-1 pixel-text">{children}</li>
                ),
                hr: () => (
                  <div className="pixel-divider my-4"></div>
                ),
              }}
            >
              {gameIntroduction}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {gameStarted && messages.length > 0 && (
        <div className="pixel-panel bg-white p-6">
          <div className="mb-2">
            <span className="pixel-text text-xs font-bold bg-black text-white px-2 py-1">
              SYSTEM
            </span>
          </div>
          <div className="pixel-text prose prose-sm max-w-none">
            {messages.map((message, messageIndex) => {
              console.log('Message structure:', message);

              // 检查多种可能的 parts 位置
              const parts = (message as any).parts ||
                           (message as any).experimental_providerMetadata?.parts ||
                           null;

              if (parts) {
                console.log('Found parts:', parts);
              }

              // 处理 assistant 消息的 parts
              if (message.role === "assistant" && parts) {
                const partElements = parts.map((part: any, partIndex: number) => {
                  if (part.type === "text") {
                    return (
                      <div key={`${messageIndex}-${partIndex}`} className="mb-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 text-sm pixel-text">{children}</p>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-gray-500 pl-4 my-2 italic pixel-text block">
                                {children}
                              </blockquote>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 text-sm pixel-text block">{children}</ul>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold pixel-text">{children}</strong>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold mb-3 pixel-text block">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-bold mb-2 pixel-text block">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-bold mb-2 pixel-text block">{children}</h3>
                            ),
                            hr: () => (
                              <div className="pixel-divider my-4"></div>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-4 block">
                                <table className="min-w-full border-2 border-black">
                                  {children}
                                </table>
                              </div>
                            ),
                            th: ({ children }) => (
                              <th className="border-2 border-black px-2 py-1 bg-gray-200 text-xs pixel-text">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border-2 border-black px-2 py-1 text-xs pixel-text">
                                {children}
                              </td>
                            ),
                          }}
                        >
                          {part.text}
                        </ReactMarkdown>
                      </div>
                    );
                  }

                  // 处理工具调用结果
                  if (part.type === "tool-invocation" && part.toolInvocation?.result) {
                    // 显示用户的选择（renderChoices）
                    if (part.toolInvocation.toolName === "renderChoices") {
                      return (
                        <div key={`${messageIndex}-${partIndex}`} className="my-2">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">👤 你的选择:</span>
                            <span className="text-blue-600 font-medium pixel-text bg-blue-50 px-2 py-1 rounded text-sm border border-blue-200">
                              {part.toolInvocation.result}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // 显示骰子结果（rollADice）
                    if (part.toolInvocation.toolName === "rollADice") {
                      return (
                        <div key={`${messageIndex}-${partIndex}`} className="my-2">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">🎲 骰子结果:</span>
                            <span className="text-orange-600 font-medium pixel-text bg-orange-50 px-2 py-1 rounded text-sm border border-orange-200">
                              {part.toolInvocation.result}
                            </span>
                          </div>
                          {/* 骰子结果后添加像素风分割线 */}
                          <div className="pixel-divider mt-3 mb-2"></div>
                        </div>
                      );
                    }
                  }

                  return null;
                });

                // 在消息之间添加分割线
                if (messageIndex < messages.length - 1) {
                  partElements.push(
                    <div key={`divider-${messageIndex}`} className="pixel-divider my-4"></div>
                  );
                }

                return partElements;
              }

              return null;
            })}
          </div>
        </div>
      )}

      {status === "in_progress" && (
        <div className="pixel-panel bg-yellow-100 p-4">
          <div className="pixel-loading">
            <span className="pixel-text text-sm">LOADING...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}