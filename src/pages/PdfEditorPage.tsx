import React from 'react';
import { PdfEditorWorkspace } from '../modules/pdf-editor/PdfEditorWorkspace';

export const PdfEditorPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden">
      <PdfEditorWorkspace />
    </div>
  );
};
