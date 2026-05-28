const VISION_MODEL = 'doubao-seed-2-0-pro-260215';

export async function analyzeVideoFrames(
  frames: string[],
  transcript: string,
  signal?: AbortSignal,
  onProgress?: (message: string) => void
): Promise<string> {
  onProgress?.('正在调用 AI 分析视频...');

  const content: Array<{ type: string; image_url?: string; text?: string }> = [];

  for (const frame of frames) {
    content.push({ type: 'input_image', image_url: frame });
  }

  const prompt = buildPrompt(transcript);
  content.push({ type: 'input_text', text: prompt });

  const response = await fetch('/api/ark/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: VISION_MODEL,
      input: [{ role: 'user', content }],
    }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API 请求失败 (${response.status})`);
  }

  const data = await response.json();

  // /responses 端点: 遍历 output 找 type=message 的结果
  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (item.type === 'message' && Array.isArray(item.content)) {
        const text = item.content.map((c: any) => c.text || '').join('');
        if (text) return text;
      }
    }
    // 没有 message 类型，返回空
    console.log('未找到 type=message 的输出:', JSON.stringify(data.output).slice(0, 300));
    return '';
  }

  // 兼容 /chat/completions 格式
  return data.choices?.[0]?.message?.content || '';
}

function buildPrompt(transcript: string): string {
  const transcriptSection = transcript
    ? `\n视频语音转写内容：\n${transcript}\n`
    : '';

  return `你是一个专业的学习笔记专家。请结合以下视频关键帧图片和语音转写内容，提取所有有价值的知识点，生成一份高质量的学习笔记。
${transcriptSection}
要求：
1. 根据视频内容灵活决定知识点数量，内容少则 1-2 个，内容丰富则 3-6 个，不要固定数量
2. 每个知识点必须完整、可独立阅读和学习
3. 包含具体例子、应用场景或操作步骤
4. 概念解释清晰易懂，适合学习复习
5. 如果有语音转写内容，以语音内容为主，画面为辅
6. 使用中文

请严格按照以下 JSON 格式返回（只返回 JSON，不要其他内容）：
{
  "title": "笔记标题（精简有力，概括视频核心内容）",
  "knowledgePoints": [
    {
      "title": "知识点标题",
      "concepts": ["核心概念1", "核心概念2"],
      "explanation": "详细解释说明，包含原理、步骤、要点，足够完整以便独立学习",
      "timestamp": "视频中出现的大致时间"
    }
  ]
}`;
}
