import { Check, Loader2, Circle } from 'lucide-react';

interface SaveIndicatorProps {
  status: 'saved' | 'saving' | 'unsaved';
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === 'unsaved' && (
        <>
          <Circle className="w-2 h-2 fill-orange-400 text-orange-400" />
          <span className="text-orange-500">未保存</span>
        </>
      )}
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
          <span className="text-gray-400">保存中...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="w-3 h-3 text-green-500" />
          <span className="text-gray-400">已保存</span>
        </>
      )}
    </div>
  );
}
