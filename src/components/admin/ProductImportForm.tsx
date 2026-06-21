"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

type Row = Record<string, string>;

interface ImportResult {
  created: number;
  failed: { row: number; error: string }[];
}

export function ProductImportForm() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleFile(file: File) {
    setParseError("");
    setResult(null);
    setFileName(file.name);
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (res.errors.length > 0) {
          setParseError(res.errors[0].message);
          setRows([]);
          return;
        }
        setRows(res.data);
      },
      error: (err) => setParseError(err.message),
    });
  }

  async function handleImport() {
    setImporting(true);
    setResult(null);
    const res = await fetch("/api/admin/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    setImporting(false);
    if (!res.ok) {
      setParseError("Import failed — check the file and try again.");
      return;
    }
    const data: ImportResult = await res.json();
    setResult(data);
    if (data.created > 0) router.refresh();
  }

  const previewRows = rows.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-5">
        <label className="mb-1 block text-sm font-medium text-gray-700">CSV file</label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="block w-full text-sm"
        />
        {parseError ? <p className="mt-2 text-sm text-red-600">{parseError}</p> : null}
      </div>

      {rows.length > 0 ? (
        <div className="rounded-xl border bg-white p-5">
          <p className="mb-3 text-sm text-gray-600">
            Parsed <strong>{rows.length}</strong> product{rows.length === 1 ? "" : "s"} from {fileName}.
            Showing a preview of the first {previewRows.length}:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-xs">
              <thead className="bg-gray-50 text-left uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Title (EN)</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{row.slug}</td>
                    <td className="px-3 py-2">{row.titleEn}</td>
                    <td className="px-3 py-2">{row.price}</td>
                    <td className="px-3 py-2">{row.categoryName || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleImport}
            disabled={importing}
            className="mt-4 rounded-lg bg-black px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {importing ? "Importing..." : `Import ${rows.length} product${rows.length === 1 ? "" : "s"}`}
          </button>
        </div>
      ) : null}

      {result ? (
        <div className="rounded-xl border bg-white p-5">
          <p className="font-medium text-green-700">{result.created} product(s) created.</p>
          {result.failed.length > 0 ? (
            <div className="mt-3">
              <p className="mb-1 text-sm font-medium text-red-600">{result.failed.length} row(s) failed:</p>
              <ul className="space-y-1 text-sm text-gray-600">
                {result.failed.map((f) => (
                  <li key={f.row}>
                    Row {f.row}: {f.error}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
