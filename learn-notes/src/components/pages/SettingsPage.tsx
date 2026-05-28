import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Type, Trash2, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/useUIStore';
import { useNoteStore } from '@/stores/useNoteStore';
import { ConfirmModal } from '@/components/common/Modal';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { settings, updateSettings, resetSettings, showToast } = useUIStore();
  const { notes, categories, deleteNote, deleteCategory } = useNoteStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 统计数据
  const totalNotes = notes.length;
  const totalCategories = categories.length;
  const storageUsed = JSON.stringify({ notes, categories }).length;
  const storageKB = (storageUsed / 1024).toFixed(2);

  const handleClearAllData = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    notes.forEach(n => deleteNote(n.id));
    categories.forEach(c => deleteCategory(c.id));
    showToast('所有数据已清除', 'success');
  };

  const handleResetSettings = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    resetSettings();
    showToast('设置已重置', 'success');
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">设置</h1>

          {/* 编辑器设置 */}
          <SettingSection title="编辑器" icon={Type}>
            <SettingItem
              title="字体大小"
              description="调整编辑器中的文字大小"
            >
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ fontSize: size })}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      settings.fontSize === size
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                  </button>
                ))}
              </div>
            </SettingItem>
          </SettingSection>

          {/* 数据管理 */}
          <SettingSection title="数据管理" icon={Save}>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalNotes}</p>
                  <p className="text-xs text-gray-500">笔记</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
                  <p className="text-xs text-gray-500">分类</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{storageKB}</p>
                  <p className="text-xs text-gray-500">KB</p>
                </div>
              </div>
            </div>

            <SettingItem
              title="清除所有数据"
              description="删除所有笔记和分类，不可恢复"
            >
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleClearAllData}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清除数据
              </Button>
            </SettingItem>
          </SettingSection>

          {/* 重置设置 */}
          <SettingSection title="其他" icon={RotateCcw}>
            <SettingItem
              title="重置所有设置"
              description="恢复默认设置，不会删除笔记数据"
            >
              <Button
                variant="outline"
                onClick={handleResetSettings}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重置
              </Button>
            </SettingItem>
          </SettingSection>

          {/* 关于 */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">智学笔记 v1.0</p>
            <p className="text-xs text-gray-400 mt-1">AI 辅助学习笔记应用</p>
          </div>
        </motion.div>
      </div>

      {/* 确认清除数据 */}
      <ConfirmModal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleConfirmClear}
        title="清除所有数据"
        message="确定要清除所有数据吗？此操作不可恢复！"
      />

      {/* 确认重置设置 */}
      <ConfirmModal
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleConfirmReset}
        title="重置所有设置"
        message="确定要重置所有设置吗？"
      />
    </div>
  );
}

// 设置区块
function SettingSection({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// 设置项
function SettingItem({
  title,
  description,
  children,
  indent = false
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  indent?: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center justify-between py-3',
      indent && 'pl-4 border-l-2 border-gray-100'
    )}>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
