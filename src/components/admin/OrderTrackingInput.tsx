"use client";

import { useState } from "react";

export function OrderTrackingInput({ orderId, initialValue }: { orderId: string; initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierTrackingNumber: value.trim() || null }),
    });
    setSaving(false);
    if (res.ok) setSaved(value);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="AliExpress tracking #"
        className="w-36 rounded border px-2 py-1 text-xs"
      />
      <button
        onClick={handleSave}
        disabled={saving || value === saved}
        className="text-xs font-medium text-brand hover:underline disabled:text-gray-300"
      >
        {saving ? "..." : "Save"}
      </button>
    </div>
  );
}
