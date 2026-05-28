import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Star, Clock, TrendingUp,
  Plus, Sparkles, ChevronRight, Target
} from 'lucide-react';
import { useNoteStore } from '@/stores/useNoteStore';
import { useUIStore } from '@/stores/useUIStore';
import { Modal } from '@/components/common/Modal';
import { VideoAnalysisCard } from '@/components/video/VideoAnalysisCard';
import { cn, formatDate } from '@/lib/utils';

export function HomePage() {
  const { notes, categories, getRecentNotes, setCurrentNote, createNote } = useNoteStore();
  const { setCurrentView, showToast } = useUIStore();
  const [greeting, setGreeting] = useState('你好');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  // 根据时间设置问候语
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) setGreeting('夜深了');
    else if (hour < 9) setGreeting('早上好');
    else if (hour < 12) setGreeting('上午好');
    else if (hour < 14) setGreeting('中午好');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');
  }, []);
  
  const recentNotes = getRecentNotes(5);
  const favoriteNotes = notes.filter(n => n.isFavorite).slice(0, 5);

  // 统计数据
  const today = new Date().toDateString();
  const todayNotes = notes.filter(n => new Date(n.updatedAt).toDateString() === today).length;
  const thisWeekNotes = notes.filter(n => {
    const noteDate = new Date(n.updatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return noteDate >= weekAgo;
  }).length;
  
  // 学习进度（按字数计算）
  const totalWords = notes.reduce((sum, n) => {
    const text = n.content.replace(/<[^>]*>/g, '');
    return sum + text.length;
  }, 0);
  
  const handleCreateNote = () => {
    if (categories.length === 0) {
      showToast('请先创建一个分类', 'info');
      return;
    }
    setShowCreateModal(true);
  };
  
  const handleCreateNoteConfirm = (title: string) => {
    const note = createNote(categories[0].id, title);
    setCurrentNote(note);
    setCurrentView('notes');
    showToast('笔记创建成功！', 'success');
  };
  
  const handleOpenNote = (note: any) => {
    setCurrentNote(note);
    setCurrentView('notes');
  };
  
  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
        {/* 欢迎区域 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {greeting}，开始今天的学习吧
          </h1>
          <p className="text-gray-500">
            你共有 {notes.length} 篇笔记，分布在 {categories.length} 个分类中
          </p>
        </motion.div>
        
        {/* 快捷操作 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <QuickActionCard
            icon={Plus}
            label="新建笔记"
            color="bg-indigo-600"
            onClick={handleCreateNote}
          />
          <QuickActionCard
            icon={Sparkles}
            label="AI 整理"
            color="bg-purple-600"
            onClick={() => {
              if (notes.length === 0) {
                showToast('先创建一篇笔记吧', 'info');
              } else {
                setShowAIModal(true);
              }
            }}
          />
        </motion.div>
        
        {/* 统计卡片 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={FileText}
            label="总笔记"
            value={notes.length}
            trend={todayNotes > 0 ? `+${todayNotes} 今日` : undefined}
          />
          <StatCard
            icon={Clock}
            label="本周编辑"
            value={thisWeekNotes}
            suffix="篇"
          />
          <StatCard
            icon={Target}
            label="总字数"
            value={totalWords > 1000 ? (totalWords / 1000).toFixed(1) : totalWords}
            suffix={totalWords > 1000 ? 'k' : ''}
          />
          <StatCard
            icon={Star}
            label="收藏笔记"
            value={favoriteNotes.length}
            suffix="篇"
          />
        </motion.div>

        {/* 视频转笔记 */}
        <VideoAnalysisCard />

        {/* 内容区域 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 最近编辑 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                最近编辑
              </h2>
              <button 
                onClick={() => setCurrentView('notes')}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                查看全部
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {recentNotes.length === 0 ? (
              <EmptyState text="还没有笔记，点击上方按钮创建" />
            ) : (
              <div className="space-y-2">
                {recentNotes.map((note, index) => (
                  <motion.button
                    key={note.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    onClick={() => handleOpenNote(note)}
                    className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-sm transition-shadow text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{note.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(note.updatedAt)}
                      </p>
                    </div>
                    {note.isFavorite && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* 学习建议 */}
        {notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-indigo-50 rounded-2xl p-5"
          >
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              学习建议
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <SuggestionCard title="整理笔记" desc="将相似主题的笔记归类，建立知识体系" />
              <SuggestionCard title="定期回顾" desc="每周花时间回顾学过的知识，加深记忆" />
              <SuggestionCard title="实践应用" desc="尝试将学到的知识应用到实际项目中" />
            </div>
          </motion.div>
        )}

        {/* 创建笔记弹窗 */}
        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateNoteConfirm}
          title="新建笔记"
          placeholder="输入笔记名称"
          confirmText="创建笔记"
        />

        {/* AI 整理笔记选择 */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowAIModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">选择要整理的笔记</h3>
                <p className="text-sm text-gray-500 mt-1">AI 将分析并整理选中笔记的内容</p>
              </div>
              <div className="p-3 max-h-80 overflow-y-auto">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setCurrentNote(note);
                      setCurrentView('notes');
                      setShowAIModal(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{note.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(note.updatedAt)}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// 快捷操作卡片
function QuickActionCard({ 
  icon: Icon, 
  label, 
  color, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  color: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
    </button>
  );
}

// 统计卡片
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  suffix = '',
  trend 
}: { 
  icon: any; 
  label: string; 
  value: string | number;
  suffix?: string;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">{suffix}</span>
      </div>
      {trend && (
        <p className="text-xs text-green-600 mt-1">{trend}</p>
      )}
    </div>
  );
}

// 建议卡片
function SuggestionCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl p-4">
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// 空状态
function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
