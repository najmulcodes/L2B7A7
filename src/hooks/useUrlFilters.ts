"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Keeps a set of string filter/sort/pagination values in sync with the URL
 * (?page=2&status=active&q=foo), so views are bookmarkable/shareable and
 * survive a refresh or back-navigation — per the "URL State Synchronization"
 * requirement. `defaults` doubles as the shape of the state: any key not
 * present in the URL falls back to its default, and setting a value back to
 * its default removes it from the URL instead of writing it explicitly.
 *
 * Usage:
 *   const [filters, setFilters] = useUrlFilters({ page: "1", status: "", q: "" });
 *   filters.status         // current value, from the URL or the default
 *   setFilters({ status: "PENDING" })   // updates the URL, resets page to "1"
 *   setFilters({ page: "2" })           // updates just the page
 */
export function useUrlFilters<T extends Record<string, string>>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const fromUrl = searchParams.get(key);
      if (fromUrl !== null) result[key as keyof T] = fromUrl as T[keyof T];
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const setValues = useCallback(
    (patch: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());
      const changingFilters = Object.keys(patch).some((k) => k !== "page");

      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "" || value === defaults[key]) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Changing any real filter resets pagination back to page 1.
      if (changingFilters && !("page" in patch)) {
        params.delete("page");
      }

      // replace (not push): filters/search/pagination are transient view
      // state, not distinct history entries — nobody wants to hit "back"
      // eight times to undo eight keystrokes in a search box.
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams, defaults],
  );

  return [values, setValues] as const;
}
