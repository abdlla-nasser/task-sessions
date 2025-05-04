'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';

interface UserData {
  name: string;
  email: string;
  settings: {
    focusDuration: number;
    theme: 'light' | 'dark';
  };
}

export default function SettingsPage() {
  const [focusDuration, setFocusDuration] = useState(25);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          console.log(userData)
          // Get settings from user data
          setFocusDuration(userData.settings?.focusDuration || 25);
          setTheme(userData.settings?.theme || 'light');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        'settings.focusDuration': focusDuration,
        'settings.theme': theme
      });
      router.push('/');
    }
  };

  return (
    <div className={`min-h-screen p-8 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-950 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-gray-100 to-gray-200'
    }`}>
      <div className={`max-w-2xl mx-auto rounded-2xl shadow-xl p-8 ${
        theme === 'dark'
          ? 'bg-gray-950 border border-gray-800'
          : 'bg-gray-200'
      }`}>
        <h1 className={`text-3xl font-bold mb-8 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Settings</h1>
        
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Default Focus Session Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={focusDuration}
              onChange={(e) => setFocusDuration(Number(e.target.value))}
              className={`block w-full px-4 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className={`block w-full px-4 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              }`}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={() => router.push('/')}
              className={`px-6 py-2 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}