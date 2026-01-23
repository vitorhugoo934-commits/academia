
import React, { useState, useRef, useEffect } from 'react';
import { Search, UserCheck, AlertCircle, Clock, Camera, CameraOff, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Student, AttendanceRecord } from '../types';

interface AttendanceProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onAddAttendance: (record: AttendanceRecord) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ students, attendance, onAddAttendance }) => {
  const [cpf, setCpf] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const setupCamera = async () => {
    setCameraError(null);
    setCameraActive(false);

    try {
      // Garante que qualquer stream anterior foi encerrado antes de pedir um novo
      stopCamera();

      // Aguarda um pequeno delay para o hardware liberar (evita NotReadableError em alguns sistemas)
      await new Promise(resolve => setTimeout(resolve, 100));

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 }, 
          facingMode: 'user' 
        },
        audio: false 
      });
      
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Tenta dar play explicitamente
        try {
          await videoRef.current.play();
          setCameraActive(true);
          setCameraError(null);
        } catch (playErr) {
          console.error("Erro ao dar play no vídeo:", playErr);
          setCameraError("Falha ao iniciar stream de vídeo. Tente recarregar a página.");
        }
      }
    } catch (err: any) {
      console.error("Erro detalhado da câmera:", err);
      setCameraActive(false);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("Acesso à câmera negado. Por favor, autorize o uso da câmera no navegador.");
      } else if (err.name === 'NotReadableError' || err.message?.includes('start video source')) {
        setCameraError("Câmera ocupada ou indisponível. Verifique se outro aplicativo (Zoom, Meet, etc) está usando a câmera.");
      } else if (err.name === 'NotFoundError') {
        setCameraError("Nenhuma câmera detectada neste dispositivo.");
      } else {
        setCameraError("Erro ao acessar hardware de vídeo. Verifique as conexões.");
      }
    }
  };

  useEffect(() => {
    setupCamera();
    return () => stopCamera();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, '');
    const student = students.find(s => s.cpf === cleanCpf);

    if (!student) {
      setMessage({ text: 'Servidor não encontrado.', type: 'error' });
    } else if (student.blocked) {
      setMessage({ text: 'ACESSO BLOQUEADO PELO SISTEMA.', type: 'error' });
    } else {
      const now = new Date();
      onAddAttendance({
        id: Math.random().toString(36).substr(2, 9),
        studentCpf: student.cpf,
        timestamp: now.toISOString(),
        hour: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setMessage({ text: `Presença: ${student.name.split(' ')[0]} registrada!`, type: 'success' });
      setCpf('');
    }
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Terminal Section */}
        <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Camera size={20} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-xs">Terminal de Acesso Biométrico</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sincronizado com Base de Dados SEDUC</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-10 space-y-8">
            <div className="aspect-video bg-slate-950 rounded-3xl overflow-hidden relative shadow-2xl flex items-center justify-center border-4 border-slate-900">
              {!cameraActive && !cameraError && (
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <RefreshCw size={40} className="mb-4 animate-spin text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 animate-pulse">Iniciando Hardware de Vídeo...</p>
                </div>
              )}
              
              {cameraError && (
                <div className="flex flex-col items-center justify-center p-8 text-center text-white bg-slate-950 absolute inset-0 z-10">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert size={32} className="text-red-500" />
                  </div>
                  <h4 className="font-black uppercase text-xs tracking-widest mb-2 text-red-500">Erro de Hardware</h4>
                  <p className="text-[11px] font-bold text-slate-400 mb-6 max-w-xs uppercase leading-relaxed">{cameraError}</p>
                  <button 
                    onClick={setupCamera}
                    className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-900/40 active:scale-95"
                  >
                    <RefreshCw size={14} />
                    Tentar Novamente
                  </button>
                </div>
              )}

              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transition-opacity duration-700 ${!cameraActive ? 'opacity-0' : 'opacity-100'}`} 
              />
              
              {cameraActive && (
                <>
                  <div className="absolute inset-0 border-[20px] border-emerald-500/5 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-emerald-500/30 animate-scan pointer-events-none shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-emerald-500/30">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Terminal</span>
                  </div>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Identificação do Servidor</label>
                <input 
                  type="text"
                  placeholder="DIGITE O CPF"
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-2xl font-black text-slate-900 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200 text-center tracking-widest"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-emerald-100 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]">
                Confirmar Presença
              </button>
            </form>

            {message && (
              <div className={`max-w-md mx-auto p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${
                message.type === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-950 text-red-400 border border-red-900'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                <p className="font-black text-[10px] uppercase tracking-widest leading-relaxed">{message.text}</p>
              </div>
            )}
          </div>
        </div>

        {/* Log Section */}
        <div className="w-full xl:w-96 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col h-[500px] xl:h-auto">
          <div className="p-6 bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] shrink-0 flex justify-between items-center border-b border-slate-800">
            <span className="flex items-center gap-2"><Clock size={14} className="text-emerald-500" /> Fluxo de Acesso</span>
            <span className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full text-[9px]">{attendance.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {attendance.length > 0 ? (
              attendance.map(rec => {
                const student = students.find(s => s.cpf === rec.studentCpf);
                return (
                  <div key={rec.id} className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-all rounded-2xl group mb-1 last:mb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors uppercase">
                        {student?.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-[11px] truncate uppercase tracking-tight">{student?.name || 'Servidor'}</p>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">Entrada {rec.hour}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 group-hover:bg-emerald-50 p-2 rounded-lg transition-colors">
                      <CheckCircle2 size={14} className="text-slate-200 group-hover:text-emerald-500" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 opacity-30">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw size={24} className="animate-spin-slow text-slate-300" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Monitorando...</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Attendance;
