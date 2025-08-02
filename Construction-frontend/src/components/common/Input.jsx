import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helpText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputClasses = `
    block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm
    bg-white dark:bg-slate-700 text-gray-900 dark:text-white
    focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400
    disabled:bg-gray-50 dark:disabled:bg-slate-600 disabled:text-gray-500 dark:disabled:text-gray-400
    placeholder-gray-400 dark:placeholder-gray-500
    ${error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400' : ''}
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  );
};

export default Input;
