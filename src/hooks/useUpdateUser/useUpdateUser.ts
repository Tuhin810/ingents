/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";

export function useUserUpdate() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | undefined>();

  const updateUserDetails = async (payload: any) => {
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        const message = json.message || json.error || "Update failed";
        throw new Error(message);
      }

      setData(json);
      return json; // ✅ return API response
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw new Error(message); // ✅ re-throw so handleConfirm can catch
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, updateUserDetails };
}
