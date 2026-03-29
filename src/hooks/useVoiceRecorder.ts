import { useState, useRef } from 'react';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerInterval = useRef<number | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
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
      alert('Microphone access is required to record voice notes.');
    }
  };

  const stopRecording = (): Promise<{ audioData: string; duration: number }> => {
    return new Promise((resolve) => {
      if (mediaRecorder.current && isRecording) {
        mediaRecorder.current.onstop = async () => {
          const blob = new Blob(chunks.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve({ audioData: base64data, duration });
          };
          
          // Stop all tracks
          mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.current.stop();
        setIsRecording(false);
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
      }
    });
  };

  return { isRecording, duration, startRecording, stopRecording };
}
