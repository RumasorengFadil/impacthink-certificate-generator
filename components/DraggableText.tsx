import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Move } from 'lucide-react';
import { CalculateAlignedXParams, TextElement } from '@/types';

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
  const [textWidth, setTextWidth] = useState(0);

  useLayoutEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.offsetWidth);
    }
  }, [content, element.fontSize, element.fontFamily, element.fontWeight]);


  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const parent = textRef.current?.offsetParent as HTMLElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();

    const alignOffset = getAlignOffset();

    setDragOffset({
      x: e.clientX - parentRect.left - element.x + alignOffset,
      y: e.clientY - parentRect.top - element.y,
    });
  };

  const getAlignOffset = () => {
    const el = textRef.current;
    if (!el) return 0;

    const width = el.offsetWidth;

    if (element.align === 'center') return width / 2;
    if (element.align === 'right') return width;
    return 0;
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
  }, [isDragging, dragOffset]);

  const getFontFamily = (fontFamily: string) => {
    if (fontFamily.toLowerCase() === "poppins") {
      return 'var(--font-poppins)';
    }
    if (fontFamily.toLowerCase() === "montserrat") {
      return 'var(--font-montserrat)';
    }

    return fontFamily;
  }

  function calculateAlignedX({
    x,
    width,
    align,
  }: CalculateAlignedXParams): number {
    switch (align) {
      case 'center':
        return x - width / 2;

      case 'right':
        return x - width;

      case 'left':
      default:
        return x;
    }
  }

  const calculatedX = calculateAlignedX({
    x: element.x,
    width: textWidth,
    align: element.align,
  });

  return (
    <div
      ref={textRef}
      className={`absolute cursor-move group transition-all ${isDragging ? 'opacity-80 z-50' : 'hover:ring-2 hover:ring-blue-500 hover:ring-offset-2'
        }`}
      style={{
        left: `${calculatedX * scale}px`,
        top: `${element.y * scale}px`,
        fontSize: `${element.fontSize * scale}px`,
        fontFamily: getFontFamily(element.fontFamily),
        color: element.color,
        userSelect: 'none',
        fontWeight: element.fontWeight,
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
        className={`px-2 py-1 rounded text-nowrap ${isDragging ? 'bg-blue-100 bg-opacity-50' : ''
          }`}
      >
        {content || 'Empty'}
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