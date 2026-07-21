import { requireUser } from "@/lib/auth";
import { AddressManager } from "@/components/address-manager";

export default async function AddressesPage() {
  const user = await requireUser();
  return <AddressManager initialAddresses={user.addresses || []} />;
}
