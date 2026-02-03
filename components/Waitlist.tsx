
import React, { useState } from 'react';
import { Search, Trash2, User, Building, Phone, ListOrdered, Clock, Info } from 'lucide-react';
import { Student } from '../types';

interface WaitlistProps {
  students: Student[];
  onDelete: (id: string) => void;
}

const Waitlist: React.FC<WaitlistProps> = ({ students, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-emerald-950 uppercase tracking-tight flex items-center gap-3">
            <ListOrdered size={32} className="text-orange-500" />
            Fila de Espera
          </h2>
          <p className="text-orange-600 font-bold text-xs uppercase tracking-widest">Servidores aguardando vaga (Capacidade: 12/turma)</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Buscar na fila por nome ou CPF..."
            className="pl-12 pr-6 py-4 border-2 border-emerald-50 rounded-2xl w-full md:w-[450px] focus:ring-8 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all shadow-xl shadow-gray-200/50 font-bold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-orange-50 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-emerald-950 text-emerald-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="p-6">Servidor / Identificação</th>
                <th className="p-6">Unidade Lotação</th>
                <th className="p-6">Pretendido</th>
                <th className="p-6">Status Fila</th>
                <th className="p-6 text-center">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filteredStudents.map((student, index) => (
                <tr key={student.id} className="hover:bg-orange-50/30 transition-all group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner bg-orange-100 text-orange-700 border-2 border-orange-200">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-black text-gray-800 text-base leading-tight group-hover:text-emerald-800 transition-colors">{student.name}</p>
                        <p className="text-[11px] text-emerald-600 font-bold font-mono tracking-tighter">CPF {student.cpf}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                      <Building size={16} className="text-emerald-400" />
                      {student.department}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400 mt-1">
                      <Phone size={12} /> {student.phone}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1.5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit shadow-sm bg-gray-600 text-white`}>
                        {student.modality}
                      </span>
                      <p className="text-[10px] text-emerald-700 font-black uppercase tracking-tighter italic">
                        {student.trainingDays} - {student.trainingTime}
                      </p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-orange-700 font-black text-[10px] uppercase bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 w-fit">
                      <Clock size={14} />
                      Aguardando Vaga
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => onDelete(student.id)}
                        className="p-3 text-emerald-200 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all hover:rotate-12 transform"
                        title="Remover Servidor da Fila"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ListOrdered className="text-orange-200" size={48} />
                    </div>
                    <p className="text-emerald-900 font-black uppercase tracking-widest">A fila de espera está vazia.</p>
                    <p className="text-emerald-600/60 text-xs font-bold mt-2">Novos registros em turmas lotadas aparecerão aqui.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-center gap-4 shadow-xl">
        <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
          <Info size={24} />
        </div>
        <div>
          <p className="text-xs text-amber-950 font-black uppercase tracking-[0.2em]">Promoção Automática</p>
          <p className="text-[11px] text-amber-700 font-medium">Ao excluir um aluno ativo, o primeiro servidor na fila de espera daquela mesma turma será habilitado automaticamente.</p>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;
