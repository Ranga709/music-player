import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Upload, Music } from 'lucide-react';

const App = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio());

  const API_URL = 'https://music-player-4gsz.onrender.com/';

  const handleFetchMusic = async () => {
    if (!urlInput) return;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await response.json();
      if (data.audio_url) {
        setPlaylist(prev => [...prev, data]);
        setUrlInput('');
        if (currentIndex === -1) setCurrentIndex(0);
      }
    } catch (e) { alert('Lỗi kết nối Backend!'); }
  };

  useEffect(() => {
    if (currentIndex !== -1 && playlist[currentIndex]) {
      audioRef.current.src = playlist[currentIndex].audio_url;
      audioRef.current.play().catch(() => console.log("Autoplay blocked"));
      setIsPlaying(true);
    }
  }, [currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const currentSong = playlist[currentIndex];

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020a10', position: 'relative', color: 'white', overflow: 'hidden' }}>
      <div className="liquid-container">
        <div className="blob"></div><div className="blob blob-2"></div><div className="blob blob-3"></div>
      </div>
      <div className="glass-panel">
        <div className="input-group">
          <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Nhập link YouTube..." />
          <button className="btn-icon" onClick={handleFetchMusic}><Music size={20}/></button>
          <label className="btn-icon" style={{cursor:'pointer'}}>
            <Upload size={20}/><input type="file" hidden onChange={e => {
              const file = e.target.files[0];
              if(file) setPlaylist(prev => [...prev, { title: file.name, audio_url: URL.createObjectURL(file), thumbnail: 'https://via.placeholder.com/300' }]);
            }} />
          </label>
        </div>
        <div className="album-art-container">
          <div className={`album-art ${isPlaying ? 'rotating' : ''}`}>
            <img src={currentSong?.thumbnail || 'https://via.placeholder.com/300'} alt="art" />
          </div>
        </div>
        <h2 style={{ textAlign: 'center', color: '#00f2ff' }}>{currentSong?.title || 'Sẵn sàng nghe nhạc...'}</h2>
        <div className="progress-container" onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
        }}>
          <div className="progress-bar" style={{ width: `${(currentTime / duration) * 100}%` }} />
        </div>
        <div className="time-info">
          <span>{Math.floor(currentTime/60)}:{(currentTime%60).toFixed(0).padStart(2,'0')}</span>
          <span>{Math.floor(duration/60)}:{(duration%60).toFixed(0).padStart(2,'0')}</span>
        </div>
        <div className="controls">
          <button className="btn-icon" onClick={() => setCurrentIndex(Math.max(0, currentIndex-1))}><SkipBack size={24}/></button>
          <button className="play-btn" onClick={togglePlay}>{isPlaying ? <Pause size={30}/> : <Play size={30}/>}</button>
          <button className="btn-icon" onClick={() => setCurrentIndex(Math.min(playlist.length-1, currentIndex+1))}><SkipForward size={24}/></button>
        </div>
      </div>
    </div>
  );
};
export default App;
