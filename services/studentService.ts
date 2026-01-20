
import { supabase } from '../lib/supabase';
import { Student } from '../types';

const mapFromDb = (row: any): Student => ({
  id: row.id,
  cpf: row.cpf,
  name: row.name,
  department: row.department,
  phone: row.phone,
  birthDate: row.birth_date,
  age: row.age,
  gender: row.gender,
  blocked: row.blocked,
  onWaitlist: row.on_waitlist,
  modality: row.modality,
  trainingDays: row.training_days,
  trainingTime: row.training_time,
  createdAt: row.created_at
});

const mapToDb = (student: Partial<Student>) => ({
  cpf: student.cpf,
  name: student.name,
  department: student.department,
  phone: student.phone,
  birth_date: student.birthDate,
  age: student.age,
  gender: student.gender,
  blocked: student.blocked,
  on_waitlist: student.onWaitlist,
  modality: student.modality,
  training_days: student.trainingDays,
  training_time: student.trainingTime
});

export const studentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(mapFromDb);
  },

  async create(student: Student) {
    const { data, error } = await supabase
      .from('students')
      .insert([mapToDb(student)])
      .select();
    
    if (error) throw error;
    return mapFromDb(data[0]);
  },

  async toggleBlock(cpf: string, isBlocked: boolean) {
    const { error } = await supabase
      .from('students')
      .update({ blocked: isBlocked })
      .eq('cpf', cpf);
    
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
