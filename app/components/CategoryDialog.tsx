'use client';

import { useState } from 'react';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentCategories: string[];
  onCategoryAdded: () => void;
}

export default function CategoryDialog({ isOpen, onClose, userId, onCategoryAdded  }: CategoryDialogProps) {
  const { theme } = useTheme();
  const [categoryName, setCategoryName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        categories: arrayUnion(categoryName)
      });
      
      // Fetch updated user data
      const updatedUserDoc = await getDoc(userRef);
      if (updatedUserDoc.exists()) {
        // Trigger callback to update parent component
        onCategoryAdded();
      }
      
      setCategoryName('');
      onClose();
    } catch (error) {
      console.error('Error adding category:', error);
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
        }`}>Create New Category</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-black'
            }`}>
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-black'
              }`}
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
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
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}