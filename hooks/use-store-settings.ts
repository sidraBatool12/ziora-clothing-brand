"use client";

import { useEffect, useState } from "react";

export interface PublicStoreSettings {
  shippingFee: number;
  freeShippingThreshold: number;
  currency: string;
  codEnabled: boolean;
  easypaisaEnabled: boolean;
  easypaisaAccountName: string;
  easypaisaAccountNumber: string;
  jazzcashEnabled: boolean;
  jazzcashAccountName: string;
  jazzcashAccountNumber: string;
  bankTransferEnabled: boolean;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIban: string;
  paymentInstructions: string;
}

const defaults: PublicStoreSettings = {
  shippingFee: 250,
  freeShippingThreshold: 10000,
  currency: "PKR",
  codEnabled: true,
  easypaisaEnabled: false,
  easypaisaAccountName: "",
  easypaisaAccountNumber: "",
  jazzcashEnabled: false,
  jazzcashAccountName: "",
  jazzcashAccountNumber: "",
  bankTransferEnabled: false,
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankIban: "",
  paymentInstructions: "",
};

export function useStoreSettings() {
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    let active = true;
    fetch("/api/store-settings")
      .then((response) => response.json())
      .then((data) => {
        if (active && data.settings) setSettings({ ...defaults, ...data.settings });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return settings;
}
