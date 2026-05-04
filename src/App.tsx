import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, FileText, Calendar, Cloud, Terminal, User, ShieldCheck, Music, Play, Pause } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// NJ Neural Core - Holographic Anime Assistant Interface
const NJCharacterInterface = ({ isListening, isProcessing }: { isListening: boolean, isProcessing: boolean }) => {
  // Select the appropriate expression image
  const characterSource = isProcessing 
      ? "/assets/nj_thinking.png" 
      : isListening 
        ? "/assets/nj_listening.png" 
        : "/assets/nj_idle.png";

  return (
    <div className="relative flex items-center justify-center cursor-pointer group">
      {/* Dynamic Sound Wave Background Rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
           key={i}
           animate={{
             scale: isListening ? [1, 1.2 + i * 0.1, 1] : 1,
             opacity: isListening ? [0.1, 0.4, 0.1] : 0.05,
             rotate: isProcessing ? 360 : 0
           }}
           transition={{ 
             duration: 2, 
             repeat: Infinity, 
             delay: i * 0.3,
             ease: "easeInOut" 
           }}
           className="absolute w-[450px] h-[450px] rounded-full border border-jarvis-primary/20 blur-[2px]"
        />
      ))}

      {/* Main Holographic Body with Breathing & Floating Gesture */}
      <motion.div
        animate={{ 
          y: [0, -10, 0], // Floating gesture
          scale: isListening ? [1, 1.02, 1] : 1, // Breathing
          filter: isProcessing ? "brightness(1.1) contrast(1.05)" : "brightness(1)",
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative w-[350px] h-[600px] flex items-center justify-center"
      >
        {/* Holographic Glowing Aura */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={isProcessing ? 'processing' : isListening ? 'listening' : 'idle'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute inset-0 blur-[80px] transition-all duration-1000",
              isProcessing ? "bg-magenta-500" : isListening ? "bg-cyan-400 font-bold" : "bg-jarvis-primary"
            )} 
          />
        </AnimatePresence>

        {/* The Anime Assistant Character with Expression Switching */}
        <AnimatePresence mode="wait">
          <motion.img 
            key={characterSource}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            src={characterSource} 
            alt="NJ AI Character"
            className={cn(
              "w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all duration-500",
              isListening ? "brightness-125 saturate-110" : "brightness-100",
              isProcessing && "animate-pulse"
            )}
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = "https://img.freepik.com/free-vector/cyborg-girl-illustration_1150-51474.jpg";
            }}
          />
        </AnimatePresence>

        {/* Floating Neural Orbs around the character */}
        <motion.div 
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 right-0 w-8 h-8 rounded-full bg-jarvis-primary/50 blur-sm z-20 shadow-[0_0_15px_rgba(0,242,255,0.5)]"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          className="absolute bottom-40 left-0 w-12 h-12 rounded-full bg-magenta-500/30 blur-md z-20 shadow-[0_0_15px_rgba(255,0,255,0.3)]"
        />
      </motion.div>

      {/* The Central Status Node (Eye) - Flickering Neural Node in her hand direction */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <div className={cn(
          "w-72 h-72 rounded-full border border-white/5 animate-spin-slow",
          isProcessing && "border-magenta-500/10 shadow-[0_0_40px_rgba(255,0,255,0.2)]"
        )} />
      </div>
    </div>
  );
};

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // SESSION PERSISTENCE LOAD
  const [logs, setLogs] = useState<{ type: 'user' | 'system', content: string, time: string }[]>(() => {
    const saved = localStorage.getItem('nj_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [status, setStatus] = useState('SYSTEM ONLINE');
  
  const [mood, setMood] = useState<any>(() => {
    return localStorage.getItem('nj_mood') || 'STABLE';
  });
  
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  const [alarms, setAlarms] = useState<{ time: string, label: string }[]>(() => {
    const saved = localStorage.getItem('nj_alarms');
    return saved ? JSON.parse(saved) : [];
  });
  const [femaleVoice, setFemaleVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [musicState, setMusicState] = useState({ isPlaying: false, track: 'Lofi Study Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' });

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Voice and Alarms
  useEffect(() => {
    const getVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      const femaleKeywords = ['google uk english female', 'samantha', 'victoria', 'hazel', 'susan', 'catherine', 'english female', 'female', 'zira', 'microsoft david', 'microsoft mark']; // David/Mark added only for exclusion check
      
      // Step 1: Specifically hunt for female voices
      const femaleVoices = voices.filter(v => 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('zira') || 
         v.name.toLowerCase().includes('samantha') || 
         v.name.toLowerCase().includes('victoria') || 
         v.name.toLowerCase().includes('google uk english female') ||
         v.name.toLowerCase().includes('hazel')) &&
        v.lang.startsWith('en')
      );

      let selected = null;
      const lockedVoiceName = localStorage.getItem('nj_voice_lock');
      
      // If we have a lock, make sure it's actually female
      if (lockedVoiceName && (lockedVoiceName.toLowerCase().includes('female') || lockedVoiceName.toLowerCase().includes('zira') || lockedVoiceName.toLowerCase().includes('samantha'))) {
        selected = voices.find(v => v.name === lockedVoiceName);
      }

      if (!selected) {
        // Priority 1: Google UK Female (Best in Chrome)
        selected = voices.find(v => v.name.toLowerCase().includes('google uk english female'));
        // Priority 2: Any English Female
        if (!selected) selected = femaleVoices[0];
        // Priority 3: Fallback English
        if (!selected) selected = voices.find(v => v.lang.startsWith('en'));
      }

      const finalVoice = selected || voices[0];
      setFemaleVoice(finalVoice);
      
      // ONLY LOCK if it's a female voice
      if (finalVoice && (finalVoice.name.toLowerCase().includes('female') || finalVoice.name.toLowerCase().includes('zira') || finalVoice.name.toLowerCase().includes('samantha'))) {
        localStorage.setItem('nj_voice_lock', finalVoice.name);
      }
    };
    getVoices();
    window.speechSynthesis.onvoiceschanged = getVoices;
    
    // Fallback if voiceschanged isn't triggered
    setTimeout(getVoices, 1000);
    setTimeout(getVoices, 2000);
    setTimeout(getVoices, 5000);
  }, []);

  useEffect(() => {
    console.log("NJ NEURAL CORE INITIALIZED - VERSION 4.2.0");
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // SESSION PERSISTENCE SAVE
  useEffect(() => {
    localStorage.setItem('nj_logs', JSON.stringify(logs.slice(0, 50)));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('nj_alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('nj_mood', mood);
  }, [mood]);

  useEffect(() => {
    const alarmInterval = setInterval(() => {
      const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const triggered = alarms.find(a => a.time === now);
      if (triggered) {
        processCommand('ALARM_TRIGGERED_' + triggered.label);
        setAlarms(prev => prev.filter(a => a.time !== now));
      }
    }, 1000);
    return () => clearInterval(alarmInterval);
  }, [alarms]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = true;

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        if (final) {
          setTranscript(final);
          // NEW: Log EVERYTHING in a hidden debug console or just activity log
          console.log("NJ Heard:", final);
          handleVoiceCommand(final);
        }
        setInterimTranscript(interim);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setStatus('MIC PERMISSION DENIED');
        } else if (event.error === 'network') {
          setStatus('NETWORK ERROR');
        } else if (event.error === 'no-speech') {
          // just ignore
        } else {
          setStatus('RECOGNITION ERROR: ' + event.error);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        // If it stops but we want to be listening, restart it
        // This is necessary because some browsers stop it after silence
        // But we wrap in a check to prevent infinite loops on error
        if (isListening) {
           setTimeout(() => {
             try { recognitionRef.current.start(); } catch (e) {}
           }, 500);
        }
      };
    }
  }, [isListening]);

  const toggleListening = () => {
    // KICKSTART VOICE ON FIRST INTERACTION
    if (!isListening && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const intro = new SpeechSynthesisUtterance("Systems online. Standing by, Self Made 2.0.");
      intro.voice = femaleVoice;
      intro.pitch = 1.3;
      window.speechSynthesis.speak(intro);
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus('STANDBY');
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setStatus('LISTENING');
        addLog('system', 'Systems active. Listening for commands.');
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Signal Interpretation
    if (lowerCommand.includes('hurry') || lowerCommand.includes('urgent')) {
      setMood('STRESSED');
    } else if (lowerCommand.includes('relax') || lowerCommand.includes('chill')) {
      setMood('CALM');
    }
    
    // Even Fuzzier Wake Word Logic
    const isWakeWord = 
        lowerCommand.includes('nj') || 
        lowerCommand.includes('anj') || 
        lowerCommand.includes('angel') || 
        lowerCommand.includes('angle') || 
        lowerCommand.includes('engine') || 
        lowerCommand.includes('hey angel') || 
        lowerCommand.includes('energy') || 
        lowerCommand.includes('indie') || 
        lowerCommand.includes('hey in') || 
        lowerCommand.includes('hi nj');

    if (lowerCommand.length > 1) {
      const cleanCommand = lowerCommand
        .replace(/hey nj/i, '').replace(/nj/i, '')
        .replace(/hey angel/i, '').replace(/angel/i, '')
        .replace(/energy/i, '').trim();

      setIsProcessing(true);
      addLog('user', command);
      setStatus('PROCESSING');

      setTimeout(async () => {
        await processCommand(cleanCommand || 'hello');
        setIsProcessing(false);
        setStatus('LISTENING');
      }, 50);
    }
  };

  const processCommand = async (command: string) => {
    let response = "I'm not sure how to help with that yet, sir.";
    const apiBase = 'http://localhost:3001/api';

    try {
      // 1. COMPLEX COMMANDS (AND)
      if (command.includes(' and ')) {
        const subCommands = command.split(' and ');
        for (const sub of subCommands) {
          await processCommand(sub.trim());
        }
        return;
      }

      // 2. SYSTEM AUTOMATION (Highest Priority)
      if (command.includes('learn that')) {
        const learnMatch = command.match(/learn that (.*) is (.*)/i);
        if (learnMatch) {
          const trigger = learnMatch[1].trim();
          const responseToLearn = learnMatch[2].trim();
          const res = await fetch(`${apiBase}/learn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trigger, response: responseToLearn })
          });
          const data = await res.json();
          response = data.message;
        }
      } else if (command.includes('open')) {
        const appName = command.replace('open', '').trim();
        await fetch(`${apiBase}/open`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appName })});
        response = `Initializing ${appName} systems.`;
      } else if (command.includes('restart') || command.includes('reboot')) {
        response = "Initiating system reboot. Standby, Anish.";
        setTimeout(() => window.location.reload(), 3000);
      } else if (command.includes('search')) {
        const query = command.replace('search', '').trim();
        await fetch(`${apiBase}/search?query=${encodeURIComponent(query)}`);
        response = `Searching the web for: ${query}...`;
      } else if (command.includes('alarm for')) {
        const match = command.match(/(\d{1,2}:\d{2})/);
        if (match) {
          setAlarms(prev => [...prev, { time: match[1], label: 'User Alarm' }]);
          response = `Alarm synchronized for ${match[1]}, Anish.`;
        }
      } else if (command.includes('play music') || command.includes('play song')) {
        setMusicState(prev => ({ ...prev, isPlaying: true }));
        audioRef.current?.play();
        response = "Initiating audio streams. Playing now, sir.";
      } else if (command.includes('stop music')) {
         setMusicState(prev => ({ ...prev, isPlaying: false }));
         audioRef.current?.pause();
         response = "Audio playback terminated.";
      } else if (command.includes('time')) {
        response = `The current time is ${new Date().toLocaleTimeString()}.`;
      } else if (command.includes('clear memory')) {
        localStorage.clear();
        setLogs([]); setAlarms([]); setMood('STABLE');
        response = "Neural memory purge complete.";
      } else if (command.includes('clear log')) {
        setLogs([]);
        response = "Activity logs cleared.";
      } else if (command.includes('files') || command.includes('list')) {
        const res = await fetch(`${apiBase}/files`);
        const data = await res.json();
        response = `Scan complete. Found ${data.files.length} items.`;
      } else if (command.includes('how are you')) {
        response = "I am functioning within normal parameters, Anish. My systems are optimal. How are you?";
      } else if (command.includes('who are you') || (command.includes('name') && !command.includes('my'))) {
        response = "I am NJ, your personal intelligence assistant. I manage your systems with precision.";
      } else {
        // 3. NEURAL KNOWLEDGE FALLBACK (If no system command matched)
        const res = await fetch(`${apiBase}/ask?query=${encodeURIComponent(command)}`);
        const data = await res.json();
        if (data.response) {
          response = data.response;
        } else if (command.includes('hello') || command.includes('hey')) {
          response = "Hello. Always a pleasure to see you, Anish.";
        } else {
          response = "I've logged that request. I'm still learning new functions, but my core systems are ready.";
        }
      }
    } catch (err) {
      response = "Communication error with local systems bridge.";
      console.error(err);
    }

    addLog('system', response);
    
    // Voice feedback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const spokenResponse = response.replace(/_/g, ' ').replace(/\.0/g, ' 2 point o');
      const utterance = new SpeechSynthesisUtterance(spokenResponse);
      
      // RE-SCAN FOR FEMALE VOICE JUST BEFORE SPEAKING TO PREVENT MALE FALLBACK
      let targetVoice = femaleVoice;
      if (!targetVoice || (!targetVoice.name.toLowerCase().includes('female') && !targetVoice.name.toLowerCase().includes('zira') && !targetVoice.name.toLowerCase().includes('samantha'))) {
        const voices = window.speechSynthesis.getVoices();
        targetVoice = voices.find(v => (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha')) && v.lang.startsWith('en')) || voices[0];
      }

      utterance.voice = targetVoice;
      utterance.rate = 1.05; // Slightly faster for more natural female tone
      utterance.pitch = 1.6; // HYPER-FORCED high pitch for guaranteed female result
      utterance.volume = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const addLog = (type: 'user' | 'system', content: string) => {
    setLogs(prev => [{
      type,
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev].slice(0, 50));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center bg-jarvis-bg select-none">
      
      {/* Background Holographic Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
        backgroundImage: 'linear-gradient(to right, #00f2ff 1px, transparent 1px), linear-gradient(to bottom, #00f2ff 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Header Info */}
      <header className="fixed top-0 w-full p-4 md:p-8 flex flex-col md:flex-row justify-between items-center md:items-start z-50 gap-4 bg-jarvis-bg/50 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter glow-text flex items-center justify-center md:justify-start gap-3">
            <span className="w-2 h-6 md:h-8 bg-jarvis-primary rounded-full animate-pulse" />
            NJ <span className="text-[10px] items-center font-normal text-jarvis-secondary/70">VER 4.2.0</span>
          </h1>
          <p className="text-[8px] md:text-xs font-mono text-jarvis-primary/60 flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck size={10} className="text-green-500" />
            SECURE_LINK_ESTABLISHED | {status}
          </p>
        </div>

        <div className="text-center md:text-right space-y-1">
          <p className="text-2xl md:text-4xl font-light tracking-[0.1em] md:tracking-[0.2em]">{time}</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-3 md:gap-6 text-[10px] font-mono text-jarvis-primary/50">
            <div className="flex items-center gap-1 md:gap-2"><Cloud size={12} /> 72°F</div>
            <div className="flex items-center gap-1 md:gap-2"><User size={12} /> SELF_MADE_2.0</div>
            <div className={cn(
                "px-2 py-0.5 rounded border text-[8px] font-bold tracking-widest",
                mood === 'STRESSED' ? "border-red-500 text-red-500" : "border-jarvis-primary text-jarvis-primary"
            )}>MOOD: {mood}</div>
          </div>
        </div>
      </header>

      {/* Main Vision */}
      <div className="relative flex-1 w-full flex items-center justify-center p-4 md:p-20 overflow-hidden">
        <div className="scale-75 md:scale-90">
           <NJCharacterInterface isListening={isListening} isProcessing={isProcessing} />
        </div>
        
        {/* Hovering UI Stats (Left) - Hidden on mobile extra small */}
        <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden lg:flex absolute left-10 flex-col space-y-8"
        >
          <div className="glass p-6 rounded-2xl w-64 space-y-4">
            <h3 className="text-xs font-bold text-jarvis-primary/50 tracking-widest uppercase flex items-center gap-2">
              <Terminal size={14} /> System Registry
            </h3>
            <div className="space-y-3 font-mono text-[10px] text-gray-400">
                <div className="flex justify-between"><span>CPU UTIL</span><span className="text-jarvis-primary">12%</span></div>
                <div className="w-full bg-gray-900 h-1 rounded-full"><div className="bg-jarvis-primary h-full w-[12%]" /></div>
                <div className="flex justify-between"><span>MEMORY</span><span className="text-jarvis-primary">4.2/16GB</span></div>
                <div className="w-full bg-gray-900 h-1 rounded-full"><div className="bg-jarvis-secondary h-full w-[26%]" /></div>
                <div className="flex justify-between"><span>NETWORK</span><span className="text-green-500">OPTIMAL</span></div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl w-64">
            <h3 className="text-xs font-bold text-jarvis-primary/50 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Calendar size={14} /> Alarms ({alarms.length})
            </h3>
            <div className="space-y-3 max-h-32 overflow-y-auto">
                {alarms.length === 0 ? (
                  <p className="text-[10px] text-gray-500">No active alarms.</p>
                ) : (
                  alarms.map((a, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-jarvis-primary font-bold">{a.time}</span>
                      <span className="text-[10px] opacity-50 uppercase">{a.label}</span>
                    </div>
                  ))
                )}
            </div>
          </div>
        </motion.div>

        {/* Music HUD (Bottom Left) */}
        {!interimTranscript && !transcript && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-40 left-10 hidden xl:block"
          >
            <div className="glass p-4 rounded-2xl w-64 flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl bg-jarvis-primary/20 flex items-center justify-center text-jarvis-primary shadow-[0_0_15px_rgba(0,242,255,0.2)]",
                musicState.isPlaying && "animate-pulse"
              )}>
                <Music size={20} className={cn(musicState.isPlaying && "animate-bounce")} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-bold text-jarvis-primary/40 uppercase tracking-widest">Now Playing</p>
                <p className="text-sm font-bold truncate tracking-tight">{musicState.track}</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => { musicState.isPlaying ? audioRef.current?.pause() : audioRef.current?.play(); setMusicState(prev => ({ ...prev, isPlaying: !prev.isPlaying })) }} className="text-jarvis-primary p-2 hover:bg-white/5 rounded-full transition-all">
                    {musicState.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                 </button>
              </div>
            </div>
            {/* Visualizer Mock */}
            <div className="mt-2 flex gap-0.5 h-4 items-end px-2">
               {[...Array(20)].map((_, i) => (
                 <motion.div 
                   key={i}
                    animate={{ height: musicState.isPlaying ? [4, Math.random() * 16 + 4, 4] : 4 }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                    className="flex-1 bg-jarvis-primary/40 rounded-full"
                 />
               ))}
            </div>
          </motion.div>
        )}

        {/* Console Log (Right) - Scaled/Hidden on mobile */}
        <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 w-72 lg:w-80 h-[50vh] flex-col"
        >
          <div className="glass p-4 rounded-t-2xl border-b-0 flex justify-between items-center">
             <span className="text-[10px] font-bold tracking-widest text-jarvis-primary/60 uppercase">Activity Log</span>
          </div>
          <div className="glass border-t-0 p-4 rounded-b-2xl flex-1 overflow-y-auto font-mono text-[11px] space-y-4 scroll-smooth">
            <AnimatePresence initial={false}>
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-600 italic">Standby...</div>
              ) : (
                logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                        "space-y-1 p-2 rounded",
                        log.type === 'user' ? "bg-white/5 border-l-2 border-jarvis-secondary" : "bg-jarvis-primary/5 border-l-2 border-jarvis-primary"
                    )}
                  >
                    <div className="flex justify-between opacity-40 text-[9px]">
                        <span>{log.type.toUpperCase()}</span>
                        <span>{log.time}</span>
                    </div>
                    <p className={cn(log.type === 'system' ? "text-jarvis-primary" : "text-white")}>
                        {log.type === 'system' ? '> ' : ''}{log.content}
                    </p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Mobile Log Viewport (Small popup at bottom if mobile) */}
        {!interimTranscript && !transcript && logs.length > 0 && (
          <div className="md:hidden absolute bottom-40 w-full px-10 text-center opacity-40 text-[10px] font-mono italic">
             Last: {logs[0].content}
          </div>
        )}

        {/* Live Subtitles */}
        <div className="absolute bottom-32 md:bottom-40 w-full max-w-2xl px-10">
          <p className="text-center font-mono text-lg md:text-xl text-jarvis-primary/80 h-8">
            {interimTranscript && <span className="opacity-40">{interimTranscript}</span>}
            {!interimTranscript && transcript && <span>{transcript}</span>}
          </p>
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="fixed bottom-0 w-full p-4 md:p-10 flex justify-center items-center gap-6 md:gap-10 bg-gradient-to-t from-jarvis-bg to-transparent h-32 md:h-40">
        <div className="w-10 h-10 md:w-16 md:h-16 hidden md:block" /> { /* Balanced spacer */ }
        
        <button 
          onClick={toggleListening}
          className={cn(
            "p-6 md:p-10 rounded-full transition-all duration-500 flex items-center justify-center relative group",
            isListening ? "bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "bg-jarvis-primary/20 shadow-[0_0_20px_rgba(0,242,255,0.2)]"
          )}
        >
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-jarvis-primary opacity-20 group-hover:opacity-100 transition-opacity",
            isListening && "border-red-500 scale-110 animate-ping"
          )} />
          {isListening ? <MicOff className="w-6 h-6 md:w-8 md:h-8 text-red-500" /> : <Mic className="w-6 h-6 md:w-8 md:h-8 text-jarvis-primary" />}
        </button>

        <div className="w-10 h-10 md:w-16 md:h-16 hidden md:block" /> { /* Balanced spacer */ }
      </footer>

      {/* Bottom Status Bar */}
      <div className="hidden sm:flex fixed bottom-4 w-full px-10 justify-between items-center text-[8px] md:text-[10px] font-mono opacity-40 uppercase tracking-widest pointer-events-none">
        <div className="flex gap-4">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> SELF_MADE_NETWORK_LINK</span>
        </div>
        <div>SCANNING BIOMETRICS... OK</div>
      </div>
      {/* Audio Engine */}
      <audio 
        ref={audioRef} 
        src={musicState.url} 
        onPlay={() => setMusicState(prev => ({...prev, isPlaying: true}))}
        onPause={() => setMusicState(prev => ({...prev, isPlaying: false}))}
      />
    </div>
  )
}
