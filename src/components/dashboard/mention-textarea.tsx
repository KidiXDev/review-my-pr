"use client";

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { AtSign, Phone } from "lucide-react";
import type { GroupParticipant } from "@/hooks/use-group-participants";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MentionTextareaProps extends Omit<
  React.ComponentProps<"textarea">,
  "onChange"
> {
  participants: GroupParticipant[];
  groups?: { groupId: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
}

const MentionTextarea = forwardRef<HTMLTextAreaElement, MentionTextareaProps>(
  (
    { participants, groups = [], value, onChange, className, ...props },
    ref,
  ) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionStartIndex, setMentionStartIndex] = useState(-1);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [dropdownWidth, setDropdownWidth] = useState(0);
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

    useEffect(() => {
      if (!showDropdown || !wrapperRef.current) return;
      setDropdownWidth(wrapperRef.current.offsetWidth);
    }, [showDropdown]);

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

    // Scroll selected item into view
    useEffect(() => {
      if (!showDropdown) return;
      const selectedElement = document.getElementById(
        `mention-item-${selectedIndex}`,
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }, [selectedIndex, showDropdown]);

    const dropdown = (
      <Popover
        open={showDropdown && filteredParticipants.length > 0}
        onOpenChange={setShowDropdown}
        modal={false}
      >
        <PopoverAnchor asChild>
          <div ref={wrapperRef} className="absolute inset-x-0 bottom-0 h-0" />
        </PopoverAnchor>
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          // Stop wheel event from reaching the Dialog's scroll-lock interceptors
          onWheel={(e) => e.stopPropagation()}
          className={cn(
            "p-0 rounded-lg border border-zinc-200 dark:border-zinc-700",
            "bg-white dark:bg-zinc-900",
            "shadow-lg shadow-black/10 dark:shadow-black/30",
            "overflow-hidden isolate pointer-events-auto",
          )}
          style={{ width: dropdownWidth || "auto" }}
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <AtSign className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Mention a member
            </span>
          </div>
          <ScrollArea
            className="h-48"
            onWheel={(e: React.WheelEvent) => e.stopPropagation()}
          >
            <div className="py-1">
              {filteredParticipants.map((p, i) => (
                <button
                  key={p.id}
                  id={`mention-item-${i}`}
                  type="button"
                  data-index={i}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    i === selectedIndex && "bg-zinc-100 dark:bg-zinc-800",
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    insertMention(p);
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      i === selectedIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500",
                    )}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0 overflow-hidden flex-1">
                    <span className="truncate font-medium text-sm leading-tight">
                      {p.name}
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400 leading-tight">
                        <Phone className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">+{p.phone}</span>
                      </span>

                      {p.groupIds &&
                        p.groupIds.length > 0 &&
                        groups.length > 0 && (
                          <div className="flex gap-1 overflow-hidden">
                            {p.groupIds.map((gid) => {
                              const groupName = groups.find(
                                (g) => g.groupId === gid,
                              )?.name;
                              if (!groupName) return null;
                              return (
                                <span
                                  key={gid}
                                  className="text-[9px] px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 truncate max-w-[80px]"
                                  title={groupName}
                                >
                                  {groupName}
                                </span>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );

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
        {dropdown}
      </>
    );
  },
);

MentionTextarea.displayName = "MentionTextarea";

export { MentionTextarea };
