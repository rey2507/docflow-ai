import { useCallback, useRef } from 'react';

type Options = {
  accept?: string;
  multiple?: boolean;
  onFiles?: (files: FileList | null) => void;
};

export default function useFilePicker({ accept, multiple = false, onFiles }: Options) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const open = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    onFiles?.(files);
    if (e.target) e.target.value = '';
  }, [onFiles]);

  const input = (
    <input
      ref={inputRef}
      type="file"
      multiple={multiple}
      accept={accept}
      onChange={onChange}
      className="hidden"
    />
  );

  return { input, open, inputRef };
}
