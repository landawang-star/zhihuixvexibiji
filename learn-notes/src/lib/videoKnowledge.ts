import type { AnalysisResult } from '@/types/video';

// 解析 AI 返回的 JSON 字符串为 AnalysisResult
export function parseAnalysisResponse(rawText: string): AnalysisResult | null {
  console.log('parseAnalysisResponse 输入文本:', rawText.slice(0, 500));
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { console.log('未匹配到JSON'); return null; }
    const parsed = JSON.parse(jsonMatch[0]);
    console.log('解析JSON成功:', JSON.stringify(parsed).slice(0, 300));
    if (!parsed.title || !Array.isArray(parsed.knowledgePoints)) {
      console.log('缺少title或knowledgePoints');
      return null;
    }
    return {
      title: parsed.title,
      knowledgePoints: parsed.knowledgePoints.map((kp: any, i: number) => ({
        title: kp.title || `知识点 ${i + 1}`,
        concepts: kp.concepts || [],
        explanation: kp.explanation || '',
        timestamp: kp.timestamp || undefined,
      })),
    };
  } catch {
    return null;
  }
}

// 将知识点列表渲染为 HTML（兼容 TipTap 编辑器）
export function knowledgeToHtml(result: AnalysisResult): string {
  const { title, knowledgePoints } = result;

  const cards = knowledgePoints
    .map(
      (kp, i) => `
<h2>📌 ${i + 1}. ${kp.title}</h2>
${kp.concepts.length > 0 ? `<p><strong>核心概念：</strong>${kp.concepts.join('、')}</p>` : ''}
<p>${kp.explanation}</p>
${kp.timestamp ? `<p><em>视频时间：${kp.timestamp}</em></p>` : ''}
`
    )
    .join('');

  return `
<h1>${title}</h1>
<p><em>来源：视频分析生成</em></p>
<hr />
${cards}
<p><em>由 AI 自动生成 · 视频转笔记</em></p>
  `.trim();
}
