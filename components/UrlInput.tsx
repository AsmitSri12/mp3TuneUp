'use client';

import { useState, useRef, useCallback } from 'react';
import { Search, X, AlertCircle, Music2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isValidYouTubeUrl } from '@/lib/validators';
import { cn } from '@/lib/utils';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function UrlInput({ onSubmit, isLoading, disabled }: UrlInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((url: string): string => {
    if (!url.trim()) return 'Please enter a YouTube URL.';
    if (!isValidYouTubeUrl(url.trim())) {
      return 'Invalid URL. Use youtube.com/watch?v=... or youtu.be/... format.';
    }
    return '';
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (touched) {
      setError(validate(e.target.value));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    setTimeout(() => {
      if (isValidYouTubeUrl(pasted.trim())) {
        setError('');
        setTouched(true);
      }
    }, 10);
  };

  const handleClear = () => {
    setValue('');
    setError('');
    setTouched(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const validationError = validate(value);
    if (validationError) {
      setError(validationError);
      inputRef.current?.focus();
      return;
    }
    setError('');
    onSubmit(value.trim());
  };

  const hasError = touched && !!error;
  const isValid = touched && !error && value.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3" noValidate>
      <div className="relative flex items-center gap-2">
        {/* Icon */}
        <div className="absolute left-4 flex items-center pointer-events-none z-10">
          <Music2
            className={cn(
              'h-5 w-5 transition-colors duration-200',
              hasError ? 'text-red-400' : isValid ? 'text-violet-400' : 'text-white/30'
            )}
          />
        </div>

        {/* Input field */}
        <Input
          ref={inputRef}
          id="youtube-url-input"
          type="url"
          placeholder="Paste YouTube URL here… (e.g. youtube.com/watch?v=...)"
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onBlur={() => { if (value) setTouched(true); }}
          disabled={isLoading || disabled}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            'pl-12 pr-12 h-14 text-base',
            hasError && 'border-red-500/50 focus-visible:ring-red-500',
            isValid && 'border-emerald-500/30 focus-visible:ring-emerald-500'
          )}
          aria-label="YouTube URL"
          aria-describedby={hasError ? 'url-error' : undefined}
          aria-invalid={hasError}
        />

        {/* Clear button */}
        {value && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 text-white/30 hover:text-white/70 transition-colors z-10"
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <div
          id="url-error"
          role="alert"
          className="flex items-center gap-2 text-sm text-red-400 animate-in slide-in-from-top-1 duration-200"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit button */}
      <Button
        id="fetch-video-btn"
        type="submit"
        size="xl"
        className="w-full"
        disabled={isLoading || disabled}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Fetching video info…
          </>
        ) : (
          <>
            <Search className="h-5 w-5" />
            Fetch Video Info
          </>
        )}
      </Button>
    </form>
  );
}
