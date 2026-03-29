import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, User as UserIcon, Shield, Search, RefreshCw } from 'lucide-react';
import { User, Note, Theme } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  onBack: () => void;
  getAllUsers: () => Promise<User[]>;
  deleteUser: (userId: string) => Promise<void>;
  allNotes: Note[];
  theme: Theme;
}

export function AdminDashboard({ onBack, getAllUsers, deleteUser, allNotes, theme }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      await fetchUsers();
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNoteCount = (userId: string) => {
    return allNotes.filter(n => n.userId === userId).length;
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-app)] flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--bg-card)]/80 backdrop-blur-md px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-amber-900 dark:text-amber-100">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black text-amber-900 dark:text-amber-100 tracking-tight flex items-center gap-2">
              <Shield size={20} className="text-amber-600" />
              Admin Dashboard
            </h1>
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">User Management</p>
          </div>
        </div>
        <button 
          onClick={fetchUsers}
          className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-colors"
          title="Refresh Users"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {/* Search and Stats */}
      <div className="px-6 py-4 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search users by name, email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-app)] border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500 transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={16} />
        </div>
        <div className="flex gap-4">
          <div className="bg-[var(--bg-app)] px-4 py-2 rounded-2xl border border-[var(--border-color)]">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Total Users</p>
            <p className="text-xl font-black">{users.length}</p>
          </div>
          <div className="bg-[var(--bg-app)] px-4 py-2 rounded-2xl border border-[var(--border-color)]">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Total Notes</p>
            <p className="text-xl font-black">{allNotes.length}</p>
          </div>
        </div>
      </div>

      {/* Users List */}
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-amber-400 opacity-60">
            <UserIcon size={48} className="mb-4" />
            <p>No users found.</p>
          </div>
        ) : (
          filteredUsers.map((u) => (
            <motion.div
              layout
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-card)] p-5 rounded-[2rem] shadow-sm border border-[var(--border-color)] flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[var(--text-primary)] truncate">{u.displayName || 'Unnamed User'}</h3>
                  {u.isAdmin && (
                    <span className="text-[8px] font-black bg-amber-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Admin</span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] truncate mb-1">{u.email}</p>
                <p className="text-[10px] font-mono text-amber-600/50 truncate">ID: {u.id}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-black text-amber-600">{getNoteCount(u.id)}</p>
                  <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Notes</p>
                </div>
                {!u.isAdmin && (
                  <button
                    onClick={() => setUserToDelete(u)}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-colors"
                    title="Delete User"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </main>

      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User?"
        message={`Are you sure you want to delete ${userToDelete?.displayName} (${userToDelete?.email}) and all their ${getNoteCount(userToDelete?.id || '')} notes? This action cannot be undone.`}
        confirmText="Delete User"
        type="danger"
      />
    </div>
  );
}
