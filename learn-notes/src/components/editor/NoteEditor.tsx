import { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ChevronLeft, Save, Home,
  CheckCircle2, Clock, AlertCircle, Star 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AIPanel } from '@/components/ai/AIPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { UnsavedModal } from '@/components/common/Modal';
import { useNoteStore } from '@/stores/useNoteStore';
import { useUIStore } from '@/stores/useUIStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

export function NoteEditor() {
  const { currentNote, updateNote, categories, toggleFavorite } = useNoteStore();
  const { aiPanelOpen, toggleAIPanel, showToast, setCurrentView, setHasUnsavedChanges, pendingView, setPendingView } = useUIStore();
  const isMobile = useIsMobile();
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  
  // 记录上次保存的内容快照，用于检测是否有未保存更改
  const lastSavedContent = useRef<string>('');
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '在这里开始编写你的笔记...',
      }),
    ],
    content: currentNote?.content || '',
    onUpdate: () => {
      setSaveStatus('unsaved');
      setHasUnsavedChanges(true);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px]',
      },
    },
  });
  
  // 手动保存
  const handleSave = useCallback(async () => {
    if (!currentNote || !editor) return;
    
    setSaveStatus('saving');
    try {
      const html = editor.getHTML();
      updateNote(currentNote.id, { 
        content: html,
        title: currentNote.title 
      });
      lastSavedContent.current = html;
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      showToast('保存成功', 'success');
    } catch (error) {
      setSaveStatus('error');
      showToast('保存失败，请重试', 'error');
    }
  }, [currentNote, editor, updateNote, showToast, setHasUnsavedChanges]);
  
  // 保存并执行后续操作
  const handleSaveAndProceed = useCallback(() => {
    setShowUnsavedModal(false);
    if (currentNote && editor) {
      const html = editor.getHTML();
      updateNote(currentNote.id, { 
        content: html,
        title: currentNote.title 
      });
      lastSavedContent.current = html;
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      showToast('保存成功', 'success');
    }
    if (pendingView) {
      setCurrentView(pendingView);
      setPendingView(null);
    }
  }, [currentNote, editor, updateNote, showToast, setHasUnsavedChanges, pendingView, setCurrentView, setPendingView]);
  
  // 不保存直接离开
  const handleDiscardAndProceed = useCallback(() => {
    setShowUnsavedModal(false);
    setSaveStatus('saved');
    setHasUnsavedChanges(false);
    lastSavedContent.current = editor?.getHTML() || '';
    if (pendingView) {
      setCurrentView(pendingView);
      setPendingView(null);
    }
  }, [editor, setHasUnsavedChanges, pendingView, setCurrentView, setPendingView]);
  
  // 取消离开
  const handleCancelLeave = useCallback(() => {
    setShowUnsavedModal(false);
    setPendingView(null);
  }, [setPendingView]);
  
  // 带未保存检测的视图切换
  const navigateTo = useCallback((view: 'home' | 'notes' | 'ai' | 'settings') => {
    if (saveStatus === 'unsaved') {
      setPendingView(view);
      setShowUnsavedModal(true);
    } else {
      setCurrentView(view);
    }
  }, [saveStatus, setCurrentView, setPendingView]);
  
  // 快捷键保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);
  
  // 切换笔记时重置状态
  useEffect(() => {
    if (editor && currentNote) {
      editor.commands.setContent(currentNote.content || '');
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      lastSavedContent.current = currentNote.content || '';
    }
  }, [currentNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // 监听外部导航请求（来自 BottomNav、MobileHeader 等）
  useEffect(() => {
    if (pendingView && saveStatus === 'unsaved') {
      setShowUnsavedModal(true);
    } else if (pendingView) {
      setCurrentView(pendingView);
      setPendingView(null);
    }
  }, [pendingView]); // eslint-disable-line react-hooks/exhaustive-deps
  
  if (!currentNote) {
    return <EmptyState />;
  }
  
  const currentCategory = categories.find((c) => c.id === currentNote.categoryId);
  
  return (
    <div className="flex h-full bg-white">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {isMobile && (
              <Button variant="ghost" size="icon" className="flex-shrink-0 -ml-2" onClick={() => navigateTo('notes')}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="min-w-0">
              {currentCategory && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
                  <span>{currentCategory.emoji}</span>
                  <span className="font-medium">{currentCategory.name}</span>
                  <span className="text-gray-300">/</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Save Status */}
            <div className="flex items-center gap-2 mr-2">
              <AnimatePresence mode="wait">
                {saveStatus === 'saved' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-1.5 text-xs text-green-600"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">已保存</span>
                  </motion.div>
                )}
                {saveStatus === 'saving' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-1.5 text-xs text-gray-500"
                  >
                    <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="hidden sm:inline">保存中...</span>
                  </motion.div>
                )}
                {saveStatus === 'unsaved' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-1.5 text-xs text-amber-600"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">未保存</span>
                  </motion.div>
                )}
                {saveStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-1.5 text-xs text-red-600"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">保存失败</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Save Button */}
            <Button
              variant={saveStatus === 'unsaved' ? 'default' : 'outline'}
              size="sm"
              onClick={handleSave}
              disabled={saveStatus === 'saved' || saveStatus === 'saving'}
              className={saveStatus === 'unsaved' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              <Save className="w-4 h-4 mr-1.5" />
              保存
              <span className="hidden sm:inline text-xs opacity-60 ml-1">(Ctrl+S)</span>
            </Button>
            
            {/* 收藏按钮 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => currentNote && toggleFavorite(currentNote.id)}
              className={currentNote?.isFavorite ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}
              title={currentNote?.isFavorite ? '取消收藏' : '收藏笔记'}
            >
              <Star className={cn('w-4 h-4', currentNote?.isFavorite && 'fill-current')} />
            </Button>
            
            {/* 返回首页按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTo('home')}
              className="border-gray-200 hover:bg-gray-50"
            >
              <Home className="w-4 h-4 mr-1.5" />
              首页
            </Button>
            
            <Button
              variant={aiPanelOpen ? 'default' : 'outline'}
              size="sm"
              onClick={toggleAIPanel}
              className={aiPanelOpen ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              AI整理
            </Button>
          </div>
        </header>
        
        {/* Title Input */}
        <div className="px-4 lg:px-6 pt-6 pb-2">
          <input
            type="text"
            value={currentNote.title}
            onChange={(e) => {
              updateNote(currentNote.id, { title: e.target.value });
              setSaveStatus('unsaved');
              setHasUnsavedChanges(true);
            }}
            className="w-full text-3xl lg:text-4xl font-bold bg-transparent border-none outline-none placeholder-gray-300 text-gray-900 tracking-tight"
            placeholder="笔记标题"
          />
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>创建于 {new Date(currentNote.createdAt).toLocaleDateString('zh-CN')}</span>
            {lastSaved && (
              <>
                <span>•</span>
                <span>最后保存 {lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 lg:px-6 py-4">
            <EditorContent editor={editor} className="min-h-full" />
          </div>
        </div>
      </div>
      
      {/* AI Panel */}
      <AnimatePresence>
        {aiPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="border-l border-gray-100 bg-white flex flex-col overflow-hidden"
          >
            <AIPanel note={currentNote} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 未保存提醒弹窗 */}
      <UnsavedModal
        open={showUnsavedModal}
        onSave={handleSaveAndProceed}
        onDiscard={handleDiscardAndProceed}
        onCancel={handleCancelLeave}
      />
    </div>
  );
}
