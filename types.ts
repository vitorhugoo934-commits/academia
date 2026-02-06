
export enum Modality {
  ACADEMIA = 'Academia',
  FUNCIONAL = 'Funcional',
  DANCA = 'Dança'
}

export enum UserRole {
  ADMIN = 'Administrador',
  TEACHER = 'Professor'
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  active: boolean;
  password?: string; // Usado apenas na gestão
}

export interface Student {
  id: string;
  cpf: string;
  name: string;
  department: string;
  phone: string;
  birthDate: string;
  age: number;
  gender: string;
  blocked: boolean;
  onWaitlist?: boolean;
  modality: Modality;
  trainingDays?: string;
  trainingTime?: string;
  turma?: string; // Turma A ou Turma B
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentCpf: string;
  timestamp: string;
  hour: string;
  photo?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  fileName: string;
  uploadDate: string;
  fileUrl?: string; // URL para visualização/download
  fileType?: string; // MIME Type
  studentId?: string;
}

export type View = 'home' | 'attendance' | 'add-student' | 'block-student' | 'documents' | 'student-documents' | 'reports' | 'schedules' | 'teachers' | 'students-list' | 'waitlist' | 'system-users';
