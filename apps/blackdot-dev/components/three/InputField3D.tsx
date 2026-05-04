'use client';

import { Text, Html } from '@react-three/drei';
import { ControlledInput3D } from './ControlledInput3D';

export interface InputField3DProps {
  /** Current input value */
  value: string;

  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Input type (text, password, email) */
  type?: 'text' | 'password' | 'email';

  /** Position in 3D space */
  position?: [number, number, number];

  /** Color of text */
  color?: string;

  /** Color when empty */
  emptyColor?: string;

  /** Font size for display text */
  fontSize?: number;
}

/**
 * InputField3D - A 3D input field using Html transform pattern (pmnd.rs style)
 *
 * Features:
 * - Actual HTML input element with transparent styling
 * - 3D Text display that mirrors input value
 * - Cursor position preservation for text inputs
 * - Simple, proven styling from pmnd.rs
 * - Supports email, password, text input types
 *
 * @example
 * ```tsx
 * <InputField3D
 *   position={[0, 0, 0]}
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   placeholder="Email address"
 *   type="email"
 * />
 * ```
 */
export const InputField3D = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  position = [0, 0, 0],
  color = '#1f2937',
  emptyColor = '#9ca3af',
  fontSize = 0.32,
}: InputField3DProps) => {
  const width = 2.2;
  const height = 0.5;

  // Determine what to display: masked password, value, or placeholder
  let displayText = value;
  if (type === 'password' && value) {
    displayText = '*'.repeat(value.length);
  } else if (!value && placeholder) {
    displayText = placeholder;
  }

  return (
    <group position={position}>
      {/* Display text - shows the input value (pmnd.rs style) */}
      <Text
        position={[-width / 2 + 0.15, 0, 0.01]}
        fontSize={fontSize}
        color={value ? color : emptyColor}
        anchorX="left"
        anchorY="middle"
        fontWeight={500}
      >
        {displayText}
      </Text>

      {/* Background plane - simple, clean (pmnd.rs style) */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          transparent
          opacity={0.2}
          depthWrite={false}
          color="#ffffff"
        />
      </mesh>

      {/* HTML input - transparent, for cursor interaction (pmnd.rs pattern) */}
      <Html
        transform
        position={[-width / 2 + 0.15, 0, 0.01]}
        scale={0.001}
        distanceFactor={1}
      >
        <ControlledInput3D
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: `${width * 1000}px`,
            height: `${height * 1000}px`,
            background: 'transparent',
            border: 'none',
            color: 'transparent',
            caretColor: 'white',
            outline: 'none',
            fontSize: `${fontSize * 1000}px`,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: '500',
            padding: '0 10px',
            boxSizing: 'border-box',
          }}
        />
      </Html>
    </group>
  );
};

export default InputField3D;
