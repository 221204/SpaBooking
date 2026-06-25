"use client";

import { useCallback, useState } from "react";

import type { PublicBookingFormData } from "@/features/booking/types";

type CreateBookingResponse = {
  id?: string;
  error?: string;
};

export function useCreateBooking() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (payload: PublicBookingFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json()) as CreateBookingResponse;

      if (!response.ok) {
        throw new Error(body.error ?? "Không thể đặt lịch.");
      }

      return { success: true as const, id: body.id };
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Không thể đặt lịch.";
      setError(message);
      return { success: false as const, error: message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createBooking, isSubmitting, error };
}
