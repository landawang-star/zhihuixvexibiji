import { Loader2 } from 'lucide-react';

interface AnalysisProgressProps {
  message: string;
}

export function AnalysisProgress({ message }: AnalysisProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      <p className="text-sm text-gray-600">{message || '正在分析中...'}</p>
    </div>
  );
}
