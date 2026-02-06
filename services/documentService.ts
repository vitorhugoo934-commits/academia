
import { supabase } from '../lib/supabase';
import { DocumentItem } from '../types';

export const documentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('upload_date', { ascending: false });
    
    if (error) {
      console.error("Erro Supabase (documentService.getAll):", error.message);
      // Retornar array vazio se a tabela não existir ou erro de permissão para não quebrar o app
      if (error.code === '42P01' || error.status === 404) return []; 
      throw error;
    }
    
    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      fileName: row.file_name,
      uploadDate: row.upload_date,
      fileUrl: row.file_url,
      fileType: row.file_type,
      studentId: row.student_id
    }));
  },

  async create(doc: Partial<DocumentItem>) {
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        title: doc.title,
        file_name: doc.fileName,
        file_url: doc.fileUrl,
        file_type: doc.fileType,
        student_id: doc.studentId,
        upload_date: new Date().toLocaleDateString('pt-BR')
      }])
      .select();
    
    if (error) {
      console.error("Erro Supabase (documentService.create):", error.message);
      throw error;
    }
    
    const row = data[0];
    return {
      id: row.id,
      title: row.title,
      fileName: row.file_name,
      uploadDate: row.upload_date,
      fileUrl: row.file_url,
      fileType: row.file_type,
      studentId: row.student_id
    };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Erro Supabase (documentService.delete):", error.message);
      throw error;
    }
  }
};
