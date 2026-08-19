import { useState, useEffect, useRef } from 'react';

export const useAudioLevel = (stream: MediaStream | null) => {
  const [level, setLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setLevel(0);
      return;
    }

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    const updateLevel = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      // ✅ تبدیل نوع با as برای رفع خطای TypeScript
      const data = dataArrayRef.current as Uint8Array<ArrayBuffer>;
      analyserRef.current.getByteFrequencyData(data);
      
      const sum = data.reduce((a, b) => a + b, 0);
      const average = sum / data.length;
      const normalized = Math.min(average / 128, 1);
      setLevel(normalized);
      
      animationRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stream]);

  return level;
};