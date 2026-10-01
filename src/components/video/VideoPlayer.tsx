import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  Captions,
  FileVideo,
  ListVideo,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Ban,
  Sparkles,
  Info,
  Clock,
  Layers,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { VideoItem, SceneMetadata, TranscriptCue, BotReaction } from '../../types/index.js';
import { VideoFrameSampler } from './VideoFrameSampler.js';

interface VideoPlayerProps {
  currentVideo: VideoItem;
  onVideoSelect: (video: VideoItem) => void;
  playlist: VideoItem[];
  onUploadCustomVideo: (file: File) => void;
  onCustomUrlVideo: (url: string, title: string) => void;
  onFrameAnalyzed: (sample: any, scene: SceneMetadata | undefined) => void;
  onSceneChange: (scene: SceneMetadata) => void;
  onUserFeedback: (type: 'like' | 'dislike' | 'love' | 'not_interested') => void;
  visualAnalysisEnabled: boolean;
  activeReaction: BotReaction | null;
  botName: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentVideo,
  onVideoSelect,
  playlist,
  onUploadCustomVideo,
  onCustomUrlVideo,
  onFrameAnalyzed,
  onSceneChange,
  onUserFeedback,
  visualAnalysisEnabled,
  activeReaction,
  botName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const samplerRef = useRef<VideoFrameSampler>(new VideoFrameSampler());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentVideo.duration || 180);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [lastSampledTime, setLastSampledTime] = useState(0);
  const [currentScene, setCurrentScene] = useState<SceneMetadata | undefined>(
    currentVideo.scenes?.[0]
  );
  const [currentTranscriptCue, setCurrentTranscriptCue] = useState<TranscriptCue | null>(null);
  const [hasMediaError, setHasMediaError] = useState(false);

  // Reset error on video change
  useEffect(() => {
    setHasMediaError(false);
  }, [currentVideo.videoUrl]);

  // Sync scene when video currentTime changes
  useEffect(() => {
    if (!currentVideo.scenes || currentVideo.scenes.length === 0) return;
    const scene = currentVideo.scenes.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    );
    if (scene && scene.sceneName !== currentScene?.sceneName) {
      setCurrentScene(scene);
      onSceneChange(scene);
    }
  }, [currentTime, currentVideo.scenes, currentScene, onSceneChange]);

  // Sync transcript line
  useEffect(() => {
    if (!currentVideo.transcript) {
      setCurrentTranscriptCue(null);
      return;
    }
    const cue = currentVideo.transcript.find(
      (c) => currentTime >= c.start && currentTime <= c.end
    );
    setCurrentTranscriptCue(cue || null);
  }, [currentTime, currentVideo.transcript]);

  // Intelligent Asynchronous Frame Sampler Loop with Background Tab Throttling
  // Samples every 6-8 seconds, or immediately if scene cuts
  useEffect(() => {
    if (!isPlaying || !visualAnalysisEnabled) return;

    const interval = setInterval(() => {
      // Throttle sampling when tab is backgrounded / minimized to save GPU/CPU cycles
      if (typeof document !== 'undefined' && document.hidden) return;

      const video = videoRef.current;
      if (!video || video.paused) return;

      const now = video.currentTime;
      if (Math.abs(now - lastSampledTime) < 4.0) return; // avoid too frequent calls

      const sample = samplerRef.current.sample(video);
      if (sample) {
        setLastSampledTime(now);
        onFrameAnalyzed(sample, currentScene);
      }
    }, 5500);

    return () => clearInterval(interval);
  }, [isPlaying, visualAnalysisEnabled, lastSampledTime, currentScene, onFrameAnalyzed]);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => console.warn('Play interrupted:', err));
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const next = !isMuted;
      setIsMuted(next);
      videoRef.current.muted = next;
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const idx = speeds.indexOf(playbackSpeed);
    const next = speeds[(idx + 1) % speeds.length];
    setPlaybackSpeed(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = next;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Dynamic Ambilight ambient color based on mood / style
  const ambilightColor = currentVideo.genres.includes('Sci-Fi')
    ? 'rgba(0, 210, 255, 0.22)'
    : currentVideo.genres.includes('Cyberpunk')
    ? 'rgba(247, 37, 133, 0.22)'
    : currentVideo.genres.includes('Documentary')
    ? 'rgba(46, 196, 182, 0.22)'
    : 'rgba(255, 159, 28, 0.22)';

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Video Container with Ambilight */}
      <div
        ref={containerRef}
        style={{
          boxShadow: `0 20px 70px -15px ${ambilightColor}`,
        }}
        className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 group shadow-2xl transition-all duration-700"
      >
        {/* HTML5 Video Element */}
        <video
          ref={videoRef}
          src={currentVideo.videoUrl}
          playsInline
          crossOrigin="anonymous"
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || currentVideo.duration || 180);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setHasMediaError(true)}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Broken Video / Media Error Graceful Recovery Screen */}
        {hasMediaError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Stream Unavailable or Format Error</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Unable to load video stream. The video link may have expired or is blocked by CORS.
              </p>
            </div>
            <button
              onClick={() => {
                if (playlist.length > 0) onVideoSelect(playlist[0]);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              Switch to Default Channel
            </button>
          </div>
        )}

        {/* Live Visual Analysis HUD Badge (Top Left) */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 pointer-events-none">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950/80 border border-white/15 backdrop-blur-md text-xs font-medium text-slate-200 shadow-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                visualAnalysisEnabled && isPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="tracking-wide">
              {visualAnalysisEnabled ? 'Companion Vision Active' : 'Vision Offline (Privacy Mode)'}
            </span>
          </div>

          {currentScene && (
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md text-xs text-cyan-300">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>{currentScene.sceneName}</span>
            </div>
          )}
        </div>

        {/* Video Switcher & Actions (Top Right) */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/15 backdrop-blur-md text-xs font-medium text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-lg"
            title="Choose Video or Upload"
          >
            <ListVideo className="w-3.5 h-3.5 text-cyan-400" />
            <span>Channels ({playlist.length})</span>
          </button>
        </div>

        {/* Captions / Subtitles Overlay */}
        {showCaptions && currentTranscriptCue && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 max-w-xl text-center px-4 py-1.5 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 text-white font-medium text-sm md:text-base leading-snug shadow-xl pointer-events-none animate-in fade-in duration-200">
            {currentTranscriptCue.speaker && (
              <span className="text-cyan-400 font-semibold mr-2 text-xs uppercase tracking-wider">
                [{currentTranscriptCue.speaker}]
              </span>
            )}
            {currentTranscriptCue.text}
          </div>
        )}

        {/* Center Play Button Overlay on Pause */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] cursor-pointer z-10 transition-opacity"
          >
            <div className="w-20 h-20 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-black flex items-center justify-center shadow-2xl shadow-cyan-500/50 transform hover:scale-110 active:scale-95 transition-all">
              <Play className="w-9 h-9 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Progress / Seek bar with chapters */}
          <div className="relative w-full flex items-center group/bar">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:h-2.5 transition-all"
            />

            {/* Chapter markers on timeline */}
            {currentVideo.chapters?.map((chap, i) => {
              const leftPercent = ((chap.time / duration) * 100).toFixed(1);
              return (
                <div
                  key={i}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-0 bottom-0 w-1 bg-cyan-300/80 pointer-events-none"
                  title={chap.title}
                />
              );
            })}
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-slate-200">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <div className="flex items-center space-x-1.5 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="text-xs font-mono text-slate-300">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1 text-slate-500">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              {/* Speed button */}
              <button
                onClick={cycleSpeed}
                className="px-2 py-0.5 rounded text-xs font-mono font-medium hover:bg-white/10 text-cyan-300 transition-colors"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {/* Subtitles toggle */}
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showCaptions ? 'text-cyan-400 bg-white/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Captions / Subtitles"
              >
                <Captions className="w-4 h-4" />
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info Header & Companion Feedback Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Title and metadata */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2 flex-wrap">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {currentVideo.title}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30">
              {currentVideo.category}
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl line-clamp-1">
            {currentVideo.description}
          </p>
        </div>

        {/* User Taste Direct Feedback Toolbar (Requirement 14) */}
        <div className="flex items-center space-x-2 border-t md:border-t-0 pt-2 md:pt-0 border-white/10 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-400 mr-1 font-medium">Rate content:</span>
          <button
            onClick={() => onUserFeedback('like')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 transition-all text-xs active:scale-95"
            title="Like this video content"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Like</span>
          </button>
          <button
            onClick={() => onUserFeedback('love')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 transition-all text-xs active:scale-95"
            title="Love this visual style / theme"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Love</span>
          </button>
          <button
            onClick={() => onUserFeedback('dislike')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/10 transition-all text-xs active:scale-95"
            title="Don't like this"
          >
            <ThumbsDown className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            onClick={() => onUserFeedback('not_interested')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition-all text-xs active:scale-95"
            title="Not interested (train taste filter)"
          >
            <Ban className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Playlist & Upload Drawer Modal */}
      {showPlaylist && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex flex-col space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <FileVideo className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Channels & Video Sources
              </h3>
            </div>
            <button
              onClick={() => setShowPlaylist(false)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded"
            >
              Close
            </button>
          </div>

          {/* Curated Channels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlist.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  onVideoSelect(video);
                  setShowPlaylist(false);
                }}
                className={`flex space-x-3 p-2.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  video.id === currentVideo.id
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/60 border-white/10 hover:border-white/20'
                }`}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex flex-col justify-center overflow-hidden">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {video.title}
                  </h4>
                  <span className="text-[10px] text-cyan-300 font-medium">
                    {video.category}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {formatTime(video.duration)} • {video.genres.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Video Uploader and URL input */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUploadCustomVideo(file);
                    setShowPlaylist(false);
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-white/10 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Local Video (MP4/WebM)</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-80">
              <input
                type="url"
                placeholder="Enter direct video URL..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => {
                  if (customUrlInput.trim()) {
                    onCustomUrlVideo(customUrlInput.trim(), 'Custom Stream Video');
                    setCustomUrlInput('');
                    setShowPlaylist(false);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold whitespace-nowrap"
              >
                Load
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
