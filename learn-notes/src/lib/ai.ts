// DeepSeek API 调用（通过后端代理，Key 不暴露到浏览器）
async function callDeepSeekAPI(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30秒超时

  try {
    const response = await fetch('/api/deepseek/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的学习笔记助手，擅长整理和结构化知识内容。请用中文回答。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API 请求失败 (${response.status})`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('AI 分析超时，请重试或使用更短的笔记');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// 分析笔记结构
export async function analyzeStructure(content: string): Promise<any> {
  const prompt = `请分析以下学习笔记内容，将其结构化整理成清晰的章节。返回 JSON 格式：
{
  "sections": [
    {"title": "章节标题", "summary": "章节摘要"}
  ]
}

笔记内容：
${content || '这是一篇新的学习笔记，等待添加内容'}

请确保返回的是有效的 JSON 格式，不要包含其他文字。`;

  try {
    const result = await callDeepSeekAPI(prompt);
    // 提取 JSON 部分
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return mockAnalyzeStructure(content);
  } catch (error) {
    console.error('结构分析失败:', error);
    return mockAnalyzeStructure(content);
  }
}

// 提取知识点
export async function extractKnowledge(content: string): Promise<any> {
  const prompt = `请从以下学习笔记中提取关键知识点。返回 JSON 格式：
{
  "points": [
    {"emoji": "💡", "title": "知识点标题", "description": "详细描述"}
  ]
}

笔记内容：
${content || '这是一篇新的学习笔记，等待添加内容'}

请确保返回的是有效的 JSON 格式，不要包含其他文字。每个知识点请配上合适的 emoji。`;

  try {
    const result = await callDeepSeekAPI(prompt);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return mockExtractKnowledge(content);
  } catch (error) {
    console.error('知识点提取失败:', error);
    return mockExtractKnowledge(content);
  }
}

// 生成思维导图
export async function generateMindMap(content: string): Promise<any> {
  const prompt = `请根据以下学习笔记内容生成思维导图结构。返回 JSON 格式：
{
  "tree": {
    "title": "主题",
    "children": [
      {
        "title": "分支1",
        "children": [{"title": "子分支"}]
      }
    ]
  }
}

笔记内容：
${content || '这是一篇新的学习笔记，等待添加内容'}

请确保返回的是有效的 JSON 格式，不要包含其他文字。`;

  try {
    const result = await callDeepSeekAPI(prompt);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return mockGenerateMindMap(content);
  } catch (error) {
    console.error('思维导图生成失败:', error);
    return mockGenerateMindMap(content);
  }
}

// 统一的分析接口
export async function analyzeNote(content: string, type: string) {
  switch (type) {
    case 'structure':
      return analyzeStructure(content);
    case 'knowledge':
      return extractKnowledge(content);
    case 'mindmap':
      return generateMindMap(content);
    default:
      throw new Error('未知的分析类型');
  }
}

// Mock 数据（当没有 API Key 时使用）
function mockAnalyzeStructure(content: string) {
  const hasContent = content && content.length > 10;
  
  if (!hasContent) {
    return {
      type: 'structure',
      sections: [
        { title: '第一章：基础概念', summary: '介绍核心定义和基本原理，建立知识框架' },
        { title: '第二章：实践应用', summary: '通过实例展示具体应用方法，加深理解' },
        { title: '第三章：进阶技巧', summary: '深入探讨高级用法和优化策略' },
      ],
    };
  }
  
  // 简单解析 HTML 内容
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3');
  
  if (headings.length > 0) {
    const sections = Array.from(headings).slice(0, 5).map((h, i) => ({
      title: h.textContent || `章节 ${i + 1}`,
      summary: '该章节包含重要的学习内容，建议重点掌握。',
    }));
    
    return { type: 'structure', sections };
  }
  
  return {
    type: 'structure',
    sections: [
      { title: '主要内容', summary: '笔记的核心内容区域' },
      { title: '补充说明', summary: '相关的补充信息和细节' },
    ],
  };
}

function mockExtractKnowledge(_content: string) {
  return {
    type: 'knowledge',
    points: [
      {
        emoji: '💡',
        title: '核心概念',
        description: '这是本章节最重要的基础概念，需要重点掌握。理解这个概念有助于后续的学习。',
      },
      {
        emoji: '🔧',
        title: '实用技巧',
        description: '在实际项目中经常使用的技巧和方法，建议多加练习。',
      },
      {
        emoji: '⚠️',
        title: '常见误区',
        description: '初学者容易犯的错误和注意事项，避免踩坑。',
      },
      {
        emoji: '📊',
        title: '关键数据',
        description: '需要记忆的重要数据和统计指标。',
      },
    ],
  };
}

function mockGenerateMindMap(_content: string) {
  return {
    type: 'mindmap',
    tree: {
      title: '学习主题',
      children: [
        {
          title: '基础知识',
          children: [
            { title: '概念定义' },
            { title: '历史背景' },
            { title: '核心原理' },
          ],
        },
        {
          title: '实践应用',
          children: [
            { title: '入门案例' },
            { title: '进阶项目' },
            { title: '最佳实践' },
          ],
        },
        {
          title: '拓展学习',
          children: [
            { title: '相关领域' },
            { title: '深入方向' },
            { title: '资源推荐' },
          ],
        },
      ],
    },
  };
}

// 生成学习建议
export async function generateLearningSuggestions(content: string): Promise<string[]> {
  const prompt = `请根据以下学习笔记内容，给出3-5条学习建议。返回 JSON 格式：
{
  "suggestions": ["建议1", "建议2", "建议3"]
}

笔记内容：
${content || '这是一篇新的学习笔记'}

请确保返回的是有效的 JSON 格式。`;

  try {
    const result = await callDeepSeekAPI(prompt);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return data.suggestions || [];
    }
    return ['建议复习本章的核心概念', '可以尝试做一些练习题', '推荐查阅相关文档'];
  } catch (error) {
    return ['建议复习本章的核心概念', '可以尝试做一些练习题', '推荐查阅相关文档'];
  }
}
