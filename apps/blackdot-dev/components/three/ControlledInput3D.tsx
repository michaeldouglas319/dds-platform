'use client';

import { useRef, useEffect, useState } from 'react';

export interface ControlledInput3DProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password';
}

/**
 * ControlledInput3D - Pure HTML input for 3D forms
 *
 * Manages cursor position preservation for 3D input fields.
 * Based on pmnd.rs pattern for Html transform inputs.
 *
 * @example
 * ```tsx
 * <ControlledInput3D
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   placeholder="Email"
 * />
 * ```
 */
export const ControlledInput3D = ({
  value,
  onChange,
  type = 'text',
  ...rest
}: ControlledInput3DProps) => {
  const [cursor, setCursor] = useState<number | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  // Preserve cursor position when value changes
  useEffect(() => {
    const input = ref.current;
    if (input && type === 'text' && cursor !== null) {
      try {
        input.setSelectionRange(cursor, cursor);
      } catch (e) {
        // Ignore errors for input types that don't support selection
      }
    }
  }, [ref, cursor, value, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCursor(e.target.selectionStart);
    onChange?.(e);
  };

  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={handleChange}
      {...rest}
    />
  );
};

export default ControlledInput3D;
