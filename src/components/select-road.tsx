// src/components/select-road.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getJalanPaginated,
  getJalanById,
  type JalanPublik,
} from "@/modules/analysis/data/jalan-publik";
import { useDebounce } from "@/hooks/use-debounce";

interface JalanSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const PAGE_SIZE = 20; // Load 20 items per page

export function JalanSelect({
  value,
  onValueChange,
  placeholder = "Pilih jalan...",
  disabled = false,
}: JalanSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search with 300ms delay
  const [page, setPage] = useState(0);
  const [jalanList, setJalanList] = useState<JalanPublik[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Find selected jalan data - ALWAYS fetch from database, NOT from filtered list
  // This ensures the selected value is ALWAYS displayed even when searching
  // This fixes bug #2: value tidak hilang saat search
  const selectedJalan = value ? getJalanById(value) : null;
  const displayValue = selectedJalan
    ? `${selectedJalan.namaJalan} (${selectedJalan.id.substring(0, 20)}...)`
    : placeholder;

  // Load data function
  const loadData = useCallback(
    (pageNum: number, query: string, reset: boolean = false) => {
      setIsLoading(true);

      // Simulate async loading (in real case, this could be API call)
      setTimeout(() => {
        const result = getJalanPaginated(pageNum, PAGE_SIZE, query);

        setJalanList((prev) =>
          reset ? result.data : [...prev, ...result.data]
        );
        setHasMore(result.hasMore);
        setTotal(result.total);
        setIsLoading(false);
      }, 100);
    },
    []
  );

  // Search effect - when debounced search query changes
  useEffect(() => {
    if (!open) return;

    // Load data with new search query
    const timer = setTimeout(() => {
      loadData(0, debouncedSearchQuery, true);
    }, 0);

    return () => clearTimeout(timer);
  }, [debouncedSearchQuery, open, loadData]);

  // Infinite scroll observer
  useEffect(() => {
    if (!open || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadData(nextPage, debouncedSearchQuery, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [open, hasMore, isLoading, page, debouncedSearchQuery, loadData]);

  const handleSelect = (jalanId: string) => {
    onValueChange(jalanId);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen) {
      // When opening, reset page and load initial data
      setPage(0);
      setHasMore(true);

      // Load initial data immediately
      loadData(0, debouncedSearchQuery, true);
    } else {
      // When closing, reset search query for next open
      setSearchQuery("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Cari nama jalan atau ID..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <CommandList className="max-h-75 overflow-y-auto">
            {jalanList.length === 0 && !isLoading ? (
              <CommandEmpty>
                {searchQuery
                  ? "Tidak ditemukan jalan yang cocok."
                  : "Tidak ada data jalan."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Menampilkan {jalanList.length} dari {total} jalan
                </div>
                {jalanList.map((jalan) => (
                  <CommandItem
                    key={jalan.id}
                    value={jalan.id}
                    onSelect={() => handleSelect(jalan.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === jalan.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{jalan.namaJalan}</span>
                      <span className="text-xs text-muted-foreground">
                        {jalan.id}
                      </span>
                    </div>
                  </CommandItem>
                ))}
                {/* Infinite scroll trigger */}
                {hasMore && (
                  <div
                    ref={observerTarget}
                    className="flex items-center justify-center py-2"
                  >
                    {isLoading && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memuat lebih banyak...
                      </div>
                    )}
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
