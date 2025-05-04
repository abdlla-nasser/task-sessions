'use client';

import { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useTheme } from '../contexts/ThemeContext';

interface EditTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  categories: string[];
  onTaskUpdated: () => void;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  focusSessions: number;
  completedFocusSessions: number;
  completed: boolean;
}

export default function EditTaskDialog({ isOpen, onClose, task, categories, onTaskUpdated }: EditTaskDialogProps) {
  const { theme } = useTheme();
  const [taskData, setTaskData] = useState<Task>(task);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        dueDate: taskData.dueDate,
        focusSessions: taskData.focusSessions
      });
      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white'
      } rounded-2xl p-8 w-full max-w-2xl shadow-xl border`}>
        <h2 className={`text-2xl font-semibold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Edit Task</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields with dark mode support */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-black'
            }`}>Title</label>
            <input
              type="text"
              required
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-black'
              }`}
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-black"
              rows={3}
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Category <span className="text-gray-400">(optional)</span>
            </label>
            <select
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
              value={taskData.category}
              onChange={(e) => setTaskData({...taskData, category: e.target.value})}
            >
              <option value="">No Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category} className="text-black">
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Due Date <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
              value={taskData.dueDate}
              onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Focus Sessions <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
              value={taskData.focusSessions}
              onChange={(e) => setTaskData({...taskData, focusSessions: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-base font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}