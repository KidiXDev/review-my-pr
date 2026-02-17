"use client";

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AtSign, Phone } from "lucide-react";
import type { GroupParticipant } from "@/hooks/use-group-participants";

interface MentionTextareaProps extends Omit<
  React.ComponentProps<"textarea">,
  "onChange"
> {
  participants: GroupParticipant[];
  value: string;
  onChange: (value: string) => void;
}

const MentionTextarea = forwardRef<HTMLTextAreaElement, MentionTextareaProps>(
  ({ participants, value, onChange, className, ...props }, ref) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionStartIndex, setMentionStartIndex] = useState(-1);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [dropdownPos, setDropdownPos] = useState({
      top: 0,
      left: 0,
      width: 0,
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const setRefs = useCallback(
      (el: HTMLTextAreaElement | null) => {
        textareaRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      [ref],
    );

    const filteredParticipants = useMemo(() => {
      if (!mentionQuery) return participants.slice(0, 10);
      const q = mentionQuery.toLowerCase();
      return participants
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.phone.toLowerCase().includes(q),
        )
        .slice(0, 10);
    }, [participants, mentionQuery]);

    const updateDropdownPosition = useCallback(() => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }, []);

    useEffect(() => {
      if (!showDropdown) return;
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
      return () => {
        window.removeEventListener("scroll", updateDropdownPosition, true);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }, [showDropdown, updateDropdownPosition]);

    const insertMention = useCallback(
      (participant: GroupParticipant) => {
        const before = value.slice(0, mentionStartIndex);
        const after = value.slice(mentionStartIndex + mentionQuery.length + 1);
        const mention = `@${participant.phone}`;
        const newValue = `${before}${mention}${after}`;
        onChange(newValue);
        setShowDropdown(false);
        setMentionQuery("");
        setMentionStartIndex(-1);

        requestAnimationFrame(() => {
          if (textareaRef.current) {
            const pos = before.length + mention.length;
            textareaRef.current.selectionStart = pos;
            textareaRef.current.selectionEnd = pos;
            textareaRef.current.focus();
          }
        });
      },
      [value, mentionStartIndex, mentionQuery, onChange],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;
        onChange(newValue);

        const textBeforeCursor = newValue.slice(0, cursorPos);
        const atIndex = textBeforeCursor.lastIndexOf("@");

        if (atIndex !== -1) {
          const charBefore = atIndex > 0 ? textBeforeCursor[atIndex - 1] : " ";
          if (charBefore === " " || charBefore === "\n" || atIndex === 0) {
            const query = textBeforeCursor.slice(atIndex + 1);
            if (!/\s/.test(query)) {
              setMentionStartIndex(atIndex);
              setMentionQuery(query);
              setShowDropdown(true);
              setSelectedIndex(0);
              return;
            }
          }
        }

        setShowDropdown(false);
        setMentionQuery("");
        setMentionStartIndex(-1);
      },
      [onChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showDropdown || filteredParticipants.length === 0) return;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((i) =>
            i < filteredParticipants.length - 1 ? i + 1 : 0,
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((i) =>
            i > 0 ? i - 1 : filteredParticipants.length - 1,
          );
        } else if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          insertMention(filteredParticipants[selectedIndex]);
        } else if (e.key === "Escape") {
          e.preventDefault();
          setShowDropdown(false);
        }
      },
      [showDropdown, filteredParticipants, selectedIndex, insertMention],
    );

    useEffect(() => {
      if (!showDropdown) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node) &&
          textareaRef.current &&
          !textareaRef.current.contains(e.target as Node)
        ) {
          setShowDropdown(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [showDropdown]);

    const dropdown =
      showDropdown && filteredParticipants.length > 0
        ? createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "fixed",
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                zIndex: 9999,
              }}
              className={cn(
                "rounded-lg border border-zinc-200 dark:border-zinc-700",
                "bg-white dark:bg-zinc-900",
                "shadow-lg shadow-black/10 dark:shadow-black/30",
                "animate-in fade-in-0 zoom-in-95 duration-100",
                "overflow-hidden",
              )}
            >
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                <AtSign className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Mention a member
                </span>
              </div>
              <ScrollArea className="max-h-48">
                <div className="py-1">
                  {filteredParticipants.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      data-index={i}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                        i === selectedIndex &&
                          "bg-primary/10 text-primary dark:bg-primary/20",
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertMention(p);
                      }}
                      onMouseEnter={() => setSelectedIndex(i)}
                    >
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                          i === selectedIndex
                            ? "bg-primary/20 text-primary"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500",
                        )}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 overflow-hidden">
                        <span className="truncate font-medium text-sm leading-tight">
                          {p.name}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-zinc-400 leading-tight">
                          <Phone className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">+{p.phone}</span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>,
            document.body,
          )
        : null;

    return (
      <>
        <Textarea
          ref={setRefs}
          data-slot="input-group-control"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
            className,
          )}
          {...props}
        />
        <div ref={wrapperRef} className="absolute inset-x-0 bottom-0 h-0" />
        {dropdown}
      </>
    );
  },
);

MentionTextarea.displayName = "MentionTextarea";

export { MentionTextarea };
