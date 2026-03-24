'use client';

import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';

export function useFormInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(event.target.value);
    setIsDirty(true);
    if (error && event.target.checkValidity()) {
      setError(null);
    }
  };

  const handleInvalid = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.preventDefault();
    setError((event.target as HTMLInputElement).validationMessage);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isDirty) {
      event.target.checkValidity();
    }
  };

  return {
    value,
    error,
    onChange: handleChange,
    onBlur: handleBlur,
    onInvalid: handleInvalid,
  };
}
