import dynamic from 'next/dynamic';

// Dynamically import heavy UI components
export const DynamicMonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

export const DynamicPDFViewer = dynamic(
  () => import('react-pdf'),
  { ssr: false }
);

export const DynamicDraftEditor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
);

// Add more dynamic imports for other heavy components as needed
