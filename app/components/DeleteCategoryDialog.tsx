'use client';

import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  categoryToDelete: string;
  onCategoryDeleted: () => void;
}

export default function DeleteCategoryDialog({ isOpen, onClose, categoryToDelete, userId, onCategoryDeleted }: DeleteCategoryDialogProps) {
  const { theme } = useTheme();
  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        categories: arrayRemove(categoryToDelete)
      });
      
      onCategoryDeleted();
      onClose();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white'
      } rounded-2xl p-8 w-full max-w-md shadow-xl border`}>
        <h2 className={`text-2xl font-semibold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Delete Category</h2>
        
        <p className={`mb-6 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Are you sure you want to delete the category &quot;{categoryToDelete}&quot;? This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}