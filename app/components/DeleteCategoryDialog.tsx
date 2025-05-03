'use client';

import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  categoryToDelete: string;
  onCategoryDeleted: () => void;
}

export default function DeleteCategoryDialog({ isOpen, onClose, userId, categoryToDelete, onCategoryDeleted }: DeleteCategoryDialogProps) {
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
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl transform transition-all">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Delete Category</h2>
        <p className="text-gray-600 mb-6">Are you sure you want to delete &ldquo;{categoryToDelete}&rdquo;? This action cannot be undone.</p>
        
        <div className="flex justify-end gap-3">
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