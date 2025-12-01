import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { CompressionSettings, VideoFormat } from '../types';
import { RESOLUTION_MAP, CRF_MAP } from '../constants';

// We define a class to manage the FFmpeg instance singleton behavior
class FFmpegService {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;

  // Event callbacks
  private onLogCallback: ((msg: string) => void) | null = null;
  private onProgressCallback: ((progress: number) => void) | null = null;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  public setCallbacks(
    onLog: (msg: string) => void,
    onProgress: (progress: number) => void
  ) {
    this.onLogCallback = onLog;
    this.onProgressCallback = onProgress;

    if (this.ffmpeg) {
      this.ffmpeg.on('log', ({ message }) => {
        if (this.onLogCallback) this.onLogCallback(message);
      });

      this.ffmpeg.on('progress', ({ progress }) => {
        if (this.onProgressCallback) this.onProgressCallback(progress * 100);
      });
    }
  }

  public async load() {
    if (this.loaded) return;
    if (!this.ffmpeg) this.ffmpeg = new FFmpeg();

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

    // We use the single-threaded core for maximum browser compatibility (Safari, standard HTTP servers)
    // Multi-threading requires SharedArrayBuffer which needs specific COOP/COEP headers.
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    this.loaded = true;
  }

  public async compressVideo(file: File, settings: CompressionSettings): Promise<Uint8Array> {
    if (!this.ffmpeg || !this.loaded) {
      throw new Error("FFmpeg not loaded");
    }

    const { name } = file;
    const inputName = 'input' + name.substring(name.lastIndexOf('.'));
    const outputName = `output.${settings.format}`;

    // 1. Write file to memory
    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    // 2. Build commands
    // -i input -vf scale -c:v codec -crf quality -c:a copy output
    const codec = settings.format === VideoFormat.MP4 ? 'libx264' : 'libvpx-vp9';
    // Use scale filter if not original, otherwise omit scaling to prevent errors
    const videoFilters = settings.resolution !== 'original' ? ['-vf', RESOLUTION_MAP[settings.resolution]] : [];
    
    // WebM usually needs -b:v 0 to strictly obey CRF in some versions, but standard libvpx uses -crf too.
    // For H.264 (mp4), use preset 'fast' or 'faster' for client-side performance.
    const codecArgs = settings.format === VideoFormat.MP4 
      ? ['-c:v', 'libx264', '-preset', 'faster', '-crf', String(CRF_MAP[settings.compressionLevel])]
      : ['-c:v', 'libvpx-vp9', '-crf', String(CRF_MAP[settings.compressionLevel]), '-b:v', '0'];

    const command = [
      '-i', inputName,
      ...videoFilters,
      ...codecArgs,
      '-c:a', 'aac', // Use AAC for audio
      '-b:a', '128k', // Reasonable audio bitrate
      outputName
    ];
    
    // Log the command for debugging
    if(this.onLogCallback) this.onLogCallback(`Running command: ffmpeg ${command.join(' ')}`);

    // 3. Execute
    await this.ffmpeg.exec(command);

    // 4. Read output
    const data = await this.ffmpeg.readFile(outputName);

    // 5. Cleanup
    await this.ffmpeg.deleteFile(inputName);
    await this.ffmpeg.deleteFile(outputName);

    return data as Uint8Array;
  }

  public isLoaded() {
    return this.loaded;
  }
}

export const ffmpegService = new FFmpegService();
