import { ark } from "@ark-ui/react/factory";
import { CheckIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useId } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { chat, tag } from "#styled-system/recipes";

import { Spinner } from "../Spinner";
import { Composer } from "./Composer";

const { withProvider, withContext } = createSlotRecipeContext(chat);

const MessageRoot = withProvider(ark.div, "message");
const MessageBubble = withContext(ark.div, "messageBubble");
const MessageHeader = withContext(ark.div, "messageHeader");
const MessageMeta = withContext(ark.span, "messageMeta");
const MessageBody = withContext(ark.div, "messageBody");

export interface ChatMessageProps extends ComponentProps<typeof MessageRoot> {
  /** A `user` message renders as a bubble at the end; an `assistant` one under a header. */
  sender: "user" | "assistant";
  /** The assistant's name in the header. */
  name?: ReactNode;
  /** Icon before the assistant's name. */
  icon?: ReactNode;
  /** Muted detail after the assistant's name, such as "from Table 3". */
  meta?: ReactNode;
}

function Message({ sender, name, icon, meta, children, ...props }: ChatMessageProps) {
  return (
    <MessageRoot
      data-sender={sender}
      {...props}
    >
      {sender === "user" ? (
        <MessageBubble>{children}</MessageBubble>
      ) : (
        <>
          {icon || name || meta ? (
            <MessageHeader>
              {icon}
              {name}
              {meta ? (
                <MessageMeta>
                  <span aria-hidden="true">· </span>
                  {meta}
                </MessageMeta>
              ) : null}
            </MessageHeader>
          ) : null}
          <MessageBody>{children}</MessageBody>
        </>
      )}
    </MessageRoot>
  );
}

const Citation = withProvider(ark.button, "citation", { defaultProps: { type: "button" } });

export type ChatCitationProps = ComponentProps<typeof Citation>;

const ActionLineRoot = withProvider(ark.div, "actionLine");
const ActionLineIndicator = withContext(ark.span, "actionLineIndicator");
const ActionLineText = withContext(ark.span, "actionLineText");
const ActionLineUndo = withContext(ark.button, "actionLineUndo", {
  defaultProps: { type: "button" },
});

export interface ChatActionLineProps extends ComponentProps<typeof ActionLineRoot> {
  /** Dims the line, strikes its text through and shows `undoneLabel` in place of the undo link. */
  undone?: boolean | undefined;
  /** Shows the undo link; leave it out when the action can't be undone. */
  onUndo?: (() => void) | undefined;
  /** @default <CheckIcon /> */
  icon?: ReactNode;
  /** @default "Undo" */
  undoLabel?: ReactNode;
  /** @default "Undone" */
  undoneLabel?: ReactNode;
}

function ActionLine({
  undone = false,
  onUndo,
  icon,
  undoLabel = "Undo",
  undoneLabel = "Undone",
  children,
  ...props
}: ChatActionLineProps) {
  // One button in both states, so focus stays on it after an undo.
  const undo = undone ? (
    <ActionLineUndo aria-disabled="true">{undoneLabel}</ActionLineUndo>
  ) : (
    onUndo && <ActionLineUndo onClick={() => onUndo()}>{undoLabel}</ActionLineUndo>
  );

  return (
    <ActionLineRoot
      data-undone={undone ? "" : undefined}
      {...props}
    >
      <ActionLineIndicator>{icon ?? <CheckIcon />}</ActionLineIndicator>
      <ActionLineText>{children}</ActionLineText>
      {undo}
    </ActionLineRoot>
  );
}

const TypingRoot = withProvider(ark.span, "typing", { defaultProps: { role: "status" } });

export type ChatTypingIndicatorProps = ComponentProps<typeof TypingRoot>;

function TypingIndicator({ children, ...props }: ChatTypingIndicatorProps) {
  return (
    <TypingRoot {...props}>
      {children}
      <Spinner
        variant="dots"
        color="fg.subtle"
        aria-hidden="true"
      />
    </TypingRoot>
  );
}

const SuggestionsRoot = withProvider(ark.div, "suggestions", { defaultProps: { role: "group" } });
const SuggestionsLabel = withContext(ark.p, "suggestionsLabel");

export interface ChatSuggestionsProps extends ComponentProps<typeof SuggestionsRoot> {
  /** Heading above the suggestions, such as "Try" or "Next"; it names the group. */
  label?: ReactNode;
}

function Suggestions({ label, children, ...props }: ChatSuggestionsProps) {
  const labelId = useId();
  return (
    <SuggestionsRoot
      aria-labelledby={label ? labelId : undefined}
      {...props}
    >
      {label ? <SuggestionsLabel id={labelId}>{label}</SuggestionsLabel> : null}
      {children}
    </SuggestionsRoot>
  );
}

const Suggestion = createSlotRecipeContext(tag).withProvider(ark.button, "root", {
  defaultProps: { type: "button" },
});

export type ChatSuggestionProps = ComponentProps<typeof Suggestion>;

export type { ChatComposerProps } from "./Composer";

export const Chat = {
  Message,
  Citation,
  ActionLine,
  TypingIndicator,
  Suggestions,
  Suggestion,
  Composer,
};
