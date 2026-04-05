import { useRef } from 'react';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  visible?: boolean;
}

export function FileUpload({ 
  file, 
  onFileChange, 
  disabled = false,
  visible = true 
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (!visible) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  const handleClear = () => {
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="form-control w-full mt-4">
      <label className="label">
        <span className="label-text">Custom Payload File</span>
        <span className="label-text-alt">.bin files only</span>
      </label>
      
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".bin"
          className="file-input file-input-bordered file-input-primary w-full"
          onChange={handleChange}
          disabled={disabled}
        />
        {file && (
          <button
            type="button"
            className="btn btn-ghost btn-square"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Clear file"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      
      {file && (
        <label className="label">
          <span className="label-text-alt text-success">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </span>
        </label>
      )}
    </div>
  );
}
