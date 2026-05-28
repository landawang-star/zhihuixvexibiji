const TARGET_SAMPLE_RATE = 16000;

// 从视频文件中提取音频，返回 16kHz 单声道 WAV
export async function extractAudio(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  audioCtx.close();

  // 转为单声道 + 降采样到 16kHz
  const mono = convertToMono(audioBuffer);
  const resampled = await resample(mono, audioBuffer.sampleRate, TARGET_SAMPLE_RATE);

  return encodeWav(resampled, 1, TARGET_SAMPLE_RATE);
}

// 多声道 → 单声道
function convertToMono(buffer: AudioBuffer): Float32Array {
  const length = buffer.length;
  const result = new Float32Array(length);
  const channels = buffer.numberOfChannels;

  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (let ch = 0; ch < channels; ch++) {
      sum += buffer.getChannelData(ch)[i];
    }
    result[i] = sum / channels;
  }
  return result;
}

// 降采样
async function resample(data: Float32Array, fromRate: number, toRate: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.ceil(data.length * toRate / fromRate), toRate);
  const source = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, data.length, fromRate);
  // @ts-ignore Float32Array generic type mismatch in TS 5.x
  buf.copyToChannel(data, 0);
  source.buffer = buf;
  source.connect(ctx.destination);
  source.start();
  return ctx.startRendering();
}

function encodeWav(audioBuffer: AudioBuffer, numChannels: number, sampleRate: number): Blob {
  const length = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const headerSize = 44;

  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const channelData = audioBuffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
