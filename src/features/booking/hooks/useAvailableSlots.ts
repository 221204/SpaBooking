"use client";

import { useCallback, useEffect, useState } from "react";

import type { TimeSlot } from "@/features/booking/types";

type UseAvailableSlotsParams = {
  shopSlug: string;
  serviceId: string | null;
  date: string | null;
  staffId?: string | null;
  enabled?: boolean;
};

type SlotsResponse = {
  slots: TimeSlot[];
  error?: string;
};

export function useAvailableSlots({
  shopSlug,
  serviceId,
  date,
  staffId,
  enabled = true,
}: UseAvailableSlotsParams) {
  const [fetchedSlots, setFetchedSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = Boolean(enabled && shopSlug && serviceId && date);

  useEffect(() => {
    if (!canFetch) {
      return;
    }

    const controller = new AbortController();

    async function loadSlots() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          shopSlug,
          serviceId: serviceId!,
          date: date!,
        });

        if (staffId) {
          params.set("staffId", staffId);
        }

        const response = await fetch(`/api/slots?${params.toString()}`, {
          signal: controller.signal,
        });

        const body = (await response.json()) as SlotsResponse;

        if (!response.ok) {
          throw new Error(body.error ?? "Không thể tải khung giờ trống.");
        }

        setFetchedSlots(body.slots);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setFetchedSlots([]);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Không thể tải khung giờ trống.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadSlots();

    return () => {
      controller.abort();
    };
  }, [canFetch, shopSlug, serviceId, date, staffId]);

  const visibleSlots = canFetch ? fetchedSlots : [];

  const refetch = useCallback(() => {
    if (!canFetch) return;
    setFetchedSlots([]);
    setError(null);
    setIsLoading(true);

    const params = new URLSearchParams({
      shopSlug,
      serviceId: serviceId!,
      date: date!,
    });

    if (staffId) {
      params.set("staffId", staffId);
    }

    void fetch(`/api/slots?${params.toString()}`)
      .then(async (response) => {
        const body = (await response.json()) as SlotsResponse;
        if (!response.ok) {
          throw new Error(body.error ?? "Không thể tải khung giờ trống.");
        }
        setFetchedSlots(body.slots);
      })
      .catch((fetchError) => {
        setFetchedSlots([]);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Không thể tải khung giờ trống.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [canFetch, shopSlug, serviceId, date, staffId]);

  return {
    slots: visibleSlots,
    isLoading: canFetch && isLoading,
    error: canFetch ? error : null,
    refetch,
  };
}
