import React, { useState } from 'react';
import CodeInput from '@components/ui/CodeInput';

interface CodeEntryProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

/** Campo de codigo numerico que expoe o valor como texto unico. */
function CodeEntry({ value, onChange, length = 6 }: CodeEntryProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  return (
    <CodeInput
      length={length}
      verificationCode={digits}
      setVerificationCode={(next) => {
        const resolved = typeof next === 'function' ? next(digits) : next;
        onChange(resolved.join('').replace(/\D/g, '').slice(0, length));
      }}
      focusedIndex={focusedIndex}
      setFocusedIndex={setFocusedIndex}
    />
  );
}

export default CodeEntry;
