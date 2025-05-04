'use client';

import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useTheme } from '../contexts/ThemeContext';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  categories?: string[];
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

export default function TaskDialog({ isOpen, onClose, userId, categories = [] }: TaskDialogProps) {
  const { theme } = useTheme();
  const [taskData, setTaskData] = useState<TaskData>({
    title: '',
    description: '',
    category: '', // Default to Inbox if no categories
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
      // Add the task to tasks collection
      const taskRef = await addDoc(collection(db, 'tasks'), taskData);
      
      // Update user's taskIds array with the new task ID
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        taskIds: arrayUnion(taskRef.id)
      });
      onClose();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${
        theme === 'dark'
          ? 'bg-gray-950 border-gray-800'
          : 'bg-gray-100'
      } rounded-2xl p-8 w-full max-w-2xl shadow-xl border`}>
        <h2 className={`text-2xl font-semibold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>Create New Task</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-black'
            }`}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-black'
              }`}
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-black'
            }`}>
              Description <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>(optional)</span>
            </label>
            <textarea
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-black'
              }`}
              rows={3}
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-black'
            }`}>
              Category <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>(optional)</span>
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-black'
              } ${categories.length === 0 ? 'cursor-not-allowed opacity-60' : ''}`}
              value={taskData.category}
              onChange={(e) => setTaskData({...taskData, category: e.target.value})}
              disabled={categories.length === 0}
            >
              {/* <option value="Inbox" className={theme === 'dark' ? 'text-white' : 'text-black'}>Inbox</option> */}
              {categories.map((category, index) => (
                <option key={index} value={category} className={theme === 'dark' ? 'text-white' : 'text-black'}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-black'
            }`}>
              Due Date <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>(optional)</span>
            </label>
            <input
              type="date"
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-black'
              }`}
              value={taskData.dueDate}
              onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-black'
            }`}>
              Focus Sessions <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>(optional)</span>
            </label>
            <input
              type="number"
              min="1"
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-black'
              }`}
              value={taskData.focusSessions}
              onChange={(e) => setTaskData({...taskData, focusSessions: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 text-base font-medium rounded-xl hover:bg-gray-100 transition-colors ${
                theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-700 hover:text-black'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
