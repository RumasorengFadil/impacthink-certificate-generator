import { useRef, useState, useEffect } from 'react';
import { Move } from 'lucide-react';
import { TextElement } from '@/types';

interface DraggableTextProps {
  element: TextElement;
  content: string;
  onDrag: (x: number, y: number) => void;
  scale: number;
}

export function DraggableText({ element, content, onDrag, scale }: DraggableTextProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLDivElement>(null);
console.log(element)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const rect = textRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const parent = textRef.current?.offsetParent as HTMLElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const newX = e.clientX - parentRect.left - dragOffset.x;
    const newY = e.clientY - parentRect.top - dragOffset.y;

    onDrag(newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragOffset]);

  // Calculate scaled position and font size
  const displayX = element.x * scale;
  const displayY = element.y * scale;
  const displayFontSize = element.fontSize * scale;
  const displayWidth = element.width * scale;

  return (
    <div
      ref={textRef}
      className={`absolute cursor-move group transition-all ${
        isDragging ? 'opacity-80 z-50' : 'hover:ring-2 hover:ring-blue-500 hover:ring-offset-2'
      }`}
      style={{
        left: `${displayX}px`,
        top: `${displayY}px`,
        fontSize: `${displayFontSize}px`,
        fontFamily: element.fontFamily,
        color: element.color,
        textAlign: element.textAlign,
        userSelect: 'none',
        width: `${displayWidth}px`,
        fontWeight: element.fontWeight
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Drag Handle */}
      <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-blue-600 text-white p-1 rounded shadow-lg">
          <Move className="w-4 h-4" />
        </div>
      </div>

      {/* Text Content */}
      <div
        className={`px-2 py-1 rounded relative ${
          isDragging ? 'bg-blue-100 bg-opacity-50' : ''
        }`}
      >
        {content || 'Empty'}
        
        {/* Alignment indicator line (shown on hover) */}
        {!isDragging && (
          <div className="absolute opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity" 
            style={{
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: '#2563eb',
              left: element.textAlign === 'left' ? '0' : 
                    element.textAlign === 'center' ? '50%' : 
                    element.textAlign === 'right' ? '100%' : '0',
            }}
          />
        )}
      </div>

      {/* Label */}
      <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
          {element.type === 'certNumber' ? 'Certificate Number' : 
           element.type === 'issueDate' ? 'Issue Date' : 
           'Recipient Name'}
        </div>
      </div>
    </div>
  );
}