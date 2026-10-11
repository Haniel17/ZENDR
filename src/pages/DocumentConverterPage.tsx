import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PdfConverterWorkspace } from '../modules/pdf/PdfConverterWorkspace';

export const DocumentConverterPage: React.FC = () => {
  const { toolId } = useParams<{ toolId?: string }>();
  const navigate = useNavigate();

  const handleSelectTool = (newToolId: string) => {
    navigate(`/document-converter/${newToolId}`);
  };

  return (
    <div className="flex-1 flex flex-col">
      <PdfConverterWorkspace
        toolId={toolId || 'pdf-to-docx'}
        onSelectTool={handleSelectTool}
      />
    </div>
  );
};
