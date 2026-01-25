import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ChapbookFilters as FilterType, CHAPBOOK_GENRES, CHAPBOOK_FORMATS } from '@/types/chapbook';
import { Badge } from '@/components/ui/badge';

interface ChapbookFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClear: () => void;
}

const PRICE_RANGES = [
  { value: 'free', label: 'Free' },
  { value: 'under5', label: 'Under $5' },
  { value: '5to10', label: '$5 - $10' },
  { value: '10to20', label: '$10 - $20' },
  { value: 'over20', label: 'Over $20' },
];

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export function ChapbookFiltersComponent({ filters, onFiltersChange, onClear }: ChapbookFiltersProps) {
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const updateFilter = <K extends keyof FilterType>(key: K, value: FilterType[K] | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const FilterControls = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Genre</label>
        <Select
          value={filters.genre || 'all'}
          onValueChange={(v) => updateFilter('genre', v === 'all' ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genres</SelectItem>
            {CHAPBOOK_GENRES.map((genre) => (
              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Price Range</label>
        <Select
          value={filters.priceRange || 'all'}
          onValueChange={(v) => updateFilter('priceRange', v === 'all' ? undefined : v as FilterType['priceRange'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any price</SelectItem>
            {PRICE_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Format</label>
        <Select
          value={filters.format || 'all'}
          onValueChange={(v) => updateFilter('format', v === 'all' ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All formats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All formats</SelectItem>
            {CHAPBOOK_FORMATS.map((format) => (
              <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Country</label>
        <Input
          placeholder="e.g. USA, Kenya..."
          value={filters.country || ''}
          onChange={(e) => updateFilter('country', e.target.value || undefined)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Year</label>
        <Select
          value={filters.year?.toString() || 'all'}
          onValueChange={(v) => updateFilter('year', v === 'all' ? undefined : parseInt(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any year</SelectItem>
            {YEARS.map((year) => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={onClear}>
          <X className="w-4 h-4 mr-2" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-3">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search title or poet..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
            className="pl-9"
          />
        </div>

        {/* Quick filters - desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <Select
            value={filters.genre || 'all'}
            onValueChange={(v) => updateFilter('genre', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {CHAPBOOK_GENRES.map((genre) => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priceRange || 'all'}
            onValueChange={(v) => updateFilter('priceRange', v === 'all' ? undefined : v as FilterType['priceRange'])}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any price</SelectItem>
              {PRICE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.format || 'all'}
            onValueChange={(v) => updateFilter('format', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All formats</SelectItem>
              {CHAPBOOK_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile filters button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden relative">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterControls />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop advanced filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="hidden lg:flex relative">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Advanced
              {(filters.country || filters.year) && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {[filters.country, filters.year].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterControls />
            </div>
          </SheetContent>
        </Sheet>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="hidden lg:flex">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('search', undefined)} />
            </Badge>
          )}
          {filters.genre && (
            <Badge variant="secondary" className="gap-1">
              {filters.genre}
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('genre', undefined)} />
            </Badge>
          )}
          {filters.priceRange && (
            <Badge variant="secondary" className="gap-1">
              {PRICE_RANGES.find(r => r.value === filters.priceRange)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('priceRange', undefined)} />
            </Badge>
          )}
          {filters.format && (
            <Badge variant="secondary" className="gap-1">
              {CHAPBOOK_FORMATS.find(f => f.value === filters.format)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('format', undefined)} />
            </Badge>
          )}
          {filters.country && (
            <Badge variant="secondary" className="gap-1">
              {filters.country}
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('country', undefined)} />
            </Badge>
          )}
          {filters.year && (
            <Badge variant="secondary" className="gap-1">
              {filters.year}
              <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('year', undefined)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
