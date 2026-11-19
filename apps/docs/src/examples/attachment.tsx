import { useEffect, useState } from "react";
import { AttachmentList, type AttachmentData } from "kestro-ui";

const initial: AttachmentData[] = [
  { id: "1", name: "Q3-expense-report.pdf", type: "application/pdf", size: 482_133 },
  { id: "2", name: "transactions-october.csv", size: 18_420 },
  { id: "3", name: "receipt-photo.jpg", type: "image/jpeg", size: 2_310_000 },
  { id: "4", name: "invoice-2291.pdf", size: 96_000, progress: 0 },
  { id: "5", name: "bank-statement.zip", size: 64_000_000, error: "File too large (max 25 MB)" },
];

export default function Example() {
  const [files, setFiles] = useState(initial);

  useEffect(() => {
    const t = window.setInterval(() => {
      setFiles((fs) =>
        fs.map((f) => (f.progress !== undefined && f.progress < 100 ? { ...f, progress: Math.min(100, f.progress + 7) } : f)),
      );
    }, 250);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="w-full max-w-xl space-y-3">
      <AttachmentList attachments={files} onRemove={(id) => setFiles((fs) => fs.filter((f) => f.id !== id))} />
      {files.length < initial.length ? (
        <button type="button" onClick={() => setFiles(initial)} className="text-xs font-medium text-kui-accent hover:underline">
          Reset files
        </button>
      ) : null}
    </div>
  );
}
