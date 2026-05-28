import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, CheckCircle2, X } from 'lucide-react';
import { VideoUploader } from './VideoUploader';
import { AnalysisProgress } from './AnalysisProgress';
import { KnowledgePreview } from './KnowledgePreview';
import { useNoteStore } from '@/stores/useNoteStore';
import { useUIStore } from '@/stores/useUIStore';
import { analyzeVideoFrames } from '@/services/volcengineArk';
import { parseAnalysisResponse, knowledgeToHtml } from '@/lib/videoKnowledge';
import { extractAudio } from '@/lib/audioExtractor';
import type { AnalysisResult, AnalysisStage } from '@/types/video';
import type { Note } from '@/types';

const MAX_FRAMES = 10;

export function VideoAnalysisCard() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [stage, setStage] = useState<AnalysisStage>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const { createNote, updateNote, categories, setCurrentNote, createCategory } = useNoteStore();
  const { showToast, setCurrentView } = useUIStore();

  const handleCreateCategory = (name: string) => {
    const cat = createCategory(name);
    return cat.id;
  };

  const abortRef = useRef<AbortController | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // 初始化分类
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setStage('idle');
    setMessage('');
  }, []);

  // 提取视频关键帧
  const extractFrames = useCallback((file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames: string[] = [];
      let aborted = false;

      let onAbort: (() => void) | null = null;

      const cleanup = () => {
        if (onAbort) abortRef.current?.signal.removeEventListener('abort', onAbort);
        URL.revokeObjectURL(video.src);
        video.remove();
        canvas.remove();
      };

      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = async () => {
        const duration = video.duration;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;

        const frameCount = Math.min(MAX_FRAMES, Math.ceil(duration));
        const interval = duration / frameCount;

        for (let i = 0; i < frameCount; i++) {
          if (aborted) { cleanup(); return; }
          const time = interval * i + interval / 2;
          try {
            await seekTo(video, time);
          } catch {
            cleanup();
            reject(new Error('视频帧提取失败'));
            return;
          }
          ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', 0.7));
        }

        cleanup();
        resolve(frames);
      };

      video.onerror = () => {
        cleanup();
        reject(new Error('无法加载视频文件'));
      };

      // 监听 abort
      const checkAbort = () => { aborted = true; };
      onAbort = checkAbort;
      abortRef.current?.signal.addEventListener('abort', checkAbort, { once: true });
    });
  }, []);

  // 转写音频
  const transcribeAudio = useCallback(async (file: File): Promise<string> => {
    try {
      setMessage('正在提取音频...');
      const wavBlob = await extractAudio(file);

      setMessage('正在进行语音识别...');
      const formData = new FormData();
      formData.append('audio', wavBlob, 'audio.wav');

      const resp = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        signal: abortRef.current?.signal,
      });

      if (!resp.ok) return '';
      const data = await resp.json();
      return data.text || '';
    } catch {
      // ASR 失败不阻塞分析，继续用帧分析
      return '';
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!videoFile) return;

    setStage('analyzing');
    setError(null);
    setResult(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const MAX_SIZE = 2048 * 1024 * 1024;
      if (videoFile.size > MAX_SIZE) {
        throw new Error(
          `视频文件过大（${(videoFile.size / (1024 * 1024)).toFixed(0)}MB），最大支持 100MB。请压缩视频后重试`
        );
      }

      // 并行：提取帧 + 提取音频转写
      setMessage('正在提取视频帧...');
      const [frames, transcript] = await Promise.all([
        extractFrames(videoFile),
        transcribeAudio(videoFile),
      ]);

      if (frames.length === 0) {
        throw new Error('无法从视频中提取帧，请检查视频格式');
      }

      controller.signal.throwIfAborted();

      setMessage(transcript ? '正在结合语音和画面分析...' : '正在分析视频画面...');
      const rawResponse = await analyzeVideoFrames(frames, transcript, controller.signal, (msg) => setMessage(msg));
      controller.signal.throwIfAborted();

      setMessage('正在解析分析结果...');
      const parsed = parseAnalysisResponse(rawResponse);
      if (!parsed || parsed.knowledgePoints.length === 0) {
        throw new Error('AI 未能从视频中提取到知识点，请尝试其他视频');
      }

      setResult(parsed);
      setStage('done');
      setMessage('');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStage('idle');
      } else {
        setStage('error');
        setError(err.message || '分析失败，请重试');
      }
    } finally {
      abortRef.current = null;
    }
  }, [videoFile, extractFrames, transcribeAudio]);

  const handleSave = useCallback((categoryId: string, title: string) => {
    if (!result || isSaving) return;
    setIsSaving(true);

    // 确保有分类：未选择或无分类时自动创建
    let targetId = categoryId;
    if (!targetId && categories.length > 0) {
      targetId = categories[0].id;
    }
    if (!targetId) {
      const { createCategory } = useNoteStore.getState();
      targetId = createCategory('视频笔记').id;
    }

    const finalResult = { ...result, title };
    const html = knowledgeToHtml(finalResult);
    const note = createNote(targetId, title);
    updateNote(note.id, {
      content: html,
      sourceType: 'video-upload',
      knowledgePoints: result.knowledgePoints,
    });

    setStage('idle');
    setResult(null);
    setVideoFile(null);
    showToast('视频笔记已保存！', 'success');

    const updatedNote = useNoteStore.getState().notes.find((n: Note) => n.id === note.id);
    if (updatedNote) {
      setCurrentNote(updatedNote);
      setCurrentView('notes');
    }
    setIsSaving(false);
  }, [result, isSaving, createNote, updateNote, showToast, setCurrentNote, setCurrentView]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="mb-8 bg-white rounded-2xl border border-gray-100 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">视频转笔记</h3>
            <p className="text-xs text-gray-500">上传视频，AI 自动生成学习笔记</p>
          </div>
        </div>
        {stage === 'done' && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            分析完成
          </div>
        )}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {(stage === 'idle' || stage === 'error') && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <VideoUploader file={videoFile} onFile={setVideoFile} />
              <button
                onClick={handleAnalyze}
                disabled={!videoFile}
                className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
                  videoFile
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                开始分析
              </button>
              {stage === 'error' && error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
              )}
            </motion.div>
          )}

          {stage === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <AnalysisProgress message={message} />
              <button
                onClick={handleCancel}
                className="w-full py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" /> 取消分析
              </button>
            </motion.div>
          )}

          {stage === 'done' && result && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <KnowledgePreview
                result={result}
                onUpdate={setResult}
                onSave={handleSave}
                onReanalyze={handleAnalyze}
                isSaving={isSaving}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                onCreateCategory={handleCreateCategory}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('视频帧提取超时'));
    }, 5000);

    const onSeeked = () => {
      clearTimeout(timeout);
      resolve();
    };
    const onError = () => {
      clearTimeout(timeout);
      reject(new Error('seek failed'));
    };
    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    video.currentTime = time;
  });
}
