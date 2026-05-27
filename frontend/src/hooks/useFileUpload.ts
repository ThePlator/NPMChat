import { useState, useRef, useCallback } from "react";
import { validateFile } from "../lib/fileValidation";
import { useMessageContext } from "../app/MessageContext";

interface UploadState {
  progress: number;         // 0-100
  status: "idle" | "validating" | "uploading" | "success" | "error" | "cancelled";
  error: string | null;
  fileName: string | null;
}

export function useFileUpload() {
  const [state, setState] = useState<UploadState>({
    progress: 0,
    status: "idle",
    error: null,
    fileName: null,
  });

  const { sendMessage } = useMessageContext();
  const readerRef = useRef<FileReader | null>(null);

  const upload = useCallback(async (file: File, roomId: string) => {
    // Step 1: Validate
    setState({ progress: 0, status: "validating", error: null, fileName: file.name });

    const validation = validateFile(file);
    if (!validation.valid) {
      setState((s) => ({ ...s, status: "error", error: validation.error }));
      return;
    }

    // Step 2: Read file and track progress, then send via existing API
    setState((s) => ({ ...s, status: "uploading" }));

    const reader = new FileReader();
    readerRef.current = reader;

    return new Promise<void>((resolve, reject) => {
      // ✅ Track progress for reading large files
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setState((s) => ({ ...s, progress: pct }));
        }
      };

      reader.onload = async () => {
        try {
          if (readerRef.current === null) {
            reject();
            return; // cancelled
          }
          const base64 = reader.result as string;
          
          // Force progress to 100 once read
          setState((s) => ({ ...s, progress: 100 }));
          
          // Send via existing sendMessage API which expects base64
          await sendMessage(roomId, "", base64);
          
          setState((s) => ({ ...s, status: "success", progress: 100 }));
          resolve();
        } catch (err: any) {
          if (err?.message?.includes("413") || err?.status === 413) {
            setState((s) => ({
              ...s, status: "error",
              error: "File too large. Server rejected the upload.",
            }));
          } else {
            setState((s) => ({
              ...s, status: "error",
              error: err?.message || "Upload failed. Please try again.",
            }));
          }
          reject();
        }
      };

      reader.onerror = () => {
        setState((s) => ({ ...s, status: "error", error: "File reading error." }));
        reject();
      };

      reader.readAsDataURL(file);
    });
  }, [sendMessage]);

  // ✅ Cancel in-flight upload
  const cancel = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.abort();
      readerRef.current = null;
      setState({ progress: 0, status: "cancelled", error: null, fileName: null });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ progress: 0, status: "idle", error: null, fileName: null });
  }, []);

  return { ...state, upload, cancel, reset };
}
