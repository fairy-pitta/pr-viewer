// presentation/web/components/filters/FilterSidebar.tsx
'use client';

import { useState } from 'react';
import styles from './FilterSidebar.module.css';

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  repository?: string;
  status?: string;
  assignee?: string;
  search?: string;
}

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({});

  const handleChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange?.({});
  };

  const hasFilters = Object.values(filters).some(v => v);

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>Filters</h2>
        {hasFilters && (
          <button className={styles.clearButton} onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Repository
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="owner/repo"
          value={filters.repository || ''}
          onChange={(e) => handleChange('repository', e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Status
        </label>
        <select
          className={styles.select}
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="draft">Draft</option>
          <option value="merged">Merged</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Assignee
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="username"
          value={filters.assignee || ''}
          onChange={(e) => handleChange('assignee', e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="Title, description..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>
    </div>
  );
}
