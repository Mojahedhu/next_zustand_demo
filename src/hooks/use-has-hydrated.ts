import { useEffect, useState } from "react";
import { useAppStoreApi } from "@/store/store-provider";

export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  const store = useAppStoreApi();

  useEffect(() => {
    // Manually trigger rehydration on the new combined store after mount
    store.persist.rehydrate();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return hasHydrated;
}
