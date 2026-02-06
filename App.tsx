
import React, { useState, useEffect } from 'react';
import { 
  Home, Users, ClipboardCheck, Ban, FileText, 
  Files, BarChart3, Clock, Menu, PlusCircle,
  LogOut, ShieldCheck, UserCog, ListOrdered, X, Loader2, KeyRound
} from 'lucide-react';
import { View, Student, AttendanceRecord, DocumentItem, Modality, User, UserRole } from './types';
import { studentService } from './services/studentService';
import { attendanceService } from './services/attendanceService';
import { documentService } from './services/documentService';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import StudentForm from './components/StudentForm';
import BlockManagement from './components/BlockManagement';
import Documents from './components/Documents';
import StudentDocuments from './components/StudentDocuments';
import Reports from './components/Reports';
import Schedules from './components/Schedules';
import TeacherManagement from './components/TeacherManagement';
import StudentList from './components/StudentList';
import Waitlist from './components/Waitlist';
import Login from './components/Login';
import SystemUsers from './components/SystemUsers';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedStudents, fetchedAttendance, fetchedDocuments] = await Promise.all([
        studentService.getAll(),
        attendanceService.getToday(),
        documentService.getAll()
      ]);
      setStudents(fetchedStudents);
      setAttendance(fetchedAttendance);
      setDocuments(fetchedDocuments);
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
    
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, [isAuthenticated]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const addStudent = async (student: Student) => {
    const activeInSlot = students.filter(s => 
      !s.onWaitlist && 
      s.modality === student.modality && 
      s.trainingDays === student.trainingDays && 
      s.trainingTime === student.trainingTime &&
      s.turma === student.turma
    );

    const isFull = activeInSlot.length >= 12;
    const studentWithStatus = { ...student, onWaitlist: isFull };

    setIsSaving(true);
    try {
      const savedStudent = await studentService.create(studentWithStatus);
      setStudents(prev => [...prev, savedStudent]);
      
      if (isFull) {
        alert(`AVISO: Turma lotada. Servidor adicionado à FILA DE ESPERA.`);
        handleNavigate('waitlist');
      } else {
        handleNavigate('students-list');
      }
    } catch (err: any) {
      alert("ERRO AO SALVAR: " + (err.message || "Consulte o administrador."));
    } finally {
      setIsSaving(false);
    }
  };

  const updateStudent = async (student: Student) => {
    try {
      const updated = await studentService.update(student.id, student);
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Deseja realmente remover esta matrícula permanentemente?")) return;
    try {
      await studentService.delete(id);
      setStudents(p => p.filter(s => s.id !== id));
    } catch (err: any) {
      alert("Erro ao remover: " + err.message);
    }
  };

  const toggleStudentBlock = async (cpf: string) => {
    const student = students.find(s => s.cpf === cpf);
    if (!student) return;
    try {
      await studentService.toggleBlock(cpf, !student.blocked);
      setStudents(p => p.map(s => s.cpf === cpf ? {...s, blocked: !s.blocked} : s));
    } catch (err: any) {
      alert("Erro ao atualizar status: " + err.message);
    }
  };

  const recordAttendance = async (record: AttendanceRecord) => {
    try {
      const saved = await attendanceService.record(record.studentCpf, record.hour, record.photo);
      const recordWithId = { ...record, id: saved.id };
      setAttendance(p => [recordWithId, ...p]);
    } catch (err: any) {
      alert("Erro ao gravar frequência: " + err.message);
    }
  };

  const handleSaveDocument = async (doc: Partial<DocumentItem>) => {
    try {
      const saved = await documentService.create(doc);
      setDocuments(prev => [saved, ...prev]);
    } catch (err: any) {
      alert("Erro ao salvar documento: " + err.message);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Remover este documento permanentemente?")) return;
    try {
      await documentService.delete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      alert("Erro ao remover documento: " + err.message);
    }
  };

  const menuItems = [
    { id: 'home', label: 'Início', icon: Home, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'attendance', label: 'Frequência', icon: ClipboardCheck, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'system-users', label: 'Gestão Acesso', icon: KeyRound, roles: [UserRole.ADMIN] },
    { id: 'add-student', label: 'Matrícula', icon: PlusCircle, roles: [UserRole.ADMIN] },
    { id: 'students-list', label: 'Alunos', icon: Users, roles: [UserRole.ADMIN] },
    { id: 'waitlist', label: 'Espera', icon: ListOrdered, roles: [UserRole.ADMIN] },
    { id: 'block-student', label: 'Bloqueios', icon: Ban, roles: [UserRole.ADMIN] },
    { id: 'schedules', label: 'Horários', icon: Clock, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'documents', label: 'Docs Gerais', icon: FileText, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'student-documents', label: 'Docs Alunos', icon: Files, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, roles: [UserRole.ADMIN] },
  ];

  if (!isAuthenticated || !currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const filteredMenu = menuItems.filter(item => item.roles.includes(currentUser.role));

  const renderView = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-64 text-emerald-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold uppercase tracking-widest text-xs text-center px-4">Sincronizando ambiente seguro...</p>
      </div>
    );

    switch (currentView) {
      case 'home': return <Dashboard students={students} attendance={attendance} onNavigate={handleNavigate} user={currentUser} />;
      case 'attendance': return <Attendance students={students} attendance={attendance} onAddAttendance={recordAttendance} />;
      case 'system-users': return <SystemUsers />;
      case 'add-student': return <StudentForm onSave={addStudent} students={students} isSaving={isSaving} />;
      case 'students-list': return <StudentList students={students.filter(s => !s.onWaitlist)} onDelete={deleteStudent} onUpdate={updateStudent} isAdmin={currentUser.role === UserRole.ADMIN} />;
      case 'waitlist': return <Waitlist students={students.filter(s => s.onWaitlist)} onDelete={deleteStudent} onUpdate={updateStudent} />;
      case 'block-student': return <BlockManagement students={students} onToggleBlock={toggleStudentBlock} />;
      case 'documents': return <Documents documents={documents.filter(d => !d.studentId)} onSaveDocument={handleSaveDocument} onDeleteDocument={handleDeleteDocument} />;
      case 'student-documents': return <StudentDocuments students={students} documents={documents.filter(d => !!d.studentId)} onSaveDocument={handleSaveDocument} onDeleteDocument={handleDeleteDocument} />;
      case 'reports': return <Reports students={students} attendance={attendance} />;
      case 'schedules': return <Schedules students={students} />;
      default: return <Dashboard students={students} attendance={attendance} onNavigate={handleNavigate} user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-slate-900 text-white flex flex-col shadow-2xl
      `}>
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <h1 className="font-black text-xl tracking-tight">Academia <span className="text-emerald-500">GO</span></h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X size={24} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <ul className="space-y-1.5">
            {filteredMenu.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id as View)}
                  className={`w-full flex items-center p-3.5 rounded-2xl transition-all ${
                    currentView === item.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <item.icon size={20} className="mr-3.5 shrink-0" />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-6 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center p-4 text-slate-400 hover:text-white hover:bg-red-500/10 rounded-2xl transition-all">
            <LogOut size={20} className="mr-3.5" />
            <span className="font-bold text-sm">Sair da Sessão</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors lg:hidden">
              <Menu size={26} className="text-slate-600" />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                {menuItems.find(m => m.id === currentView)?.label || 'Painel'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800 leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">{currentUser.role}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border-2 ${currentUser.role === UserRole.ADMIN ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar bg-slate-50/50">
          <div className="max-w-6xl mx-auto">{renderView()}</div>
        </div>
      </main>
    </div>
  );
};

export default App;
