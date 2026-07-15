import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { SearchResults } from "@/components/search-results";
import { semanticSearch, type SearchResult } from "@/lib/search/semantic";
import { meetings } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/search")({
  head: () => ({ meta: [{ title: "Search — Clarity" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Perform search with debouncing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (q.trim()) {
        setIsLoading(true);
        try {
          const searchResults = await semanticSearch(q, meetings);
          setResults(searchResults);
        } catch (error) {
          console.error("[v0] Search error:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [q]);

  return (
    <>
      <AppHeader
        title="Search"
        subtitle="Semantic search across meetings with fuzzy matching and highlighted results"
      />
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
        {/* Search input */}
        <div className="rounded-2xl border border-border bg-surface p-3 flex items-center gap-3">
          <SearchIcon
            className="size-5 ml-2 text-muted-foreground shrink-0"
            strokeWidth={1.75}
          />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search meetings, decisions, risks, action items..."
            className="flex-1 bg-transparent text-base outline-none py-2"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-xs text-muted-foreground hover:text-foreground px-3 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search results or empty state */}
        <SearchResults results={results} isLoading={isLoading} query={q} />
      </div>
    </>
  );
}
