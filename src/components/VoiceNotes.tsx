import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Trash2, Mic, Square } from 'lucide-react';
import { VoiceNote } from '../types';
import { cn } from '../lib/utils';

interface VoiceNotePlayerProps {
  voiceNote: VoiceNote;
  onDelete: (id: string) => void;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({ voiceNote, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-3 mb-2 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center bg-amber-500 dark:bg-amber-600 text-white rounded-full hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        </button>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Voice Note {voiceNote.slotNumber}</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">{Math.floor(voiceNote.duration / 60)}:{(voiceNote.duration % 60).toString().padStart(2, '0')}</p>
        </div>
      </div>
      <button
        onClick={() => onDelete(voiceNote.id)}
        className="p-2 text-amber-400 dark:text-amber-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
      >
        <Trash2 size={18} />
      </button>
      <audio
        ref={audioRef}
        src={voiceNote.audioData}
        onEnded={handleEnded}
        className="hidden"
      />
    </div>
  );
};

interface VoiceRecorderProps {
  onSave: (audioData: string, duration: number) => void;
  disabled: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSave, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerInterval = useRef<number | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!window.isSecureContext) {
      alert('Voice recording requires HTTPS or app installation to work on mobile.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try different mime types for better mobile support
      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
      let selectedMimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      mediaRecorder.current = new MediaRecorder(stream, { mimeType: selectedMimeType });
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setDuration(0);

      timerInterval.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onSave(base64data, duration);
        };
        mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled && !isRecording}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all shadow-md",
          isRecording 
            ? "bg-red-500 text-white animate-pulse" 
            : "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-2 border-dashed border-amber-300 dark:border-amber-800/50 hover:bg-amber-200 dark:hover:bg-amber-900/30",
          disabled && !isRecording && "opacity-50 cursor-not-allowed"
        )}
      >
        {isRecording ? (
          <>
            <Square size={20} fill="currentColor" />
            <span>Stop Recording ({Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')})</span>
          </>
        ) : (
          <>
            <Mic size={20} />
            <span>{disabled ? 'Max 5 Voice Notes' : 'Add Voice Note'}</span>
          </>
        )}
      </button>
    </div>
  );
};
