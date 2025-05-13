'use client';

import { Task } from '../page'; // Assuming Task interface is exported from page.tsx or a types file
import { useTheme } from '../contexts/ThemeContext';

interface TaskInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: () => void;
  onDelete: (taskId: string) => void;
  onStartSession: (taskId: string) => void;
}

export default function TaskInfoDialog({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  onStartSession,
}: TaskInfoDialogProps) {
  const { theme } = useTheme();

  if (!isOpen || !task) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-black'
        } rounded-2xl p-8 w-full max-w-2xl shadow-xl border`}>
        <h2 className="text-2xl font-bold mb-6">{task.title}</h2>
        <p className="text-lg mb-6 whitespace-pre-wrap break-words">{task.description}</p>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="font-medium">{task.category}</span>
          </div>
          <div className="flex justify-between">
            <span>Due Date:</span>
            <span className="font-medium">
              {new Date(task.dueDate).toISOString().split('T')[0].replace(/-/g, '/')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Focus Sessions:</span>
            <span className="font-medium">{task.completedFocusSessions}/{task.focusSessions}</span>
          </div>
          {task.completed && task.completedOn && (
            <div className="flex justify-between">
              <span>Completed On:</span>
              <span className="font-medium">
                {new Date(task.completedOn).toISOString().split('T')[0].replace(/-/g, '/')}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 md:gap-4">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Edit Task
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Delete
          </button>
          <button
            onClick={() => onStartSession(task.id)}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Start Focus Session
          </button>
        </div>
      </div>
    </div>
  );
}