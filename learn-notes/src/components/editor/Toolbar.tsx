import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  editor: Editor | null;
}

const ToolbarButton = ({ 
  onClick, 
  isActive, 
  disabled,
  label
}: { 
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  label: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap',
      isActive 
        ? 'bg-indigo-100 text-indigo-600' 
        : 'hover:bg-gray-100 text-gray-600',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    {label}
  </button>
);

const Divider = () => (
  <div className="w-px h-4 bg-gray-200 mx-1 flex-shrink-0" />
);

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;
  
  return (
    <div className="flex items-center gap-0.5 px-4 lg:px-6 py-2 border-b border-gray-100 overflow-x-auto">
      {/* 文字格式 */}
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        label="加粗"
      />
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        label="斜体"
      />
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        label="删除线"
      />
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        label="行内代码"
      />
      
      <Divider />
      
      {/* 标题 */}
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        label="大标题"
      />
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        label="中标题"
      />
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        label="小标题"
      />
      
      <Divider />
      
      {/* 列表 */}
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        label="无序列表"
      />
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        label="有序列表"
      />
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive('taskList')}
        label="任务列表"
      />
      
      <Divider />
      
      {/* 块级元素 */}
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        label="引用"
      />
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        label="代码块"
      />
      <ToolbarButton 
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        label="分割线"
      />
    </div>
  );
}
