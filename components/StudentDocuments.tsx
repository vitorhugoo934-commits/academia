
import React, { useState } from 'react';
import { Files, Search, Upload, User, FileText, Trash2, Eye, Download, X, ImageIcon, Loader2, ExternalLink } from 'lucide-react';
import { Student, DocumentItem } from '../types';

interface StudentDocsProps {
  students: Student[];
  documents: DocumentItem[];
  onSaveDocument: (doc: Partial<DocumentItem>) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
}

const StudentDocuments: React.FC<StudentDocsProps> = ({ students, documents, onSaveDocument, onDeleteDocument }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.cpf.includes(searchTerm)
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentDocs = documents.filter(d => d.studentId === selectedStudentId);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedStudentId) return;
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const base64 = await fileToBase64(file);
        
        const newDoc: Partial<DocumentItem> = {
          title: file.name.split('.')[0],
          fileName: file.name,
          fileUrl: base64, // Persistindo o conteúdo como Base64
          fileType: file.type,
          studentId: selectedStudentId
        };
        
        await onSaveDocument(newDoc);
      } catch (err) {
        console.error("Erro no upload:", err);
        alert("Falha ao processar arquivo.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const renderPreview = () => {
    if (!previewDoc) return null;

    const isImage = previewDoc.fileType?.startsWith('image/');

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{previewDoc.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{previewDoc.fileName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={previewDoc.fileUrl} 
                download={previewDoc.fileName}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
              >
                <Download size={14} /> Download
              </a>
              <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-8 bg-slate-50 flex items-center justify-center min-h-[400px]">
            {isImage ? (
              <img src={previewDoc.fileUrl} alt={previewDoc.title} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
            ) : (
              <div className="text-center space-y-6 max-w-md">
                <div className="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto text-emerald-600">
                  <FileText size={64} />
                </div>
                <div>
                  <h5 className="font-black text-slate-800 text-xl mb-2">Prévia não disponível</h5>
                  <p className="text-slate-500 text-sm mb-6">Este tipo de arquivo ({previewDoc.fileType}) não pode ser visualizado diretamente no navegador, mas você pode baixá-lo.</p>
                  <a 
                    href={previewDoc.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-[0.2em] hover:underline"
                  >
                    Abrir em nova aba <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      <div className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[650px]">
        <div className="p-6 border-b border-slate-50">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Localizar servidor..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full p-5 text-left border-b border-slate-50 transition-all flex items-center space-x-4 hover:bg-emerald-50/50 group ${selectedStudentId === student.id ? 'bg-emerald-50/80' : ''}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110 ${selectedStudentId === student.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {student.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-black text-sm truncate uppercase tracking-tight ${selectedStudentId === student.id ? 'text-emerald-900' : 'text-slate-700'}`}>{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">CPF: {student.cpf}</p>
                </div>
                {selectedStudentId === student.id && (
                  <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                )}
              </button>
            ))
          ) : (
            <div className="p-10 text-center opacity-30">
              <Search size={40} className="mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Nenhum servidor</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {selectedStudent ? (
          <>
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 backdrop-blur-md border border-emerald-500/30">
                    <Files size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">{selectedStudent.name}</h3>
                    <p className="text-emerald-400/80 font-bold text-[10px] uppercase tracking-widest mt-1">Acervo Digital de Documentos</p>
                  </div>
                </div>
                <label className={`cursor-pointer bg-white text-slate-900 hover:bg-emerald-50 font-black px-6 py-3 rounded-2xl transition-all flex items-center gap-2 text-xs uppercase tracking-widest shadow-xl active:scale-95 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  {isUploading ? 'Processando...' : 'Anexar Novo Doc'}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>
              <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] group-hover:bg-emerald-500/20 transition-all duration-700" />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <FileText size={16} className="text-emerald-600" /> Documentação Arquivada (Salva no Sistema)
                </p>
                <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-[10px] font-black text-emerald-600 uppercase">
                  {studentDocs.length} Arquivo(s)
                </span>
              </div>
              
              <div className="divide-y divide-slate-50">
                {studentDocs.length > 0 ? (
                  studentDocs.map(doc => {
                    const isImg = doc.fileType?.startsWith('image/');
                    return (
                      <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group">
                        <div className="flex items-center space-x-5 min-w-0">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-emerald-600 overflow-hidden shrink-0 group-hover:border-emerald-200 transition-all">
                            {isImg && doc.fileUrl ? (
                              <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover" />
                            ) : (
                              <FileText size={24} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-800 uppercase tracking-tight text-sm truncate">{doc.title}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{doc.uploadDate}</span>
                              <span className="text-slate-200">|</span>
                              <span className="text-[9px] text-emerald-600 font-black uppercase tracking-tighter truncate max-w-[150px]">{doc.fileName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setPreviewDoc(doc)}
                            className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Visualizar documento"
                          >
                            <Eye size={20} />
                          </button>
                          <a 
                            href={doc.fileUrl} 
                            download={doc.fileName}
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Baixar arquivo"
                          >
                            <Download size={20} />
                          </a>
                          <button 
                            onClick={() => onDeleteDocument(doc.id)}
                            className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Excluir documento"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-24 text-center flex flex-col items-center justify-center px-10">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-100">
                      <Files className="text-slate-200" size={32} />
                    </div>
                    <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-2">Nenhum documento anexado</h4>
                    <p className="text-slate-400 text-[10px] font-medium leading-relaxed max-w-[200px]">
                      Use o botão acima para carregar atestados, termos de responsabilidade ou fotos do servidor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full min-h-[500px] bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 text-center shadow-inner">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
              <User className="text-slate-200" size={48} />
            </div>
            <h3 className="text-xl font-black text-slate-300 uppercase tracking-tight">Selecione um Servidor</h3>
            <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mt-2">Para gerenciar os documentos e anexos individuais</p>
          </div>
        )}
      </div>
      {renderPreview()}
    </div>
  );
};

export default StudentDocuments;
