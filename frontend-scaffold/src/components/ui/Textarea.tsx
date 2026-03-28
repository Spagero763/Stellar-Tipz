import React, { useState } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  rows?: number;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  maxLength,
  rows = 4,
  className = '',
  id,
  onChange,
  value,
  defaultValue,
  ...props
}) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const [charCount, setCharCount] = useState(() => {
    const initialValue = value?.toString() || defaultValue?.toString() || '';
    return initialValue.length;
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    onChange?.(e);
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-bold uppercase tracking-wide mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        className={`w-full px-4 py-3 border-2 border-black bg-white text-black font-medium
          focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:shadow-brutalist
          placeholder:text-gray-400 resize-y ${error ? 'border-red-600' : ''} ${className}`}
        onChange={handleChange}
        value={value}
        defaultValue={defaultValue}
        {...props}
      />
      <div className="flex justify-between items-center mt-1">
        {error ? (
          <p className="text-sm text-red-600 font-medium">{error}</p>
        ) : (
          <div />
        )}
        {maxLength && (
          <p className={`text-sm font-medium ${charCount >= maxLength ? 'text-red-600' : 'text-gray-500'}`}>
            {charCount} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );;
};

export default Textarea;
