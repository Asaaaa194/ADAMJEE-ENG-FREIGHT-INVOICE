import React, { useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string | number | undefined;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  tagName?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'strong' | 'td';
  isNumeric?: boolean;
  style?: React.CSSProperties;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '',
  multiline = false,
  tagName: Tag = 'span',
  isNumeric = false,
  style,
}) => {
  const ref = useRef<HTMLElement>(null);
  const stringVal = value !== undefined && value !== null ? String(value) : '';

  // Synchronize DOM with external state updates when not focused
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      if (ref.current.innerText !== stringVal) {
        ref.current.innerText = stringVal;
      }
    }
  }, [stringVal]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const text = (e.currentTarget as HTMLElement).innerText;
    onChange(text);
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const text = e.currentTarget.innerText;
    onChange(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    }
  };

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none transition-colors duration-150 rounded-xs px-0.5 min-w-[20px] inline-block ${
        isNumeric ? 'font-mono-num text-right' : ''
      } ${className}`}
      data-placeholder={placeholder}
      style={style}
    >
      {stringVal}
    </Tag>
  );
};
