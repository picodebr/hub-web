import React from 'react';
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
  FaFile,
} from 'react-icons/fa';

interface FileIconProps {
  fileName?: string;
  size?: number | string;
  color?: string;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ fileName = '', size = 24, color, className }) => {
  // Função para extrair a extensão do arquivo em minúsculas
  const getExtension = (name: string) => {
    if (!name) return '';
    // Remove query params caso seja uma URL e pega a extensão
    const cleanName = name.split(/[#?]/)[0];
    return cleanName.includes('.') ? cleanName.split('.').pop()?.toLowerCase() : '';
  };

  const extension = getExtension(fileName);

  // Mapeamento de extensões para ícones
  const iconMap: Record<string, React.ElementType> = {
    // Documentos
    pdf: FaFilePdf,
    doc: FaFileWord,
    docx: FaFileWord,
    xls: FaFileExcel,
    xlsx: FaFileExcel,
    csv: FaFileExcel,
    ppt: FaFilePowerpoint,
    pptx: FaFilePowerpoint,
    txt: FaFileAlt,
    md: FaFileAlt,

    // Imagens
    jpg: FaFileImage,
    jpeg: FaFileImage,
    png: FaFileImage,
    gif: FaFileImage,
    svg: FaFileImage,
    webp: FaFileImage,

    // Vídeos
    mp4: FaFileVideo,
    avi: FaFileVideo,
    mkv: FaFileVideo,
    mov: FaFileVideo,
    webm: FaFileVideo,

    // Áudios
    mp3: FaFileAudio,
    wav: FaFileAudio,
    ogg: FaFileAudio,

    // Compactados
    zip: FaFileArchive,
    rar: FaFileArchive,
    '7z': FaFileArchive,
    tar: FaFileArchive,
    gz: FaFileArchive,

    // Códigos
    html: FaFileCode,
    css: FaFileCode,
    js: FaFileCode,
    ts: FaFileCode,
    tsx: FaFileCode,
    json: FaFileCode,
  };

  // Seleciona o ícone mapeado ou cai no ícone de arquivo genérico
  const IconComponent = iconMap[extension as string] || FaFile;

  // Renderiza o ícone passando as props de estilização
  return <IconComponent size={size} color={color || getDefaultColor(extension as string)} className={className} />;
};

// Bônus: Função opcional para dar cores automáticas baseadas no tipo de arquivo
const getDefaultColor = (ext: string) => {
  const colors: Record<string, string> = {
    pdf: '#E53E3E', // Vermelho (PDF)
    doc: '#3182CE',
    docx: '#3182CE', // Azul (Word)
    xls: '#38A169',
    xlsx: '#38A169',
    csv: '#38A169', // Verde (Excel)
    ppt: '#DD6B20',
    pptx: '#DD6B20', // Laranja (PowerPoint)
    jpg: '#D69E2E',
    jpeg: '#D69E2E',
    png: '#D69E2E',
    svg: '#D69E2E', // Amarelo/Dourado (Imagens)
    mp4: '#805AD5',
    avi: '#805AD5',
    mkv: '#805AD5', // Roxo (Vídeos)
    zip: '#718096',
    rar: '#718096', // Cinza (Arquivos)
  };

  return colors[ext] || '#A0AEC0'; // Cor padrão (Gray 400 do Chakra)
};
