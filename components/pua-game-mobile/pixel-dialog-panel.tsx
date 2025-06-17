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
              }}
            >
              {gameIntroduction}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {gameStarted && messages.length > 0 && (
        <div className="pixel-panel bg-white p-6">
          <div className="pixel-text prose prose-sm max-w-none">
            {messages
              .filter((m) => m.role === "assistant" && m.content)
              .map((message, index) => (
                <div key={message.id || index} className="mb-6 last:mb-0">
                  <div className="mb-2">
                    <span className="pixel-text text-xs font-bold bg-black text-white px-2 py-1">
                      SYSTEM
                    </span>
                  </div>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 text-sm pixel-text">{children}</p>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-500 pl-4 my-2 italic pixel-text">
                          {children}
                        </blockquote>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-2 text-sm pixel-text">{children}</ul>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold pixel-text">{children}</strong>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold mb-3 pixel-text">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-bold mb-2 pixel-text">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-bold mb-2 pixel-text">{children}</h3>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
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
                    {typeof message.content === "string" ? message.content : ""}
                  </ReactMarkdown>
                  {index < messages.filter((m) => m.role === "assistant" && m.content).length - 1 && (
                    <div className="mt-4 border-t-2 border-dashed border-gray-300"></div>
                  )}
                </div>
              ))}
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

      <style jsx>{`
        .pixel-loading {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}