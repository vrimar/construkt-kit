import preview from "@construkt-kit/story-kit/preview";
import { SparklesIcon } from "lucide-react";
import { useState } from "react";

import { Chat } from ".";
import { Stack } from "../Layout";

const meta = preview.meta({
  title: "Components/Chat",
  tags: ["autodocs"],
});

const agent = { sender: "assistant", name: "Assistant", icon: <SparklesIcon /> } as const;

const SUGGESTIONS = [
  "How does Platform differ here?",
  "Share this with the team",
  "Show it by week",
];

export const Conversation = meta.story({
  render: function Render() {
    const [asked, setAsked] = useState<string[]>([]);
    const [undone, setUndone] = useState(false);
    const [listening, setListening] = useState(false);
    const [cited, setCited] = useState<number>();

    return (
      <Stack
        gap="4"
        maxW="360px"
      >
        <Stack
          role="log"
          gap="4"
        >
          <Chat.Message {...agent}>
            <p>
              Ask me anything about this project, or tell me what to change. Every number I give you
              links back to its source.
            </p>
          </Chat.Message>
          <Chat.Message sender="user">Which team closed the most tasks?{"\n"}And why?</Chat.Message>
          <Chat.Message
            {...agent}
            meta="from Sprint 14"
          >
            <Chat.ActionLine
              undone={undone}
              onUndo={() => setUndone(true)}
            >
              Grouped tasks by team
            </Chat.ActionLine>
            <p>
              The <b>Design</b> team leads with 72 closed{" "}
              <Chat.Citation
                aria-label="Source 1"
                onClick={() => setCited(1)}
              >
                1
              </Chat.Citation>
              , well ahead of Platform at 58{" "}
              <Chat.Citation
                aria-label="Source 2"
                onClick={() => setCited(2)}
              >
                2
              </Chat.Citation>
              .
            </p>
            {cited ? <p>Showing source {cited}.</p> : null}
          </Chat.Message>
          {asked.map((question, i) => (
            <Chat.Message
              key={`${i}:${question}`}
              sender="user"
            >
              {question}
            </Chat.Message>
          ))}
          {asked.length ? (
            <Chat.Message {...agent}>
              <Chat.TypingIndicator>Reading Sprint 14</Chat.TypingIndicator>
            </Chat.Message>
          ) : (
            <Chat.Suggestions label="Next">
              {SUGGESTIONS.map((suggestion) => (
                <Chat.Suggestion
                  key={suggestion}
                  onClick={() => setAsked([suggestion])}
                >
                  {suggestion}
                </Chat.Suggestion>
              ))}
            </Chat.Suggestions>
          )}
        </Stack>
        <Chat.Composer
          context={
            <>
              <SparklesIcon />
              Reading <b>Sprint 14 · Tasks by team and status</b>
            </>
          }
          placeholder={listening ? "Listening…" : "Ask or tell the assistant…"}
          inputLabel="Ask or tell the assistant"
          listening={listening}
          onListeningChange={setListening}
          onSend={(text) => setAsked((current) => [...current, text])}
        />
      </Stack>
    );
  },
});
