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

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.title}>フィルター</h2>
      
      <div className={styles.filterGroup}>
        <label htmlFor="repository-filter" className={styles.label}>リポジトリ</label>
        <input
          id="repository-filter"
          type="text"
          className={styles.input}
          placeholder="owner/repo"
          value={filters.repository || ''}
          onChange={(e) => handleChange('repository', e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="status-filter" className={styles.label}>状態</label>
        <select
          id="status-filter"
          className={styles.select}
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="">すべて</option>
          <option value="open">Open</option>
          <option value="draft">Draft</option>
          <option value="merged">Merged</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="assignee-filter" className={styles.label}>担当者</label>
        <input
          id="assignee-filter"
          type="text"
          className={styles.input}
          placeholder="username"
          value={filters.assignee || ''}
          onChange={(e) => handleChange('assignee', e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="search-filter" className={styles.label}>検索</label>
        <input
          id="search-filter"
          type="text"
          className={styles.input}
          placeholder="タイトル、説明..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>
    </div>
  );
}
