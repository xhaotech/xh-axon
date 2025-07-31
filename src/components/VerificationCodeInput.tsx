import React, { useState, useRef, useEffect } from 'react';

interface VerificationCodeInputProps {
  length?: number;
  onChange: (code: string) => void;
  value: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  length = 6,
  onChange,
  value,
  disabled = false,
  autoFocus = false
}) => {
  const [codes, setCodes] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // 当外部value变化时，更新内部状态
    const newCodes = value.split('').slice(0, length);
    while (newCodes.length < length) {
      newCodes.push('');
    }
    setCodes(newCodes);
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, inputValue: string) => {
    // 只允许数字
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newCodes = [...codes];
      newCodes[index] = numericValue;
      setCodes(newCodes);
      onChange(newCodes.join(''));

      // 自动跳转到下一个输入框
      if (numericValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numericValue.length === length) {
      // 粘贴完整验证码的情况
      const newCodes = numericValue.split('');
      setCodes(newCodes);
      onChange(newCodes.join(''));
      
      // 聚焦到最后一个输入框
      inputRefs.current[length - 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!codes[index] && index > 0) {
        // 如果当前框为空且按下退格，跳转到前一个框
        inputRefs.current[index - 1]?.focus();
      } else {
        // 清空当前框
        const newCodes = [...codes];
        newCodes[index] = '';
        setCodes(newCodes);
        onChange(newCodes.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    
    if (pastedData.length === length) {
      const newCodes = pastedData.split('');
      setCodes(newCodes);
      onChange(newCodes.join(''));
      
      // 聚焦到最后一个输入框
      inputRefs.current[length - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // 选中当前输入框的内容
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-2 justify-center">
      {codes.map((code, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`
            w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200 ease-in-out
            ${code ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-blue-300'}
            focus:outline-none
          `}
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'textfield'
          }}
        />
      ))}
    </div>
  );
};
