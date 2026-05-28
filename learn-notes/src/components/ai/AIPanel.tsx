import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, LayoutTemplate, Lightbulb, GitBranch, Check, Eye, AlertTriangle, Copy, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/useUIStore';
import { useNoteStore } from '@/stores/useNoteStore';
import type { Note } from '@/types';
import { analyzeNote } from '@/lib/ai';

interface AIPanelProps {
  note: Note;
}

const tabs = [
  { id: 'structure', label: '智能分段', icon: LayoutTemplate, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { id: 'knowledge', label: '知识点', icon: Lightbulb, color: 'text-amber-500', bgColor: 'bg-amber-50' },
  { id: 'mindmap', label: '思维导图', icon: GitBranch, color: 'text-green-500', bgColor: 'bg-green-50' },
];

export function AIPanel({ note }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState('structure');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toggleAIPanel, showToast } = useUIStore();
  const { updateNote } = useNoteStore();
  
  const handleAnalyze = async (tabId: string) => {
    setActiveTab(tabId);
    setShowPreview(false);
    setIsAnalyzing(true);
    setResult(null);
    try {
      const analysis = await analyzeNote(note.content, tabId);
      setResult(analysis);
    } catch (error) {
      console.error('AI分析失败:', error);
      showToast('AI分析失败，请重试', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // 一键复制功能
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast('已复制到剪贴板', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('复制失败，请重试', 'error');
    }
  };
  
  // 点击应用时，先生成预览内容
  const handlePreview = () => {
    if (!result) return;
    
    let newContent = '';
    if (activeTab === 'structure') {
      newContent = result.sections?.map((s: any) => 
        `<h2>${s.title}</h2><p>${s.summary}</p>`
      ).join('') || '';
    } else if (activeTab === 'knowledge') {
      newContent = result.points?.map((p: any) => 
        `<h3>${p.emoji || '💡'} ${p.title}</h3><p>${p.description}</p>`
      ).join('') || '';
    } else if (activeTab === 'mindmap') {
      // 思维导图转换为HTML格式
      newContent = generateMindMapHTML(result.tree);
    }
    
    setPreviewContent(newContent);
    setShowPreview(true);
  };
  
  // 确认应用
  const handleApply = () => {
    if (previewContent) {
      // 更新笔记内容，同时更新 updatedAt 触发刷新
      updateNote(note.id, { 
        content: previewContent
      });
      showToast('已应用到笔记', 'success');
      setShowPreview(false);
      setPreviewContent('');
      toggleAIPanel();
    }
  };
  
  // 取消应用
  const handleCancelPreview = () => {
    setShowPreview(false);
    setPreviewContent('');
  };
  
  // 生成思维导图的纯文本用于复制
  const generateMindMapText = (node: any, depth = 0): string => {
    const indent = '  '.repeat(depth);
    let text = `${indent}${depth > 0 ? '• ' : ''}${node.title}\n`;
    if (node.children) {
      node.children.forEach((child: any) => {
        text += generateMindMapText(child, depth + 1);
      });
    }
    return text;
  };
  
  const currentTab = tabs.find(t => t.id === activeTab);
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold text-gray-900">AI 智能整理</span>
            <p className="text-xs text-gray-500">Powered by DeepSeek</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleAIPanel} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Save Reminder */}
      <div className="px-5 py-2 bg-amber-50 border-b border-amber-100">
        <p className="text-xs text-amber-700 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          提示：请先保存笔记（Ctrl+S），再进行 AI 分析，以确保分析的是最新内容
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-5 py-3 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleAnalyze(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? `${tab.bgColor} ${tab.color} shadow-sm`
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-16">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
            <p className="font-medium text-gray-700">AI 正在分析中...</p>
            <p className="text-sm text-gray-400 mt-1">请稍候</p>
          </div>
        ) : showPreview ? (
          /* 预览模式 */
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-800">预览模式：以下内容将替换你的笔记，确认后点击"确认应用"</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 max-h-64 overflow-y-auto">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </div>
          </div>
        ) : result ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {activeTab === 'structure' && (
                <StructureResult 
                  data={result} 
                  onCopy={handleCopy} 
                  copiedId={copiedId}
                />
              )}
              {activeTab === 'knowledge' && (
                <KnowledgeResult 
                  data={result} 
                  onCopy={handleCopy} 
                  copiedId={copiedId}
                />
              )}
              {activeTab === 'mindmap' && (
                <MindMapResult 
                  data={result} 
                  onCopy={handleCopy} 
                  copiedId={copiedId}
                />
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center text-gray-400 py-16">
            <div className={`w-16 h-16 rounded-2xl ${currentTab?.bgColor} flex items-center justify-center mx-auto mb-4`}>
              {currentTab && <currentTab.icon className={`w-8 h-8 ${currentTab.color}`} />}
            </div>
            <p className="font-medium text-gray-700">{currentTab?.label}</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
              点击上方按钮，AI 将自动分析你的笔记内容并生成{currentTab?.label}
            </p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {result && (
        <div className="p-5 border-t border-gray-100 space-y-2">
          {showPreview ? (
            /* 预览模式的按钮 */
            <>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApply}
              >
                <Check className="w-4 h-4 mr-2" />
                确认应用
              </Button>
              <Button variant="outline" className="w-full" onClick={handleCancelPreview}>
                返回预览
              </Button>
            </>
          ) : (
            /* 正常模式的按钮 */
            <>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handlePreview}
              >
                <Eye className="w-4 h-4 mr-2" />
                预览效果
              </Button>
              <Button variant="outline" className="w-full border-gray-200 hover:bg-white" onClick={toggleAIPanel}>
                关闭
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// 生成思维导图HTML（用于预览和应用）
function generateMindMapHTML(node: any): string {
  if (!node) return '';
  
  const renderNode = (n: any, depth: number): string => {
    const tag = depth === 0 ? 'h2' : depth === 1 ? 'h3' : 'h4';
    let html = `<${tag}>${n.title}</${tag}>`;
    
    if (n.children && n.children.length > 0) {
      html += '<ul>';
      n.children.forEach((child: any) => {
        html += `<li>${renderNode(child, depth + 1)}</li>`;
      });
      html += '</ul>';
    }
    
    return html;
  };
  
  return `<div class="mindmap">${renderNode(node, 0)}</div>`;
}

// 结构化结果
function StructureResult({ data, onCopy, copiedId }: { data: any; onCopy: (text: string, id: string) => void; copiedId: string | null }) {
  // 生成纯文本用于复制
  const textToCopy = data.sections?.map((s: any, i: number) => 
    `${i + 1}. ${s.title}\n   ${s.summary}`
  ).join('\n\n') || '';
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-blue-500" />
          智能分段结果
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopy(textToCopy, 'structure')}
          className="text-gray-400 hover:text-gray-600 h-8 px-2"
        >
          {copiedId === 'structure' ? (
            <CheckCheck className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="space-y-3">
        {data.sections?.map((section: any, index: number) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold flex items-center justify-center">
                {index + 1}
              </span>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">{section.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{section.summary}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 知识点结果
function KnowledgeResult({ data, onCopy, copiedId }: { data: any; onCopy: (text: string, id: string) => void; copiedId: string | null }) {
  // 生成纯文本用于复制
  const textToCopy = data.points?.map((p: any) => 
    `${p.emoji || '💡'} ${p.title}\n   ${p.description}`
  ).join('\n\n') || '';
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          提取的知识点
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopy(textToCopy, 'knowledge')}
          className="text-gray-400 hover:text-gray-600 h-8 px-2"
        >
          {copiedId === 'knowledge' ? (
            <CheckCheck className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="space-y-3">
        {data.points?.map((point: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-amber-50 rounded-xl p-4 border border-amber-100/50"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{point.emoji || '💡'}</span>
              <div>
                <p className="font-medium text-gray-900">{point.title}</p>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{point.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 思维导图结果
function MindMapResult({ data, onCopy, copiedId }: { data: any; onCopy: (text: string, id: string) => void; copiedId: string | null }) {
  // 生成纯文本用于复制
  const generateText = (node: any, depth = 0): string => {
    const indent = '  '.repeat(depth);
    let text = `${indent}${depth > 0 ? '• ' : ''}${node.title}\n`;
    if (node.children) {
      node.children.forEach((child: any) => {
        text += generateText(child, depth + 1);
      });
    }
    return text;
  };
  const textToCopy = generateText(data.tree);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-green-500" />
          思维导图
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopy(textToCopy, 'mindmap')}
          className="text-gray-400 hover:text-gray-600 h-8 px-2"
        >
          {copiedId === 'mindmap' ? (
            <CheckCheck className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <MindMapNode node={data.tree} />
      </div>
    </div>
  );
}

// 思维导图节点
function MindMapNode({ node, depth = 0 }: { node: any; depth?: number }) {
  return (
    <div className={depth > 0 ? 'ml-4 pl-3 border-l-2 border-gray-100' : ''}>
      <div className="flex items-center gap-2 py-1.5">
        <div 
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            depth === 0 ? 'bg-indigo-500' : depth === 1 ? 'bg-indigo-300' : 'bg-gray-300'
          }`} 
        />
        <span className={`text-sm ${depth === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
          {node.title}
        </span>
      </div>
      {node.children?.map((child: any, index: number) => (
        <MindMapNode key={index} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}
