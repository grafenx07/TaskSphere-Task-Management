'use client';

import { Search } from 'lucide-react';
import { TaskStatus } from '@/types';

interface TaskFiltersProps {
  filters: {
    status: string;
    search: string;
    sortBy: string;
    sortOrder: string;
  };
  setFilters: (filters: any) => void;
}

export default function TaskFilters({ filters, setFilters }: TaskFiltersProps) {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="">All Statuses</option>
        <option value={TaskStatus.TODO}>To Do</option>
        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
        <option value={TaskStatus.COMPLETED}>Completed</option>
        <option value={TaskStatus.ARCHIVED}>Archived</option>
      </select>

      <select
        value={`${filters.sortBy}-${filters.sortOrder}`}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split('-');
          setFilters({ ...filters, sortBy, sortOrder });
        }}
        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="createdAt-desc">Newest First</option>
        <option value="createdAt-asc">Oldest First</option>
        <option value="dueDate-asc">Due Date (Earliest)</option>
        <option value="dueDate-desc">Due Date (Latest)</option>
        <option value="priority-desc">Priority (High to Low)</option>
        <option value="priority-asc">Priority (Low to High)</option>
      </select>
    </div>
  );
}
