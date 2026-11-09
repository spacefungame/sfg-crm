import React, { useRef, useEffect } from 'react';

const normalizeDateValue = (val: string | undefined | null): string => {
  if (!val) return '';
  const matchFR = val.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (matchFR) {
    return `${matchFR[3]}-${matchFR[2]}-${matchFR[1]}`;
  }
  return val;
};

interface SmartDateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  value: string | undefined | null;
  onChange: (newValue: string) => void;
  /**
   * When true (for modals with a submit button), updates parent state as soon as a complete date is entered
   * without re-assigning DOM .value while focused.
   * When false (default, for auto-saving inline fields), commits on blur, Enter, or mouse calendar selection.
   */
  immediateStateUpdate?: boolean;
  /**
   * When true (e.g. in sorted tables like ProjectsTableView), even calendar picker changes wait until blur/Enter
   * so the row does not jump away while the input is still focused.
   */
  commitOnBlurOnly?: boolean;
}

export const SmartDateInput: React.FC<SmartDateInputProps> = ({
  value,
  onChange,
  immediateStateUpdate = false,
  commitOnBlurOnly = false,
  type = 'date',
  onFocus,
  onBlur,
  onKeyDown,
  ...rest
}) => {
  const normalizedProp = normalizeDateValue(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef<boolean>(false);
  const lastCommittedRef = useRef<string>(normalizedProp);

  // Sync external value changes ONLY when the input is not actively focused by the user
  useEffect(() => {
    lastCommittedRef.current = normalizedProp;
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = normalizedProp;
    }
  }, [normalizedProp]);

  const commitValue = (val: string) => {
    const clean = normalizeDateValue(val);
    if (clean !== lastCommittedRef.current) {
      lastCommittedRef.current = clean;
      onChange(clean);
    }
  };

  const isCompleteValidYear = (val: string): boolean => {
    if (!val) return true;
    // Matches YYYY-MM-DD or YYYY-MM where year starts with 19 or 20 (not 0002, 0020, 0202 during typing)
    return /^(19|20)\d{2}-\d{2}(-\d{2})?$/.test(val);
  };

  return (
    <input
      {...rest}
      ref={inputRef}
      type={type}
      defaultValue={normalizedProp}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          isTypingRef.current = false;
          if (inputRef.current) {
            commitValue(inputRef.current.value);
            inputRef.current.blur();
          }
        } else if (e.key !== 'Tab' && e.key !== 'Escape') {
          isTypingRef.current = true;
        }
        if (onKeyDown) onKeyDown(e);
      }}
      onChange={(e) => {
        const currentVal = e.target.value;
        if (immediateStateUpdate) {
          if (isCompleteValidYear(currentVal)) {
            commitValue(currentVal);
          }
        } else if (!commitOnBlurOnly && !isTypingRef.current) {
          // Changed via mouse calendar picker -> commit immediately if valid
          if (isCompleteValidYear(currentVal)) {
            commitValue(currentVal);
          }
        }
      }}
      onFocus={(e) => {
        isTypingRef.current = false;
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        isTypingRef.current = false;
        const finalVal = e.target.value;
        commitValue(finalVal);
        if (onBlur) onBlur(e);
      }}
    />
  );
};
