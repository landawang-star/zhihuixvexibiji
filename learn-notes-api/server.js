import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;
const upload = multer({ storage: multer.memoryStorage() });
const DATA_FILE = path.join(process.cwd(), 'data.json');

// API Keys（仅服务器端，不泄露给浏览器）
const ARK_API_KEY = process.env.ARK_API_KEY || '';
const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';
const ASR_API_KEY = process.env.ASR_API_KEY || '';
const ASR_URL = 'https://openspeech.bytedance.com/api/v1/asr';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ARK 视觉模型代理
app.post('/api/ark/chat', async (req, res) => {
  try {
    const resp = await fetch(`${ARK_BASE}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DeepSeek 文本模型代理
app.post('/api/deepseek/chat', async (req, res) => {
  try {
    const resp = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 音频转写
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const audioBuffer = req.file?.buffer;
    if (!audioBuffer) return res.status(400).json({ error: '缺少音频文件' });

    const text = await transcribeAudio(audioBuffer);
    res.json({ text });
  } catch (err) {
    console.error('ASR error:', err.message);
    res.json({ text: '' });
  }
});

async function transcribeAudio(audioBuffer) {
  const base64 = audioBuffer.toString('base64');

  const body = JSON.stringify({
    audio_format: 'wav',
    audio: base64,
  });

  const resp = await fetch(ASR_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': ASR_API_KEY,
    },
    body,
  });

  const data = await resp.json();
  if (!resp.ok) {
    console.error('ASR response:', JSON.stringify(data));
    return '';
  }

  // 提取转写文本
  return data.result?.[0]?.text || data.text || data.result || '';
}

// 笔记同步：保存到服务器
app.post('/api/sync', (req, res) => {
  try {
    const { notes, categories } = req.body;
    if (!Array.isArray(notes) || !Array.isArray(categories)) {
      return res.status(400).json({ error: '数据格式错误' });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify({ notes, categories, updatedAt: new Date().toISOString() }));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 笔记同步：从服务器加载
app.get('/api/sync/load', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) return res.json({ notes: [], categories: [] });
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    res.json({ notes: data.notes || [], categories: data.categories || [] });
  } catch (err) {
    res.json({ notes: [], categories: [] });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
