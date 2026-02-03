
import React, { useState, useEffect } from 'react';
import { UserPlus, Save, Phone, Building, Hash, Calendar, User, Clock, AlertTriangle, CalendarDays, Loader2, Dumbbell } from 'lucide-react';
import { Student, Modality } from '../types';

interface StudentFormProps {
  onSave: (student: Student) => void;
  students: Student[];
  initialData?: Student;
  isSaving?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSave, students, initialData, isSaving }) => {
  const [formData, setFormData] = useState<Partial<Student>>(initialData || {
    cpf: '', name: '', department: '', phone: '', birthDate: '', age: 0, gender: 'Masculino',
    modality: Modality.ACADEMIA, trainingDays: 'Segunda, Quarta e Sexta', trainingTime: '', blocked: false
  });

  useEffect(() => {
    if (formData.birthDate) {
      const birth = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age: age >= 0 ? age : 0 }));
    }
  }, [formData.birthDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!formData.trainingTime) return alert('Por favor, selecione um horário.');
    
    onSave({
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      cpf: formData.cpf?.replace(/\D/g, '') || '',
      name: formData.name || '',
      department: formData.department || '',
      phone: formData.phone || '',
      birthDate: formData.birthDate || '',
      age: formData.age || 0,
      gender: formData.gender || 'Masculino',
      blocked: formData.blocked || false,
      onWaitlist: formData.onWaitlist,
      modality: formData.modality as Modality,
      trainingDays: formData.trainingDays,
      trainingTime: formData.trainingTime,
      createdAt: formData.createdAt || new Date().toISOString()
    });
  };

  const getOccupancy = (time: string) => 
    students.filter(s => 
      !s.onWaitlist && 
      s.modality === formData.modality && 
      s.trainingDays === formData.trainingDays && 
      s.trainingTime === time
    ).length;

  const dayOptions = ['Segunda, Quarta e Sexta', 'Terça e Quinta'];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="bg-emerald-600 p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <UserPlus size={24} /> {initialData ? 'Atualizar Matrícula' : 'Nova Matrícula'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
            <input required disabled={isSaving} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Unidade/Gerência</label>
            <input required disabled={isSaving} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">CPF</label>
            <input required disabled={isSaving || !!initialData} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:bg-slate-50" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp</label>
            <input required disabled={isSaving} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Sexo</label>
            <select disabled={isSaving} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all disabled:opacity-50" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nascimento</label>
            <input required disabled={isSaving} type="date" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
          </div>

          <div className="md:col-span-3 space-y-4 pt-4 border-t">
            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
              <Dumbbell size={18} className="text-emerald-600" /> Modalidade
            </label>
            <div className="flex flex-wrap gap-2">
              {[Modality.ACADEMIA, Modality.FUNCIONAL, Modality.DANCA].map(mod => (
                <button key={mod} type="button" disabled={isSaving} onClick={() => setFormData({...formData, modality: mod})} className={`px-6 py-2 rounded-full border-2 font-bold transition-all ${formData.modality === mod ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200'}`}>
                  {mod}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-4 pt-4 border-t">
            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
              <CalendarDays size={18} className="text-emerald-600" /> Dias
            </label>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map(days => (
                <button key={days} type="button" disabled={isSaving} onClick={() => setFormData({...formData, trainingDays: days})} className={`px-6 py-2 rounded-full border-2 font-bold transition-all ${formData.trainingDays === days ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}>
                  {days}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-4 pt-4 border-t">
            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
              <Clock size={18} className="text-emerald-600" /> Horário
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {(formData.modality === Modality.ACADEMIA ? ['06h','07h','11h','12h','13h','17h','18h','19h'] : ['07h10','11h10','17h10','18h']).map(time => {
                const occ = getOccupancy(time);
                // Atualizado limite para 12 alunos por turma
                const full = occ >= 12;
                return (
                  <button key={time} type="button" disabled={isSaving} onClick={() => setFormData({...formData, trainingTime: time})} className={`p-3 rounded-lg border-2 text-center transition-all ${formData.trainingTime === time ? 'bg-emerald-600 border-emerald-600 text-white ring-2 ring-emerald-100' : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-emerald-200'}`}>
                    <div className="text-sm font-bold">{time}</div>
                    <div className={`text-[10px] font-medium ${full ? (formData.trainingTime === time ? 'text-white/80' : 'text-orange-600') : 'text-emerald-600'}`}>{occ}/12 vagas</div>
                    {full && <div className={`text-[10px] font-black uppercase mt-1 leading-none ${formData.trainingTime === time ? 'text-orange-200' : 'text-orange-600'}`}>Fila de Espera</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t">
          <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-emerald-400">
            {isSaving ? <><Loader2 className="animate-spin" size={20} /> Salvando...</> : <><Save size={20} /> Salvar Matrícula</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
