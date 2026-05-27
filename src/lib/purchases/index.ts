/**
 * RevenueCat purchases integration — Phase 7
 *
 * Phase 7 replaces these stubs with real react-native-purchases calls once:
 *   1. App Store / Google Play IAP products are created (tasks 7.1–7.2)
 *   2. RevenueCat dashboard is configured (task 7.2)
 *   3. react-native-purchases is installed via EAS (task 7.3)
 *
 * The purchases Zustand store (src/stores/purchases.ts) is the source of
 * truth for entitlement state in the UI — this module drives syncs into it.
 */

/** Initialize the RevenueCat SDK. Call once from app/_layout.tsx on startup. */
export async function initPurchases(): Promise<void> {
  // Phase 7:
  //   const { API_KEY } = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;
  //   await Purchases.configure({ apiKey: API_KEY });
  //   Purchases.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);
}

/** Sync the latest entitlements from RevenueCat into the purchases store. */
export async function syncEntitlements(): Promise<void> {
  // Phase 7:
  //   const info = await Purchases.getCustomerInfo();
  //   const fullUnlock = !!info.entitlements.active['fullUnlock'];
  //   usePurchasesStore.getState().setEntitlements({ fullUnlock });
}

/** Trigger a purchase flow for the full-unlock product. */
export async function purchaseFullUnlock(): Promise<'success' | 'cancelled' | 'error'> {
  // Phase 7:
  //   try {
  //     const offerings = await Purchases.getOfferings();
  //     const pkg = offerings.current?.availablePackages[0];
  //     if (!pkg) return 'error';
  //     await Purchases.purchasePackage(pkg);
  //     await syncEntitlements();
  //     return 'success';
  //   } catch (e) {
  //     if ((e as PurchasesError).userCancelled) return 'cancelled';
  //     return 'error';
  //   }
  return 'error';
}

/** Restore previous purchases (required by App Store Review guidelines). */
export async function restorePurchases(): Promise<boolean> {
  // Phase 7:
  //   const info = await Purchases.restorePurchases();
  //   const fullUnlock = !!info.entitlements.active['fullUnlock'];
  //   usePurchasesStore.getState().setEntitlements({ fullUnlock });
  //   return fullUnlock;
  return false;
}
