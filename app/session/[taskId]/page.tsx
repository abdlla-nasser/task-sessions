'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Task } from '../../page';
import { use } from 'react';
import { auth } from '../../firebase';
import { useTheme } from '../../contexts/ThemeContext';

export default function SessionPage({ params }: { params: Promise<{ taskId: string }> }) {
  const [task, setTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    const fetchTaskAndSettings = async () => {
      const taskDoc = await getDoc(doc(db, 'tasks', resolvedParams.taskId));
      if (taskDoc.exists()) {
        setTask({ id: taskDoc.id, ...taskDoc.data() } as Task);
      }

      // Fetch user settings for focus duration
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const focusDuration = userData.settings?.focusDuration || 25;
          setTimeLeft(focusDuration * 60);
        }
      }
    };
    fetchTaskAndSettings();
  }, [resolvedParams.taskId]);

  const handleComplete = useCallback(async () => {
    if (task) {
      await updateDoc(doc(db, 'tasks', resolvedParams.taskId), {
        completedFocusSessions: (task.completedFocusSessions || 0) + 1
      });
      router.push('/');
    }
  }, [task, resolvedParams.taskId, router]);

  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      const id = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Auto complete the session without sound for now
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    }
    return () => {};
  }, [isPaused, timeLeft, handleComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handleCancel = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    router.push('/');
  };

  const handleReset = async () => {
    // Get current focus duration from user settings
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const focusDuration = userData.settings?.focusDuration || 25;
        setTimeLeft(focusDuration * 60);
      }
    }
    setIsPaused(true);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  if (!task) return <div>Loading...</div>;

  return (
    <div className={`min-h-screen p-8 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      <div className={`max-w-2xl mx-auto ${
        theme === 'dark'
          ? 'bg-gray-800 text-white'
          : 'bg-white'
      } rounded-2xl shadow-xl p-8`}>
        <h1 className={`text-3xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>{task.title}</h1>
        <div className="text-lg text-gray-600 mb-8">
          Focus Sessions: {task.completedFocusSessions}/{task.focusSessions}
        </div>
        
        <div className="text-6xl text-black font-bold text-center mb-8 font-mono">
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handlePauseResume}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            Complete Session
          </button>
        </div>
      </div>
    </div>
  );
}