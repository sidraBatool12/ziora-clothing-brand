"use client";

import { useEffect, useState } from "react";
import { getProviders } from "next-auth/react";

/**
 * Google is only registered server-side when its OAuth credentials exist, so
 * asking NextAuth what it actually serves keeps the UI from offering a button
 * that could only fail with OAuthSignin.
 */
export function useGoogleProvider(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    getProviders()
      .then((providers) => {
        if (active) setEnabled(Boolean(providers?.google));
      })
      .catch(() => {
        if (active) setEnabled(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return enabled;
}
