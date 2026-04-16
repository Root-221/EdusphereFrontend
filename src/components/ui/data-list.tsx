import { useState, useMemo } from 'react';
import { 
  Search, 
  Grid3X3, 
  List, 
  ChevronLeft, 
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataListProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterOptions?: { key: string; label: string; options: { value: string; label: string }[]; disableAll?: boolean; defaultValue?: string }[];
  defaultView?: 'list' | 'grid';
  gridItem?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  itemsPerPage?: number;
}

export function DataList<T extends { id: string | number }>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Rechercher...',
  filterOptions,
  defaultView = 'grid',
  gridItem,
  emptyMessage = 'Aucune donnée trouvée',
  itemsPerPage = 10,
}: DataListProps<T>) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'grid'>(defaultView);
  const [filters, setFilters] = useState<Record<string, string>>(() => {
    const defaultFilters: Record<string, string> = {};
    filterOptions?.forEach(f => {
      if (f.defaultValue) defaultFilters[f.key] = f.defaultValue;
    });
    return defaultFilters;
  });
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    let result = [...data];

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter((item) => 
          String(item[key as keyof T]).toLowerCase() === value.toLowerCase()
        );
      }
    });

    if (search && searchKey) {
      result = result.filter((item) =>
        String(item[searchKey as keyof T]).toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey as keyof T];
        const bVal = b[sortKey as keyof T];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, filters, sortKey, sortDirection, searchKey]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setSearch('');
    const defaultFilters: Record<string, string> = {};
    filterOptions?.forEach(f => {
      if (f.defaultValue) defaultFilters[f.key] = f.defaultValue;
    });
    setFilters(defaultFilters);
    setPage(1);
  };

  const getPageNumbers = (currentPage: number, total: number): number[] => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= total - 2) {
      return [total - 4, total - 3, total - 2, total - 1, total];
    }

    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-3 flex-wrap">
          {searchKey && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-10 bg-secondary border-0 focus-visible:ring-primary"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          )}

          {filterOptions?.map((filter) => (
            <Select
              key={filter.key}
              value={filters[filter.key] || ''}
              onValueChange={(value) => {
                setFilters({ ...filters, [filter.key]: value });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {!filter.disableAll && <SelectItem value="all">Tous</SelectItem>}
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {(search || filterOptions?.some(f => filters[f.key] !== (f.defaultValue || 'all'))) && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 border rounded-lg p-1 bg-card">
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : view === 'list' ? (
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                        col.sortable && "cursor-pointer hover:bg-muted/100 transition-colors select-none"
                      )}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-2">
                        {col.label}
                        {col.sortable && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                        {sortKey === col.key && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50",
                      index % 2 === 0 && "bg-muted/20"
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render ? col.render(item) : String(item[col.key as keyof T] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedData.map((item) => (
            <Card key={item.id} className="shadow-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {gridItem ? gridItem(item) : (
                  <div className="space-y-2">
                    {columns.slice(0, 3).map((col) => (
                      <div key={col.key}>
                        <p className="text-xs text-muted-foreground">{col.label}</p>
                        <p className="font-medium">
                          {col.render ? col.render(item) : String(item[col.key as keyof T] || '')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          {(page - 1) * itemsPerPage + 1} à {Math.min(page * itemsPerPage, filteredData.length)} sur {filteredData.length} résultat{filteredData.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {getPageNumbers(page, totalPages).map((pageNum) => (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
