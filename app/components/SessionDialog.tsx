'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '../page'; // Assuming Task interface is exported from page.tsx or a types file
import { useTheme } from '../contexts/ThemeContext';

interface SessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[]; // Pass all tasks, filtering will happen here or be pre-filtered
}

export default function SessionDialog({
  isOpen,
  onClose,
  tasks,
}: SessionDialogProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedTaskForSession, setSelectedTaskForSession] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const activeTasks = tasks.filter(task => !task.completed);

  const handleClose = () => {
    setSelectedTaskForSession(null);
    onClose();
  };

  const handleStartSession = () => {
    if (selectedTaskForSession) {
      router.push(`/session/${selectedTaskForSession}`);
      handleClose(); // Also resets selectedTaskForSession
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${
          theme === 'dark'
            ? 'bg-gray-950 border-gray-800 text-white'
            : 'bg-gray-100 text-black'
        } rounded-2xl p-8 w-full max-w-xl shadow-xl border`}>
        <h2 className="text-2xl font-semibold mb-6">Select Task for Session</h2>
        <div className="max-h-60 overflow-y-auto space-y-1 mb-6 pr-2">
          {activeTasks.length > 0 ? (
            activeTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTaskForSession(task.id)}
                className={`flex flex-row justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                  selectedTaskForSession === task.id
                    ? (theme === 'dark' ? 'bg-blue-900/50 border-blue-700' : 'bg-blue-100 border-blue-300')
                    : (theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50')
                }`}
              >
                <span className="font-medium">{task.title}</span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} block`}>
                  {task.category} - {task.completedFocusSessions}/{task.focusSessions} sessions
                </span>
              </div>
            ))
          ) : (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No active tasks available.</p>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleClose}
            className={`px-6 py-3 text-base font-medium rounded-xl hover:bg-opacity-80 transition-colors ${
              theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedTaskForSession}
            onClick={handleStartSession}
            className={`px-6 py-3 text-base font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 ${
              !selectedTaskForSession
                ? (theme === 'dark' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-400 text-gray-200 cursor-not-allowed')
                : 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600'
            }`}
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}