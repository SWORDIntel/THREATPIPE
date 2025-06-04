
import React from 'react';

interface BadgeProps {
  text: string;
  color?: string; // Tailwind background color class e.g. 'bg-blue-500 text-white'
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  text, 
  color = 'bg-brand-surface-alt text-brand-text-secondary', 
  size = 'md', 
  dot = false 
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-sm';
  
  // Regex to remove text color classes (example: "text-red-500", "text-white").
  const textRemovalRegex = /text-[A-Za-z0-9_-]+/g;
  
  // Clean up color string by removing text classes and trimming whitespace
  const colorWithoutTextClass = color.replace(textRemovalRegex, '').trim();
  
  // Logic for determining the dot background color
  const dotShouldUseAccent = dot && (color.includes('bg-brand-surface') || color.includes('bg-brand-bg'));
  const dotBgBase = dotShouldUseAccent ? 'bg-brand-accent' : colorWithoutTextClass;
  
  // Ensure dotBgBase is actually a background class, if not, default to accent
  const dotBgClass = dot && dotBgBase.startsWith('bg-') ? dotBgBase : (dot ? 'bg-brand-accent' : '');

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeClasses} ${color}`}
    >
      {dot && <span className={`w-2 h-2 mr-1.5 rounded-full ${dotBgClass}`}></span>}
      {text}
    </span>
  );
};