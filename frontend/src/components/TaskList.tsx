'use client';

import { Task } from '@/types';
import { Edit2, Trash2, CheckCircle } from 'lucide-react';
import { getStatusColor, getStatusLabel, formatDate, getPriorityColor } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function TaskList({ tasks, loading, onEdit, onDelete, onToggle }: TaskListProps) {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">No tasks found. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {tasks.map((task) => (
        <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>

              {task.description && (
                <p className="mt-2 text-sm text-gray-600">{task.description}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span>Due: {formatDate(task.dueDate)}</span>
                <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                  Priority: {task.priority}
                </span>
                {task.completedAt && (
                  <span className="text-green-600">
                    Completed: {formatDate(task.completedAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={() => onToggle(task.id)}
                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                title="Toggle status"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit task"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete task"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
