
import { useEffect, useRef } from 'react';

export default function OtpInput({ length = 6, value, onChange, disabled, autoFocus = true }) {
  const inputs = useRef([]);

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const setDigit = (index, digit) => {
    const next = value.split('');
    next[index] = digit;
    onChange(next.join('').slice(0, length));
  };

  const handleChange = (index) => (event) => {
    const digit = event.target.value.replace(/\D/g, '').slice(-1);
    if (!digit) {
      setDigit(index, '');
      return;
    }
    setDigit(index, digit);
    if (index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index) => (event) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="otp-inputs" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputs.current[index] = node;
          }}
          className="otp-input"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={value[index] || ''}
          onChange={handleChange(index)}
          onKeyDown={handleKeyDown(index)}
          disabled={disabled}
          aria-label={'Verification code digit ' + (index + 1)}
        />
      ))}
    </div>
  );
}
