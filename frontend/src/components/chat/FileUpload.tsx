import { useRef } from "react";
import "../../styles/fileUpload.css";
import { useFileUpload } from "../../hooks/useFileUpload";
import { Paperclip, X, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  roomId: string;
}

export function FileUpload({ roomId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { progress, status, error, fileName, upload, cancel, reset } = useFileUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload(file, roomId);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="file-upload-wrapper flex items-center">
      {/* Hidden native input */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        aria-label="Attach file"
      />

      {/* Upload trigger button */}
      {status === "idle" || status === "success" || status === "cancelled" ? (
        <button
          type="button"
          onClick={() => { reset(); inputRef.current?.click(); }}
          className="px-2 py-2 cursor-pointer border-2 border-sidebar-border rounded-full bg-accent hover:bg-[#b39ddb] flex items-center justify-center transition-colors"
          title="Attach file (max 10MB)"
        >
          <Paperclip className="w-5 h-5" />
        </button>
      ) : null}

      {/* Progress bar — shown during upload */}
      {status === "uploading" || status === "validating" ? (
        <div className="upload-progress-container absolute bottom-16 left-4 z-50 bg-card border-2 border-sidebar-border shadow-lg">
          <span className="upload-filename truncate">{fileName}</span>

          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <span className="upload-pct">{progress}%</span>

          {/* Cancel button */}
          <button
            type="button"
            onClick={cancel}
            className="cancel-btn hover:text-red-500"
            title="Cancel upload"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      {/* Error message */}
      {status === "error" && error && (
        <div className="upload-error absolute bottom-16 left-4 z-50 shadow-lg" role="alert">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={reset} className="text-xs font-bold underline ml-2 whitespace-nowrap">
            Dismiss
          </button>
        </div>
      )}

      {/* Success */}
      {status === "success" && (
        <div className="upload-success absolute bottom-16 left-4 z-50 bg-white border border-green-200 px-3 py-1.5 rounded-lg shadow-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="font-medium text-green-700">File sent!</span>
        </div>
      )}
    </div>
  );
}
