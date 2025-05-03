'use client';

import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface TaskData {
  title: string;
  description: string;
  category: string;
  dueDate: string;
  focusSessions: number;
  completedFocusSessions: number,
  completed: boolean,
  userId: string;
  createdAt: Date;
}

export default function TaskDialog({ isOpen, onClose, userId }: TaskDialogProps) {
  const [taskData, setTaskData] = useState<TaskData>({
    title: '',
    description: '',
    category: '',
    dueDate: '',
    focusSessions: 1,
    completedFocusSessions: 0,
    completed: false,
    userId: userId,
    createdAt: new Date(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'tasks'), taskData);
      onClose();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl transform transition-all">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={taskData.category}
              onChange={(e) => setTaskData({...taskData, category: e.target.value})}
              placeholder="Enter category"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={taskData.dueDate}
              onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Focus Sessions</label>
            <input
              type="number"
              min="1"
              required
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={taskData.focusSessions}
              onChange={(e) => setTaskData({...taskData, focusSessions: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
