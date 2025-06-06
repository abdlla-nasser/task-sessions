'use client';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TaskDialog from './components/TaskDialog';
import SessionDialog from './components/SessionDialog'; // Import the new SessionDialog
import CategoryDialog from './components/CategoryDialog';
import EditCategoryDialog from './components/EditCategoryDialog';
import DeleteCategoryDialog from './components/DeleteCategoryDialog';
import EditTaskDialog from './components/EditTaskDialog';
import TaskInfoDialog from './components/TaskInfoDialog'; // Import the new component
import { useTheme } from './contexts/ThemeContext';

interface UserData {
  name: string;
  categories: string[];
  taskIds: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  focusSessions: number;
  completedFocusSessions: number;
  completed: boolean;
  completedOn?: string; // Add this field
}
export default function Home() {
  const [loading, setLoading] = useState( true );
  const [user, setUser] = useState<User | null>( null );
  const [userData, setUserData] = useState<UserData | null>( null );
  const [selectedCategory, setSelectedCategory] = useState<string>( "Inbox" );
  const [allTasks, setAllTasks] = useState<Task[]>( [] );
  const [filteredTasks, setFilteredTasks] = useState<Task[]>( [] );
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState( false );
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState( false );
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<string>( '' );
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState<string>( '' );
  const [isTaskInfoDialogOpen, setIsTaskInfoDialogOpen] = useState( false );
  const [selectedTask, setSelectedTask] = useState<Task | null>( null );
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState( false );
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState( false );
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState( false );
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState( false ); // New state for session dialog
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const { theme } = useTheme();
  const router = useRouter();

  useEffect( () => {
    const unsubscribe = onAuthStateChanged( auth, async ( currentUser ) => {
      if ( !currentUser ) {
        router.push( '/auth' );
      } else {
        setUser( currentUser );
        // Get user data from Firestore
        const userDoc = await getDoc( doc( db, 'users', currentUser.uid ) );
        if ( userDoc.exists() ) {
          setUserData( userDoc.data() as UserData );
          await fetchAllTasks( currentUser.uid );
        }
      }
      setLoading( false );
    } );

    return () => unsubscribe();
  }, [router, isTaskDialogOpen, isEditTaskDialogOpen] );

  const fetchAllTasks = async ( userId: string ) => {
    try {
      const tasksQuery = query(
        collection( db, 'tasks' ),
        where( 'userId', '==', userId )
      );
      const querySnapshot = await getDocs( tasksQuery );
      const fetchedTasks: Task[] = [];
      querySnapshot.forEach( ( doc ) => {
        fetchedTasks.push( { id: doc.id, ...doc.data() } as Task );
      } );
      setAllTasks( fetchedTasks );
      filterTasks( fetchedTasks, selectedCategory );
    } catch ( error ) {
      console.error( 'Error fetching tasks:', error );
    }
  };

  const filterTasks = ( tasks: Task[], category: string ) => {
    const today = new Date();
    today.setHours( 0, 0, 0, 0 );

    const tomorrow = new Date( today );
    tomorrow.setDate( tomorrow.getDate() + 1 );

    const startOfWeek = new Date( today );
    startOfWeek.setDate( startOfWeek.getDate() - startOfWeek.getDay() );
    startOfWeek.setHours( 0, 0, 0, 0 );

    const endOfWeek = new Date( startOfWeek );
    endOfWeek.setDate( endOfWeek.getDate() + 6 );
    endOfWeek.setHours( 23, 59, 59, 999 );

    let filtered: Task[];

    switch ( category ) {
      case 'Inbox':
        filtered = tasks;
        break;
      case 'Completed':
        filtered = tasks.filter( task => task.completed );
        break;
      case 'Today':
        filtered = tasks.filter( task => {
          const taskDate = new Date( task.dueDate );
          taskDate.setHours( 0, 0, 0, 0 );
          return taskDate.getTime() === today.getTime();
        } );
        break;
      case 'Tomorrow':
        filtered = tasks.filter( task => {
          const taskDate = new Date( task.dueDate );
          taskDate.setHours( 0, 0, 0, 0 );
          return taskDate.getTime() === tomorrow.getTime();
        } );
        break;
      case 'This Week':
        filtered = tasks.filter( task => {
          const taskDate = new Date( task.dueDate );
          taskDate.setHours( 0, 0, 0, 0 );
          return taskDate >= startOfWeek && taskDate <= endOfWeek;
        } );
        break;
      default:
        filtered = tasks.filter( task => task.category === category );
    }

    setFilteredTasks( filtered );
  };

  useEffect( () => {
    filterTasks( allTasks, selectedCategory );
  }, [selectedCategory, allTasks] );
  const handleTaskComplete = async ( e: React.ChangeEvent, taskId: string, completed: boolean ) => {
    e.stopPropagation();
    try {
      await updateDoc( doc( db, 'tasks', taskId ), {
        completed: !completed,
        completedOn: !completed ? new Date().toISOString() : null
      } );
      if ( user ) {
        await fetchAllTasks( user.uid );
      }
    } catch ( error ) {
      console.error( 'Error updating task:', error );
    }
  };

  const handleTaskDelete = async ( taskId: string ) => {
    try {
      await deleteDoc( doc( db, 'tasks', taskId ) );
      if ( user ) {
        await fetchAllTasks( user.uid );
      }
      setIsTaskInfoDialogOpen( false );
    } catch ( error ) {
      console.error( 'Error deleting task:', error );
    }
  };
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push( '/auth' );
    } catch ( error ) {
      console.error( 'Error signing out:', error );
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if ( loading ) {
    return (
      <div aria-label='loading' className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const refreshUserData = async () => {
    if ( user ) {
      const userDoc = await getDoc( doc( db, 'users', user.uid ) );
      if ( userDoc.exists() ) {
        console.log( userDoc.data() );
        setUserData( userDoc.data() as UserData );
      }
    }
  };

  return (
    <div className={`min-h-screen h-screen p-[2%] ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-950 to-gray-900'
        : 'bg-gradient-to-br from-gray-100 to-gray-200'
      }`}>
      <div className="flex flex-row max-w-[1440px] mx-auto gap-[2%] h-full">
        {/* Side Menu - Modified for mobile */}
        <div className={`
          ${isMobileMenuOpen 
            ? 'fixed inset-0 z-50 w-full h-full p-4 overflow-y-auto' 
            : 'hidden md:block md:w-[20%] md:relative md:overflow-y-auto'
          } 
          ${theme === 'dark'
            ? 'bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 text-white'
            : 'bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 text-black'
          } 
          rounded-2xl p-[2%] shadow-2xl z-10 flex flex-col
        `}>
          {isMobileMenuOpen && (
            <button
              aria-label="Close menu"
              className={`absolute top-4 right-4 p-2 rounded-full ${theme === 'dark' ? 'hover:bg-white/20' : 'hover:bg-black/10'}`}
              onClick={toggleMobileMenu}
            >
              <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <div className="mb-8">
            <Link
              href="/settings"
              className={`flex items-center space-x-2 py-2 px-3 hover:bg-white/10 rounded-lg transition-all duration-300 group ${theme === 'dark' ? 'text-gray-400' : 'text-black'
                }`}
              onClick={() => isMobileMenuOpen && toggleMobileMenu()} // Close menu on navigation
            >
              <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-black group-hover:text-gray-700'
                } transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'
                }`}>Projects</h2>
              <button
                aria-label="Add Category"
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-300 group"
                onClick={() => {
                  setIsCategoryDialogOpen(true);
                  if (isMobileMenuOpen) toggleMobileMenu(); // Close menu if open
                }}
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <div className="space-y-1">
              {/* Default Categories */}
              {['Inbox', 'Today', 'Tomorrow', 'This Week', 'Completed'].map(defaultCategory => (
                <div key={defaultCategory} className="flex justify-between items-center group">
                  <button
                    className={`py-2 px-3 rounded-lg transition-all duration-300 flex-grow text-left text-sm ${
                      selectedCategory === defaultCategory
                        ? theme === 'dark'
                          ? 'bg-white/10 font-medium text-gray-400 border border-blue-400'
                          : 'bg-white/5 font-medium text-black border border-black/50'
                        : theme === 'dark'
                          ? 'text-white hover:bg-white/10'
                          : 'text-black hover:bg-black/5'
                    }`}
                    onClick={() => {
                      setSelectedCategory(defaultCategory);
                      if (isMobileMenuOpen) toggleMobileMenu(); // Close menu on selection
                    }}
                  >
                    {defaultCategory}
                  </button>
                </div>
              ))}

              {/* User Created Categories */}
              {userData?.categories.map((category, index) => (
                <div key={index} className="flex justify-between items-center group">
                  <button
                    className={`py-2 px-3 rounded-lg transition-all duration-300 flex-grow text-left text-sm
                        ${
                          selectedCategory === category
                            ? theme === 'dark'
                              ? 'bg-white/10 font-medium text-gray-400 border border-blue-400'
                              : 'bg-white/5 font-medium text-black border border-black/50'
                            : theme === 'dark'
                              ? 'text-white hover:bg-white/10'
                              : 'text-black hover:bg-black/5'
                        }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      if (isMobileMenuOpen) toggleMobileMenu(); // Close menu on selection
                    }}
                  >
                    {category}
                  </button>
                  <div className="flex space-x-1">
                    <button
                      aria-label='Edit Category'
                      className="p-1.5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                      onClick={() => {
                        setSelectedCategoryToEdit(category);
                        setIsEditCategoryDialogOpen(true);
                        if (isMobileMenuOpen) toggleMobileMenu(); // Close menu
                      }}
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      aria-label='Delete Category'
                      className="p-1.5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                      onClick={() => {
                        setSelectedCategoryToDelete(category);
                        setIsDeleteCategoryDialogOpen(true);
                        if (isMobileMenuOpen) toggleMobileMenu(); // Close menu
                      }}
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) )}
            </div>
          </div>
          {/* Sign Out Button - Common for Desktop and Mobile Menu */}
          <div className="mt-auto pt-4 border-t border-gray-600/30 dark:border-gray-500/20">
            <button
              aria-label='sign out'
              onClick={() => {
                handleSignOut();
                if (isMobileMenuOpen) {
                  toggleMobileMenu();
                }
              }}
              className={`w-full flex items-center space-x-2 py-3 px-3 rounded-lg transition-all duration-300 group ${
                theme === 'dark'
                  ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                  : 'text-red-500 hover:bg-red-500/10 hover:text-red-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content - Modified for mobile */}
        <div className="flex flex-col justify-between w-full md:w-[78%] overflow-y-auto h-full">
          <div className={`${theme === 'dark'
              ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700/20'
              : 'bg-white/80 backdrop-blur-xl border-white/20'
            } rounded-2xl shadow-xl p-[2%] border relative h-full`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${theme === 'dark'
                ? 'from-gray-800/50 to-transparent'
                : 'from-white/50 to-transparent'
              } rounded-2xl`}></div>
            <div className="relative h-full flex flex-col justify-between">
              <div>
              <div className="mb-8 flex items-center"> {/* Flex container for hamburger and title */}
                <button
                  aria-label="Open menu"
                  className={`md:hidden mr-3 p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                  onClick={toggleMobileMenu}
                >
                  <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className={`text-3xl font-bold tracking-tight ${theme === 'dark'
                      ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                      : 'text-black'
                    }`}>
                    {selectedCategory}
                  </h1>
                </div>
              </div>
              {/* Tasks List - Modified for mobile */}
              <div className="space-y-1">
                {filteredTasks.map( ( task ) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTask( task );
                      setIsTaskInfoDialogOpen( true );
                    }}
                    className={`group ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 hover:border-blue-500/30'
                        : 'bg-white border-gray-200 hover:border-blue-100/50'
                      } rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 border cursor-pointer`}
                  >
                    <div className="flex items-center gap-3">
                      <div onClick={( e ) => e.stopPropagation()}>
                        <input
                          aria-label={`complete ${task.title}`}
                          type="checkbox"
                          checked={task.completed}
                          onChange={( e ) => handleTaskComplete( e, task.id, task.completed )}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-base font-medium ${task.completed
                              ? 'line-through text-gray-400'
                              : theme === 'dark' ? 'text-white' : 'text-black'
                            }`}>
                            {task.title}
                          </h3>
                          {/* Hide due date on mobile */}
                          <span className={`text-xs hidden md:inline ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>
                            {new Date( task.dueDate ).toISOString().split( 'T' )[0].replace( /-/g, '/' )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {/* Hide category on mobile */}
                          <span className={`hidden md:inline ${theme === 'dark'
                              ? 'bg-blue-900/50 text-blue-300'
                              : 'bg-blue-50 text-blue-700'
                            } px-1.5 py-0.5 rounded-full text-xs`}>
                            {task.category}
                          </span>
                          <div className={`flex items-center gap-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-black'
                            }`}>
                            <span>Focus:</span>
                            <span>{task.completedFocusSessions}/{task.focusSessions}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) )}
              </div>
              </div>
              {/* Action Buttons - smaller on mobile */}
              <div className="flex flex-wrap gap-2 md:gap-4 justify-end mt-4 md:mt-0">
                <button
                  onClick={() => setIsSessionDialogOpen(true)}
                  className="flex items-center space-x-1 md:space-x-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-lg md:rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Start Session</span>
                </button>
                <button
                  onClick={() => setIsTaskDialogOpen( true )}
                  className="flex items-center space-x-1 md:space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-lg md:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Task</span>
                </button>

              </div>
            </div>
          </div>
          <div>
          </div>
        </div>
      </div>
      {user && (
        <>
          <SessionDialog
            isOpen={isSessionDialogOpen}
            onClose={() => setIsSessionDialogOpen(false)}
            tasks={allTasks} // Pass all tasks, the component will filter active ones
          />
          <TaskInfoDialog
            isOpen={isTaskInfoDialogOpen}
            onClose={() => setIsTaskInfoDialogOpen(false)}
            task={selectedTask}
            onEdit={() => {
              setIsEditTaskDialogOpen(true);
              setIsTaskInfoDialogOpen(false); // Close info dialog when opening edit
            }}
            onDelete={handleTaskDelete} // Pass the existing delete handler
            onStartSession={(taskId) => {
              router.push(`/session/${taskId}`);
              setIsTaskInfoDialogOpen(false); // Close info dialog
            }}
          />
          {/* Edit Task Dialog */}
          {isEditTaskDialogOpen && selectedTask && (
            <EditTaskDialog
              isOpen={isEditTaskDialogOpen}
              onClose={() => setIsEditTaskDialogOpen( false )}
              task={selectedTask}
              categories={userData?.categories || []}
              onTaskUpdated={refreshUserData}
            />
          )}
          <TaskDialog
            isOpen={isTaskDialogOpen}
            onClose={() => setIsTaskDialogOpen( false )}
            userId={user?.uid || ''}
            categories={userData?.categories || []}
          />
          <CategoryDialog
            isOpen={isCategoryDialogOpen}
            onClose={() => setIsCategoryDialogOpen( false )}
            userId={user.uid}
            currentCategories={userData?.categories || []}
            onCategoryAdded={refreshUserData}
          />
          <EditCategoryDialog
            isOpen={isEditCategoryDialogOpen}
            onClose={() => setIsEditCategoryDialogOpen( false )}
            userId={user.uid}
            categoryToEdit={selectedCategoryToEdit}
            onCategoryUpdated={refreshUserData}
          />
          <DeleteCategoryDialog
            isOpen={isDeleteCategoryDialogOpen}
            onClose={() => setIsDeleteCategoryDialogOpen( false )}
            userId={user.uid}
            categoryToDelete={selectedCategoryToDelete}
            onCategoryDeleted={refreshUserData}
          />
        </>
      )}
    </div>
  );
}
