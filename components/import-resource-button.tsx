"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { resourcesApi } from "@/lib/api";

export function ImportResourceButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsImporting(true);
    setError(null);

    try {
      const result = await resourcesApi.import(file);
      router.push(`/resources/${result.resourceId}`);
      router.refresh();
    } catch (err) {
      if (err && typeof err === "object" && "error" in err) {
        setError((err as { error: string }).error);
      } else {
        setError("Failed to import resource");
      }
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={isImporting}
        className="border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
      >
        {isImporting ? "Importing..." : "Import Resource"}
      </button>
      {error && (
        <p className="max-w-xs text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
