import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Plus, BookOpen, Tag, Clock, FolderOpen, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AnalysisResult } from '@/types/video';
import type { KnowledgePoint, Category } from '@/types';

interface KnowledgePreviewProps {
  result: AnalysisResult;
  onUpdate: (result: AnalysisResult) => void;
  onSave: (categoryId: string, title: string) => void;
  onReanalyze: () => void;
  isSaving?: boolean;
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onCreateCategory: (name: string) => string;
}

export function KnowledgePreview({
  result, onUpdate, onSave, onReanalyze, isSaving,
  categories, selectedCategoryId, onSelectCategory, onCreateCategory,
}: KnowledgePreviewProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const updateTitle = (title: string) => {
    onUpdate({ ...result, title });
  };

  const updatePoint = (index: number, updates: Partial<KnowledgePoint>) => {
    const newPoints = result.knowledgePoints.map((kp, i) =>
      i === index ? { ...kp, ...updates } : kp
    );
    onUpdate({ ...result, knowledgePoints: newPoints });
  };

  const removePoint = (index: number) => {
    const newPoints = result.knowledgePoints.filter((_, i) => i !== index);
    onUpdate({ ...result, knowledgePoints: newPoints });
  };

  const addPoint = () => {
    const newPoint: KnowledgePoint = {
      title: '新知识点',
      concepts: [],
      explanation: '',
    };
    onUpdate({
      ...result,
      knowledgePoints: [...result.knowledgePoints, newPoint],
    });
    setEditingIndex(result.knowledgePoints.length);
  };

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        <input
          type="text"
          value={result.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="flex-1 text-lg font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none"
        />
        <span className="text-sm text-gray-400">{result.knowledgePoints.length} 个知识点</span>
      </div>

      {/* 知识点卡片 */}
      <div className="space-y-3">
        {result.knowledgePoints.map((kp, index) => (
          <motion.div
            key={`${kp.title}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`p-4 rounded-xl border transition-colors ${
              editingIndex === index
                ? 'border-indigo-300 bg-indigo-50/50'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            {editingIndex === index ? (
              /* 编辑模式 */
              <div className="space-y-3">
                <input
                  type="text"
                  value={kp.title}
                  onChange={(e) => updatePoint(index, { title: e.target.value })}
                  placeholder="知识点标题"
                  className="w-full font-medium text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="text"
                  value={kp.concepts.join('、')}
                  onChange={(e) =>
                    updatePoint(index, {
                      concepts: e.target.value.split(/[、,]/).filter(Boolean),
                    })
                  }
                  placeholder="核心概念（用、分隔）"
                  className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <textarea
                  value={kp.explanation}
                  onChange={(e) => updatePoint(index, { explanation: e.target.value })}
                  placeholder="详细解释说明"
                  rows={3}
                  className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={kp.timestamp || ''}
                    onChange={(e) => updatePoint(index, { timestamp: e.target.value })}
                    placeholder="时间戳（如 02:15）"
                    className="w-24 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    完成
                  </button>
                </div>
              </div>
            ) : (
              /* 展示模式 */
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{kp.title}</h4>
                    {kp.concepts.length > 0 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <Tag className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {kp.concepts.map((c, ci) => (
                            <span
                              key={ci}
                              className="inline-block px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 rounded-full"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {kp.explanation}
                    </p>
                    {kp.timestamp && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {kp.timestamp}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingIndex(index)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removePoint(index)}
                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 添加知识点 */}
      <button
        onClick={addPoint}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        添加知识点
      </button>

      {/* 选择保存位置 */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FolderOpen className="w-4 h-4" />
          保存到：
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedCategoryId === cat.id
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
          {showNewCategory ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="分类名"
                className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCategoryName.trim()) {
                    const id = onCreateCategory(newCategoryName.trim());
                    onSelectCategory(id);
                    setNewCategoryName('');
                    setShowNewCategory(false);
                  }
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowNewCategory(true)}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-50 text-gray-500 hover:bg-gray-100 border border-dashed border-gray-300 flex items-center gap-1"
            >
              <FolderPlus className="w-3.5 h-3.5" /> 新建
            </button>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={() => onSave(selectedCategoryId, result.title)}
          disabled={isSaving}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSaving ? '保存中...' : '保存为笔记'}
        </Button>
        <Button onClick={onReanalyze} variant="outline" className="flex-1">
          重新分析
        </Button>
      </div>
    </div>
  );
}
