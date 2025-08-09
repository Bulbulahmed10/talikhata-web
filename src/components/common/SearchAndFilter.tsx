import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, FILTER_OPTIONS } from "@/constants";
import { SortOption, FilterOption } from "@/types";

interface SearchAndFilterProps {
  onSearch?: (query: string) => void;
  onSort?: (sortBy: SortOption) => void;
  onFilter?: (filterBy: FilterOption) => void;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  sortOptions?: { value: SortOption; label: string }[];
  filterOptions?: { value: FilterOption; label: string }[];
  className?: string;
  showClearButton?: boolean;
  showSortAndFilter?: boolean;
}

const SearchAndFilter = ({
  onSearch,
  onSort,
  onFilter,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  sortOptions = [
    { value: SORT_OPTIONS.DATE_DESC, label: "Latest First" },
    { value: SORT_OPTIONS.DATE_ASC, label: "Oldest First" },
    { value: SORT_OPTIONS.AMOUNT_DESC, label: "Highest Amount" },
    { value: SORT_OPTIONS.AMOUNT_ASC, label: "Lowest Amount" },
  ],
  filterOptions = [
    { value: FILTER_OPTIONS.ALL, label: "All" },
    { value: FILTER_OPTIONS.RECEIVED, label: "Received" },
    { value: FILTER_OPTIONS.GIVEN, label: "Given" },
  ],
  className,
  showClearButton = true,
  showSortAndFilter = true,
}: SearchAndFilterProps) => {
  const [searchQuery, setSearchQuery] = useState(searchValue || "");
  const [selectedSort, setSelectedSort] = useState<SortOption>(SORT_OPTIONS.DATE_DESC);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(FILTER_OPTIONS.ALL);

  // Handle controlled vs uncontrolled search
  const currentSearchValue = searchValue !== undefined ? searchValue : searchQuery;
  const handleSearchChange = (value: string) => {
    if (searchValue !== undefined) {
      // Controlled component
      onSearchChange?.(value);
    } else {
      // Uncontrolled component
      setSearchQuery(value);
      onSearch?.(value);
    }
  };

  useEffect(() => {
    if (onSearch && searchValue === undefined) {
      onSearch(searchQuery);
    }
  }, [searchQuery, onSearch, searchValue]);

  const handleSortChange = (value: SortOption) => {
    setSelectedSort(value);
    onSort?.(value);
  };

  const handleFilterChange = (value: FilterOption) => {
    setSelectedFilter(value);
    onFilter?.(value);
  };

  const clearAll = () => {
    if (searchValue !== undefined) {
      onSearchChange?.("");
    } else {
      setSearchQuery("");
    }
    setSelectedSort(SORT_OPTIONS.DATE_DESC);
    setSelectedFilter(FILTER_OPTIONS.ALL);
    onSearch?.("");
    onSort?.(SORT_OPTIONS.DATE_DESC);
    onFilter?.(FILTER_OPTIONS.ALL);
  };

  const hasActiveFilters = currentSearchValue || selectedSort !== SORT_OPTIONS.DATE_DESC || selectedFilter !== FILTER_OPTIONS.ALL;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={currentSearchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {showSortAndFilter && (
          <div className="flex gap-2">
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showClearButton && hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {hasActiveFilters && showSortAndFilter && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {currentSearchValue && (
            <span className="bg-secondary px-2 py-1 rounded">
              Search: "{currentSearchValue}"
            </span>
          )}
          {selectedFilter !== FILTER_OPTIONS.ALL && (
            <span className="bg-secondary px-2 py-1 rounded">
              Filter: {filterOptions.find(f => f.value === selectedFilter)?.label}
            </span>
          )}
          {selectedSort !== SORT_OPTIONS.DATE_DESC && (
            <span className="bg-secondary px-2 py-1 rounded">
              Sort: {sortOptions.find(s => s.value === selectedSort)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
