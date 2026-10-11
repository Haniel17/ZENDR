import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PdfConverterWorkspace } from '../modules/pdf/PdfConverterWorkspace';
import { PdfToolsMenu } from '../modules/pdf/PdfToolsMenu';

export const PdfConverterPage: React.FC = () => {
  const { toolId } = useParams<{ toolId?: string }>();
  const navigate = useNavigate();

  const handleSelectTool = (newToolId: string) => {
    if (newToolId === 'menu') {
      navigate('/pdf-converter');
    } else {
      navigate(`/pdf-converter/${newToolId}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {toolId ? (
        <PdfConverterWorkspace
          toolId={toolId}
          onSelectTool={handleSelectTool}
        />
      ) : (
        <PdfToolsMenu />
      )}
    </div>
  );
};
