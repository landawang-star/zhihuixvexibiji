import { Clock, BarChart3, Star, ChevronDown, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate } from '@/lib/utils';
import { useNoteStore } from '@/stores/useNoteStore';
import { useUIStore } from '@/stores/useUIStore';

const quickAccessItems = [
  { key: 'recent' as const, icon: Clock, label: '最近编辑', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { key: 'stats' as const, icon: BarChart3, label: '学习统计', color: 'text-green-600', bgColor: 'bg-green-50' },
  { key: 'favorites' as const, icon: Star, label: '收藏笔记', color: 'text-amber-600', bgColor: 'bg-amber-50' },
];

export function QuickAccess() {
  const { quickAccessPanel, setQuickAccessPanel, setCurrentView } = useUIStore();
  const { notes, categories, getRecentNotes, setCurrentNote } = useNoteStore();

  const handleSelectNote = (note: any) => {
    setCurrentNote(note);
    setCurrentView('notes');
  };
  
  const recentNotes = getRecentNotes(5);
  const favoriteNotes = notes.filter(n => n.isFavorite);
  
  // 统计数据
  const totalNotes = notes.length;
  const totalCategories = categories.length;
  const totalFavorites = favoriteNotes.length;
  const todayNotes = notes.filter(n => {
    const today = new Date();
    const noteDate = new Date(n.updatedAt);
    return noteDate.toDateString() === today.toDateString();
  }).length;
  
  // 总字数
  const totalWords = notes.reduce((sum, n) => {
    const text = n.content.replace(/<[^>]*>/g, '');
    return sum + text.length;
  }, 0);
  
  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      <p className="text-xs font-medium text-gray-400 px-3 pt-3 pb-1 uppercase tracking-wider">快速访问</p>
      <div className="px-1.5 pb-1.5">
        {quickAccessItems.map((item) => {
          const Icon = item.icon;
          const isOpen = quickAccessPanel === item.key;
          const count = item.key === 'recent' ? recentNotes.length 
            : item.key === 'favorites' ? favoriteNotes.length 
            : totalNotes;
          
          return (
            <div key={item.key}>
              <button
                onClick={() => setQuickAccessPanel(item.key)}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className={cn('w-7 h-7 rounded-md flex items-center justify-center', item.bgColor)}>
                  <Icon className={cn('w-3.5 h-3.5', item.color)} />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1 text-left">
                  {item.label}
                </span>
                {count > 0 && (
                  <span className="text-xs text-gray-400 mr-1">{count}</span>
                )}
                <ChevronDown className={cn(
                  'w-3.5 h-3.5 text-gray-400 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )} />
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-2 pb-2">
                      {item.key === 'recent' && (
                        <RecentPanel notes={recentNotes} onSelect={handleSelectNote} />
                      )}
                      {item.key === 'stats' && (
                        <StatsPanel
                          totalNotes={totalNotes}
                          totalCategories={totalCategories}
                          totalFavorites={totalFavorites}
                          todayNotes={todayNotes}
                          totalWords={totalWords}
                        />
                      )}
                      {item.key === 'favorites' && (
                        <FavoritesPanel notes={favoriteNotes} onSelect={handleSelectNote} />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 最近编辑面板
function RecentPanel({ notes, onSelect }: { notes: any[]; onSelect: (n: any) => void }) {
  if (notes.length === 0) {
    return <EmptyHint text="暂无最近编辑的笔记" />;
  }
  return (
    <div className="space-y-0.5">
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => onSelect(note)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-left"
        >
          <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate flex-1">{note.title}</span>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(note.updatedAt)}</span>
        </button>
      ))}
    </div>
  );
}

// 学习统计面板
function StatsPanel({ totalNotes, totalCategories, totalFavorites, todayNotes, totalWords }: {
  totalNotes: number;
  totalCategories: number;
  totalFavorites: number;
  todayNotes: number;
  totalWords: number;
}) {
  const stats = [
    { label: '总笔记', value: totalNotes },
    { label: '分类数', value: totalCategories },
    { label: '今日编辑', value: todayNotes },
    { label: '收藏数', value: totalFavorites },
    { label: '总字数', value: totalWords > 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords },
  ];
  
  return (
    <div>
      {totalNotes === 0 ? (
        <EmptyHint text="还没有笔记，开始创建吧" />
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {stats.map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-lg px-2.5 py-2">
              <p className="text-lg font-semibold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 收藏笔记面板
function FavoritesPanel({ notes, onSelect }: { notes: any[]; onSelect: (n: any) => void }) {
  if (notes.length === 0) {
    return <EmptyHint text="暂无收藏的笔记" />;
  }
  return (
    <div className="space-y-0.5">
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => onSelect(note)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-left"
        >
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate flex-1">{note.title}</span>
        </button>
      ))}
    </div>
  );
}

// 空状态提示
function EmptyHint({ text }: { text: string }) {
  return (
    <p className="text-xs text-gray-400 text-center py-3">{text}</p>
  );
}
