
import { supabase } from '../lib/supabase';
import { AttendanceRecord } from '../types';

export const attendanceService = {
  async getToday() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .gte('timestamp', `${today}T00:00:00`)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      studentCpf: row.student_cpf,
      timestamp: row.timestamp,
      hour: row.hour,
      photo: row.photo_url
    }));
  },

  async record(studentCpf: string, hour: string, photo?: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .insert([{
        student_cpf: studentCpf,
        hour: hour,
        photo_url: photo
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  }
};
