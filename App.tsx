
import React, { useState, useEffect } from 'react';
import { 
  Home, Users, ClipboardCheck, Ban, FileText, 
  Files, BarChart3, Clock, Menu, PlusCircle,
  LogOut, ShieldCheck, UserCog, ListOrdered, X, Loader2
} from 'lucide-react';
import { View, Student, AttendanceRecord, DocumentItem, Modality, User, UserRole } from './types';
import { studentService } from './services/studentService';
import { attendanceService } from './services/attendanceService';
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  const [teachers, setTeachers] = useState<User[]>([
    { id: 't1', name: 'Prof. Ricardo Silva', email: 'ricardo@gestao.go.gov.br', cpf: '111.111.111-11', role: UserRole.TEACHER, active: true },
    { id: 't2', name: 'Profa. Eliana Costa', email: 'eliana@gestao.go.gov.br', cpf: '222.222.222-22', role: UserRole.TEACHER, active: true },
  ]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedStudents, fetchedAttendance] = await Promise.all([
        studentService.getAll(),
        attendanceService.getToday()
      ]);
      setStudents(fetchedStudents);
      setAttendance(fetchedAttendance);
    } catch (err) {
      console.error("Erro ao carregar dados do Supabase:", err);
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
      s.trainingTime === student.trainingTime
    );

    const isFull = activeInSlot.length >= 10;
    const studentWithStatus = { ...student, onWaitlist: isFull };

    try {
      const savedStudent = await studentService.create(studentWithStatus);
      setStudents(prev => [...prev, savedStudent]);
      
      if (isFull) {
        alert(`AVISO: Turma lotada. Adicionado à FILA DE ESPERA.`);
        handleNavigate('waitlist');
      } else {
        handleNavigate('students-list');
      }
    } catch (err) {
      alert("Erro ao salvar matrícula. Verifique o console.");
    }
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Deseja realmente remover esta matrícula?")) return;
    try {
      await studentService.delete(id);
      setStudents(p => p.filter(s => s.id !== id));
    } catch (err) {
      alert("Erro ao remover.");
    }
  };

  const toggleStudentBlock = async (cpf: string) => {
    const student = students.find(s => s.cpf === cpf);
    if (!student) return;
    try {
      await studentService.toggleBlock(cpf, !student.blocked);
      setStudents(p => p.map(s => s.cpf === cpf ? {...s, blocked: !s.blocked} : s));
    } catch (err) {
      alert("Erro ao atualizar status.");
    }
  };

  const recordAttendance = async (record: AttendanceRecord) => {
    try {
      await attendanceService.record(record.studentCpf, record.hour, record.photo);
      setAttendance(p => [record, ...p]);
    } catch (err) {
      alert("Erro ao gravar frequência.");
    }
  };

  const menuItems = [
    { id: 'home', label: 'Início', icon: Home, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'attendance', label: 'Frequência', icon: ClipboardCheck, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: 'add-student', label: 'Matrícula', icon: PlusCircle, roles: [UserRole.ADMIN] },
    { id: 'students-list', label: 'Alunos', icon: Users, roles: [UserRole.ADMIN] },
    { id: 'waitlist', label: 'Espera', icon: ListOrdered, roles: [UserRole.ADMIN] },
    { id: 'block-student', label: 'Bloqueios', icon: Ban, roles: [UserRole.ADMIN] },
    { id: 'teachers', label: 'Equipe', icon: UserCog, roles: [UserRole.ADMIN] },
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
        <p className="font-bold uppercase tracking-widest text-xs">Sincronizando com Supabase...</p>
      </div>
    );

    switch (currentView) {
      case 'home': return <Dashboard students={students} attendance={attendance} onNavigate={handleNavigate} user={currentUser} />;
      case 'attendance': return <Attendance students={students} attendance={attendance} onAddAttendance={recordAttendance} />;
      case 'add-student': return <StudentForm onSave={addStudent} students={students} />;
      case 'students-list': return <StudentList students={students.filter(s => !s.onWaitlist)} onDelete={deleteStudent} isAdmin={currentUser.role === UserRole.ADMIN} />;
      case 'waitlist': return <Waitlist students={students.filter(s => s.onWaitlist)} onDelete={deleteStudent} />;
      case 'block-student': return <BlockManagement students={students} onToggleBlock={toggleStudentBlock} />;
      case 'teachers': return <TeacherManagement teachers={teachers} onAddTeacher={(t) => setTeachers(p => [...p, t])} onRemoveTeacher={(id) => setTeachers(p => p.filter(t => t.id !== id))} />;
      case 'documents': return <Documents documents={documents.filter(d => !d.studentId)} setDocuments={setDocuments} />;
      case 'student-documents': return <StudentDocuments students={students} documents={documents.filter(d => !!d.studentId)} setDocuments={setDocuments} />;
      case 'reports': return <Reports students={students} attendance={attendance} />;
      case 'schedules': return <Schedules />;
      default: return <Dashboard students={students} attendance={attendance} onNavigate={handleNavigate} user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans text-gray-900">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-slate-900 text-white flex flex-col shadow-xl
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h1 className="font-bold text-xl tracking-tight">Academia <span className="text-emerald-500">GO</span></h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><X size={20} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredMenu.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id as View)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    currentView === item.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className="mr-3 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center p-3 text-slate-400 hover:text-white transition-colors">
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
            <h2 className="text-lg font-bold text-gray-800 truncate">{menuItems.find(m => m.id === currentView)?.label || 'Sistema'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-700">{currentUser.name}</p>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-tighter">{currentUser.role}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700 border-2 border-emerald-200">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">{renderView()}</div>
        </div>
      </main>
    </div>
  );
};

export default App;
