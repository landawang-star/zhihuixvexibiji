import { useState } from 'react';
import { motion } from 'framer-motion';
import { SearchBox } from '@/components/directory/SearchBox';
import { QuickAccess } from '@/components/directory/QuickAccess';
import { CategoryTree } from '@/components/directory/CategoryTree';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/common/Modal';
import { Plus, FolderPlus, Sparkles, Settings } from 'lucide-react';
import { useNoteStore } from '@/stores/useNoteStore';
import { useUIStore } from '@/stores/useUIStore';

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'note' | 'category'>('note');
  const { createCategory, createNote, setCurrentNote, currentCategory, categories } = useNoteStore();
  const { showToast, setSidebarOpen } = useUIStore();
  
  const handleOpenModal = (type: 'note' | 'category') => {
    setModalType(type);
    setShowModal(true);
  };
  
  const handleCreateCategory = (name: string) => {
    createCategory(name);
    showToast('分类创建成功！', 'success');
  };
  
  const handleCreateNote = (title: string) => {
    if (categories.length === 0) {
      showToast('请先创建一个分类', 'info');
      return;
    }
    const categoryId = currentCategory?.id || categories[0]?.id || '';
    const note = createNote(categoryId, title);
    setCurrentNote(note);
    showToast('笔记创建成功！', 'success');
    setSidebarOpen(false);
  };
  
  return (
    <>
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="w-[280px] h-full flex flex-col bg-white border-r border-gray-100"
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-gray-900 text-lg tracking-tight">智学笔记</span>
              <p className="text-xs text-gray-500 font-medium">AI 辅助学习</p>
            </div>
            <button
              onClick={() => useUIStore.getState().setCurrentView('home')}
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              首页
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="px-4 py-3">
          <SearchBox 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜索笔记..."
          />
        </div>
        
        {/* Quick Access */}
        <div className="px-4 pb-3">
          <QuickAccess />
        </div>
        
        {/* Category Tree */}
        <div className="flex-1 overflow-y-auto px-3">
          <CategoryTree />
        </div>
        
        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Button 
              variant="outline" 
              size="sm"
              className="justify-center gap-1.5 text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300"
              onClick={() => handleOpenModal('category')}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              分类
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="justify-center gap-1.5 text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300"
              onClick={() => handleOpenModal('note')}
            >
              <Plus className="w-3.5 h-3.5" />
              笔记
            </Button>
          </div>
          <Button
            className="w-full justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white btn-press"
            onClick={() => handleOpenModal('note')}
          >
            <Plus className="w-4 h-4" />
            新建笔记
          </Button>
          <button
            onClick={() => useUIStore.getState().setCurrentView('settings')}
            className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            设置
          </button>
        </div>
      </motion.aside>
      
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={modalType === 'note' ? handleCreateNote : handleCreateCategory}
        title={modalType === 'note' ? '新建笔记' : '新建分类'}
        placeholder={modalType === 'note' ? '输入笔记名称' : '输入分类名称'}
        confirmText={modalType === 'note' ? '创建笔记' : '创建分类'}
      />
    </>
  );
}
