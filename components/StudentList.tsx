
import React, { useState, useMemo } from 'react';
import { Search, Trash2, Building, ShieldCheck, ShieldAlert, Dumbbell, Activity, Music, Clock, Edit3, X, Save, Loader2 } from 'lucide-react';
import { Student, Modality } from '../types';
import StudentForm from './StudentForm';

interface StudentListProps {
  students: Student[];
  onDelete: (id: string) => void;
  onUpdate: (student: Student) => Promise<void>;
  isAdmin: boolean;
}

const StudentList: React.FC<StudentListProps> = ({ students, onDelete, onUpdate, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtra alunos baseados na busca
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.cpf.includes(searchTerm)
    );
  }, [students, searchTerm]);

  // Agrupa alunos por horário
  const groupedByTime = useMemo(() => {
    const groups: Record<string, Student[]> = {};
    filteredStudents.forEach(s => {
      const time = s.trainingTime || 'Não Definido';
      if (!groups[time]) groups[time] = [];
      groups[time].push(s);
    });
    // Ordena as chaves dos horários (ex: 06h, 07h...)
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, Student[]>);
  }, [filteredStudents]);

  const handleEditSave = async (updatedData: Student) => {
    setIsUpdating(true);
    try {
      await onUpdate(updatedData);
      setEditingStudent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getModalityIcon = (modality: Modality) => {
    switch (modality) {
      case Modality.ACADEMIA: return <Dumbbell size={14} />;
      case Modality.FUNCIONAL: return <Activity size={14} />;
      case Modality.DANCA: return <Music size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-10">
      {/* Header e Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">Alunos Ativos</h2>
          <p className="text-emerald-600 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Organizado por Grade de Horário</p>
        </div>
        
        <div className="relative group w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou CPF..."
            className="pl-11 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl w-full md:w-80 focus:border-emerald-500 outline-none transition-all shadow-sm font-bold text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista Agrupada */}
      <div className="space-y-12">
        {/* Fix: Explicitly cast Object.entries to ensure groupStudents is inferred as Student[] */}
        {(Object.entries(groupedByTime) as [string, Student[]][]).map(([time, groupStudents]) => (
          <section key={time} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-none">{time}</h3>
                {/* Fix: groupStudents is now correctly typed as Student[] */}
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{groupStudents.length} Servidores neste horário</p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-black tracking-widest">
                      <th className="px-6 py-4">Servidor</th>
                      <th className="px-6 py-4">Modalidade</th>
                      <th className="px-6 py-4">Lotação / Unidade</th>
                      <th className="px-6 py-4">Frequência</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {/* Fix: groupStudents is now correctly typed as Student[] */}
                    {groupStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
                              {student.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-xs truncate max-w-[200px]">{student.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold font-mono">CPF {student.cpf}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg w-fit">
                            <span className="text-slate-600">{getModalityIcon(student.modality)}</span>
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{student.modality}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                            <Building size={12} className="text-slate-300" />
                            {student.department}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                            {student.trainingDays?.split(',')[0]}...
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {student.blocked ? (
                            <span className="flex items-center gap-1 text-red-600 text-[9px] font-black uppercase"><ShieldAlert size={12}/> Bloqueado</span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-600 text-[9px] font-black uppercase"><ShieldCheck size={12}/> Ativo</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => setEditingStudent(student)}
                              className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              title="Editar Matrícula"
                            >
                              <Edit3 size={16} />
                            </button>
                            {isAdmin && (
                              <button 
                                onClick={() => onDelete(student.id)} 
                                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Excluir Aluno"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}

        {Object.keys(groupedByTime).length === 0 && (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Search size={48} className="mx-auto text-slate-100 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum aluno encontrado para os critérios de busca.</p>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {editingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-sm">Editar Cadastro do Servidor</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Atualize os dados e a grade de horário</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingStudent(null)} 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <StudentForm 
                initialData={editingStudent} 
                onSave={handleEditSave} 
                students={students.filter(s => s.id !== editingStudent.id)} // Passa outros alunos para cálculo de vagas
                isSaving={isUpdating}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
