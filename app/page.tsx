'use client';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TaskDialog from './components/TaskDialog';
import CategoryDialog from './components/CategoryDialog';
import EditCategoryDialog from './components/EditCategoryDialog';
import DeleteCategoryDialog from './components/DeleteCategoryDialog';

interface UserData {
  name: string;
  categories: string[];
  taskIds: string[];
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

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  // Add these new state variables at the top with other state declarations
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<string>('');
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState<string>('');

  const router = useRouter();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        setUser(currentUser);
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
          // Fetch initial tasks
          await fetchTasks(currentUser.uid);
        }
        
        const date = new Date();
        setCurrentDate(date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchTasks = async (userId: string) => {
    try {
      let tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );

      if (selectedCategory) {
        tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', userId),
          where('category', '==', selectedCategory)
        );
      }

      const querySnapshot = await getDocs(tasksQuery);
      const fetchedTasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        fetchedTasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks(user.uid);
    }
  }, [selectedCategory, user]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const refreshUserData = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    }
  };

  return (
    <div className="min-h-screen p-[2%] bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-row max-w-[1440px] mx-auto gap-[2%] min-h-[calc(100vh-4%)]">
        {/* Side Menu */}
        <div className="w-[20%] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-[2%] shadow-2xl relative z-10 h-fit">
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-white">Menu</h2>
            <Link 
              href="/settings" 
              className="flex items-center space-x-2 py-2 px-3 hover:bg-white/10 rounded-lg transition-all duration-300 group"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Categories</h2>
              <button 
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-300 group"
                onClick={() => setIsCategoryDialogOpen(true)}
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          
            <div className="space-y-1">
              {/* Default Categories */}
              <div className="flex justify-between items-center group">
                <button 
                  className={`py-2 px-3 rounded-lg transition-all duration-300 flex-grow text-left hover:bg-white/10 text-sm ${
                    selectedCategory === 'Today' ? 'bg-white/10 font-medium' : 'text-gray-300'
                  }`}
                  onClick={() => setSelectedCategory('Today')}
                >
                  Today
                </button>
              </div>
              <div className="flex justify-between items-center group">
                <button 
                  className={`py-2 px-3 rounded-lg transition-all duration-300 flex-grow text-left hover:bg-white/10 text-sm ${
                    selectedCategory === 'Tomorrow' ? 'bg-white/10 font-medium' : 'text-gray-300'
                  }`}
                  onClick={() => setSelectedCategory('Tomorrow')}
                >
                  Tomorrow
                </button>
              </div>
              <div className="flex justify-between items-center group">
                <button 
                  className={`py-2 px-3 rounded-lg transition-all duration-300 flex-grow text-left hover:bg-white/10 text-sm ${
                    selectedCategory === 'This Week' ? 'bg-white/10 font-medium' : 'text-gray-300'
                  }`}
                  onClick={() => setSelectedCategory('This Week')}
                >
                  This Week
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 my-2"></div>

              {/* User Created Categories */}
              {userData?.categories.map((category, index) => (
                <div key={index} className="flex justify-between items-center group">
                  <button 
                    className={`py-2 px-3 rounded-lg transition-all duration-300 flex-grow text-left hover:bg-white/10 text-sm ${
                      selectedCategory === category ? 'bg-white/10 font-medium' : 'text-gray-300'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                  <div className="flex space-x-1">
                    <button 
                      className="p-1.5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                      onClick={() => {
                        setSelectedCategoryToEdit(category);
                        setIsEditCategoryDialogOpen(true);
                      }}
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      className="p-1.5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                      onClick={() => {
                        setSelectedCategoryToDelete(category);
                        setIsDeleteCategoryDialogOpen(true);
                      }}
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-[78%] p-[2%] overflow-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-[2%] border border-white/20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl"></div>
              <div className="relative">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Welcome, {userData?.name}!
                    </h1>
                    <p className="text-slate-600 mt-1 tracking-wide">{currentDate}</p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsTaskDialogOpen(true)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Task</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <div key={task.id} className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-100/50 transform hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <h3 className="font-bold text-xl mb-3 text-slate-800">{task.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium group-hover:bg-blue-100/80 transition-colors">
                        {task.category}
                      </span>
                      <span className="text-slate-500 text-sm font-medium">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                        <span>Focus Sessions Progress</span>
                        <span className="font-medium">{task.completedFocusSessions}/{task.focusSessions}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${(task.completedFocusSessions / task.focusSessions) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  </div>
                ))}
              </div>
              </div>
          </div>
        </div>
      </div>

      
      {user && (
        <>
          <TaskDialog
            isOpen={isTaskDialogOpen}
            onClose={() => setIsTaskDialogOpen(false)}
            userId={user.uid}
          />
          <CategoryDialog
            isOpen={isCategoryDialogOpen}
            onClose={() => setIsCategoryDialogOpen(false)}
            userId={user.uid}
            currentCategories={userData?.categories || []}
            onCategoryAdded={refreshUserData}
          />
          <EditCategoryDialog
            isOpen={isEditCategoryDialogOpen}
            onClose={() => setIsEditCategoryDialogOpen(false)}
            userId={user.uid}
            categoryToEdit={selectedCategoryToEdit}
            onCategoryUpdated={refreshUserData}
          />
          <DeleteCategoryDialog
            isOpen={isDeleteCategoryDialogOpen}
            onClose={() => setIsDeleteCategoryDialogOpen(false)}
            userId={user.uid}
            categoryToDelete={selectedCategoryToDelete}
            onCategoryDeleted={refreshUserData}
          />
        </>
      )}
    </div>
  );
}
