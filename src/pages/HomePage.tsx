import React, { useRef } from 'react';
import { Hero } from '../components/Hero';
import { ToolsGrid } from '../components/ToolsGrid';

export const HomePage: React.FC = () => {
  const toolsSectionRef = useRef<HTMLDivElement>(null);

  const handleScrollToTools = () => {
    toolsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col">
      <Hero onScrollToTools={handleScrollToTools} />
      <div ref={toolsSectionRef} id="tools">
        <ToolsGrid />
      </div>
    </div>
  );
};
