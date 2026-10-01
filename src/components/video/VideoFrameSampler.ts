// Lightweight asynchronous video frame sampler & scene cut detector

export interface FrameSampleData {
  base64Image: string;
  timestamp: number;
  brightness: number;
  colorVariance: number;
  isPotentialSceneChange: boolean;
}

export class VideoFrameSampler {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private lastLuminance: number = 0;
  private width: number = 384;
  private height: number = 216;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  sample(video: HTMLVideoElement): FrameSampleData | null {
    if (!this.ctx || video.readyState < 2 || video.videoWidth === 0) {
      return null;
    }

    try {
      this.ctx.drawImage(video, 0, 0, this.width, this.height);

      // Fast luminance analysis via small pixel sample
      const imgData = this.ctx.getImageData(0, 0, this.width, this.height);
      const data = imgData.data;
      let totalLuminance = 0;
      const step = 16; // sample every 16th pixel for extreme performance
      let sampleCount = 0;

      for (let i = 0; i < data.length; i += 4 * step) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;
        sampleCount++;
      }

      const avgLuminance = totalLuminance / (sampleCount || 1) / 255;
      const deltaLum = Math.abs(avgLuminance - this.lastLuminance);
      const isPotentialSceneChange = deltaLum > 0.18;
      this.lastLuminance = avgLuminance;

      const base64Image = this.canvas.toDataURL('image/jpeg', 0.6);

      // Immediately clear canvas buffer to prevent memory leaks in multi-hour sessions
      this.ctx.clearRect(0, 0, this.width, this.height);

      return {
        base64Image,
        timestamp: video.currentTime,
        brightness: avgLuminance,
        colorVariance: deltaLum,
        isPotentialSceneChange,
      };
    } catch (err) {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
      // Cross-origin video security restriction fallback
      return {
        base64Image: '',
        timestamp: video.currentTime,
        brightness: 0.5,
        colorVariance: 0.1,
        isPotentialSceneChange: false,
      };
    }
  }
}
