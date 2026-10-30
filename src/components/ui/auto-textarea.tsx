"use client";

import * as React from "react";
import { cn } from "cn";
import { Textarea } from "@/components/ui/textarea";
import { toSingleLine } from "@/lib/text";

function fitHeight(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight + element.offsetHeight - element.clientHeight}px`;
}

function AutoTextarea({
  className,
  maxLength,
  onChange,
  onKeyDown,
  ref,
  ...props
}: React.ComponentProps<"textarea">) {
  const elementRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [length, setLength] = React.useState(0);

  function setRef(element: HTMLTextAreaElement | null) {
    elementRef.current = element;

    if (typeof ref === "function") {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  }

  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    fitHeight(element);
    setLength(element.value.length);

    let width = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth !== width) {
        width = element.clientWidth;
        fitHeight(element);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const element = event.currentTarget;

    if (/[\r\n]/.test(element.value)) {
      const caret = toSingleLine(
        element.value.slice(0, element.selectionStart),
      ).length;

      element.value = toSingleLine(element.value);
      element.setSelectionRange(caret, caret);
    }

    fitHeight(element);
    setLength(element.value.length);
    onChange?.(event);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
    }

    onKeyDown?.(event);
  }

  const hasCounter = maxLength !== undefined;
  const nearLimit = hasCounter && length >= maxLength * 0.9;

  return (
    <div
      data-slot="auto-textarea"
      className="group/auto-textarea relative w-full min-w-0"
    >
      <Textarea
        ref={setRef}
        rows={1}
        maxLength={maxLength}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "field-sizing-fixed max-h-[calc(6lh_+_12px)] min-h-0 resize-none overflow-y-auto py-[5px] pointer-coarse:max-h-[calc(6lh_+_20px)] pointer-coarse:py-[9px]",
          hasCounter && "pr-16",
          className,
        )}
        {...props}
      />
      {hasCounter && (
        <span
          aria-hidden
          data-slot="auto-textarea-counter"
          className={cn(
            "text-muted-foreground pointer-events-none absolute right-2.5 bottom-1.5 text-xs tabular-nums opacity-0 transition-opacity group-focus-within/auto-textarea:opacity-100 pointer-coarse:bottom-3",
            nearLimit && "opacity-100",
            length >= maxLength && "text-destructive",
          )}
        >
          {length}/{maxLength}
        </span>
      )}
    </div>
  );
}

export { AutoTextarea };
