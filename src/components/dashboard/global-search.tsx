"use client";

import * as React from "react";
import { GitBranch, Users, Loader2 } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { searchGlobal } from "@/actions/search";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = React.useState<{
    repos: { id: string; name: string }[];
    groups: { id: string; name: string }[];
  }>({ repos: [], groups: [] });
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults({ repos: [], groups: [] });
        return;
      }

      setLoading(true);
      try {
        const data = await searchGlobal(debouncedQuery);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSelect = (id: string, type: "repo" | "group") => {
    setOpen(false);
    if (type === "repo") {
      router.push(`/dashboard/repos?id=${id}`);
    } else {
      router.push(`/dashboard/groups?id=${id}`);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search repositories...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Search for repositories and groups...
            </DialogDescription>
          </DialogHeader>
          <Command
            shouldFilter={false}
            className="**:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          >
            <CommandInput
              placeholder="Type a command or search..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  query.length >= 2 && "No results found."
                )}
              </CommandEmpty>
              {!query && (
                <CommandGroup heading="Suggestions">
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      router.push("/dashboard/repos");
                    }}
                    className="cursor-pointer"
                  >
                    <GitBranch className="mr-2 h-4 w-4" />
                    <span>Go to Repositories</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      router.push("/dashboard/groups");
                    }}
                    className="cursor-pointer"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span>Go to Groups</span>
                  </CommandItem>
                </CommandGroup>
              )}
              {query.length >= 2 &&
                (results.repos.length > 0 || results.groups.length > 0) && (
                  <>
                    {results.repos.length > 0 && (
                      <CommandGroup heading="Repositories">
                        {results.repos.map((repo) => (
                          <CommandItem
                            key={repo.id}
                            onSelect={() => handleSelect(repo.id, "repo")}
                          >
                            <GitBranch className="mr-2 h-4 w-4" />
                            <span>{repo.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    {results.groups.length > 0 && (
                      <CommandGroup heading="Groups">
                        {results.groups.map((group) => (
                          <CommandItem
                            key={group.id}
                            onSelect={() => handleSelect(group.id, "group")}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            <span>{group.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </>
                )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
