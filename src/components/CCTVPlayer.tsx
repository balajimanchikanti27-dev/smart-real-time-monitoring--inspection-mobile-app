import { useState, useEffect } from 'react';
import { VideoOff } from 'lucide-react';

interface CCTVPlayerProps {
  camera: any;
  orgName: string;
  isExpanded?: boolean;
}

export default function CCTVPlayer({ camera, orgName }: CCTVPlayerProps) {
  const isOnline = camera.status === 'ONLINE';
  
  // Real-time ticking clock
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        `${now.toLocaleTimeString('en-GB', { hour12: false })} ${now.toLocaleDateString('en-GB')}`
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);



  return (
    <div className="relative aspect-video w-full bg-slate-950 overflow-hidden font-mono select-none group">
      {isOnline ? (
        <>
          {/* Real Feed */}
          {camera.streamUrl ? (
            <video
              src={camera.streamUrl}
              autoPlay
              muted
              loop
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-900 border border-slate-800">
              <VideoOff className="w-10 h-10 text-slate-600 mb-3" />
              <p className="font-bold text-slate-400 tracking-widest uppercase text-sm">
                CCTV STREAM NOT CONFIGURED
              </p>
            </div>
          )}
          {/* Subtle CRT / Security Camera Overlay Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
          
          {/* Top Left: LIVE Indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="bg-black/60 backdrop-blur-sm text-red-500 font-bold text-xs px-2 py-1 rounded-sm border border-red-500/30 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              LIVE
            </div>
          </div>

          {/* Top Right: Camera ID */}
          <div className="absolute top-3 right-3">
            <div className="bg-black/60 backdrop-blur-sm text-white font-bold text-xs px-2 py-1 rounded-sm border border-white/20 shadow-sm">
              {camera.id}
            </div>
          </div>

          {/* Bottom Left: Location */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/60 backdrop-blur-sm text-white font-bold text-[10px] md:text-xs px-2 py-1 rounded-sm border border-white/20 shadow-sm max-w-[200px] truncate">
              {orgName} - {camera.location}
            </div>
          </div>

          {/* Bottom Right: Timestamp */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-black/60 backdrop-blur-sm text-amber-400 font-bold text-[10px] md:text-xs px-2 py-1 rounded-sm border border-white/20 shadow-sm text-right">
              {currentTime}
            </div>
          </div>

          {/* Warning / Privacy Label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-black/80 text-white/70 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
              DEMO / SIMULATED FEED
            </div>
          </div>
        </>
      ) : (
        /* OFFLINE STATE */
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900 border-4 border-slate-800">
          <VideoOff className="w-12 h-12 text-slate-600 mb-3" />
          <p className="font-bold text-red-500 tracking-widest uppercase text-sm">
            SIGNAL LOST
          </p>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">
            {camera.id} - CONNECTION TIMEOUT
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Last ping: {camera.lastHeartbeat ? new Date(camera.lastHeartbeat).toLocaleTimeString() : 'Unknown'}
          </p>
        </div>
      )}
    </div>
  );
}
