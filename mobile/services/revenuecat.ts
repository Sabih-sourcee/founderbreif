import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesOffering } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

export const RC_ANDROID_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_RC_ANDROID_KEY?.trim() || 'goog_qZzNIGNlYjRSlaVgkQtcPrZyaYC';

export const RC_IOS_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_RC_IOS_KEY?.trim() || 'goog_qZzNIGNlYjRSlaVgkQtcPrZyaYC';

export const RC_OFFERING_IDENTIFIER = 'FounderBreif Pro Plans';

export const RC_PRO_ENTITLEMENT_IDS = [
  'pro',
  'Pro Plan Full Year',
  'Pro Plan 1 Month',
];

let isConfigured = false;

function isExpoGoRuntime(): boolean {
  return Constants.appOwnership === 'expo';
}

export function hasActiveProEntitlement(customerInfo: CustomerInfo | null | undefined): boolean {
  if (!customerInfo?.entitlements?.active) return false;
  const active = customerInfo.entitlements.active;
  for (const key of RC_PRO_ENTITLEMENT_IDS) {
    if (active[key]?.isActive) return true;
  }
  return Object.keys(active).length > 0;
}

export async function initRevenueCat(
  onCustomerInfoUpdate?: (isPro: boolean, info: CustomerInfo) => void
): Promise<boolean> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return false;
  }

  if (isExpoGoRuntime()) {
    console.log('[RevenueCat] Running inside Expo Go — native store preview fallback active.');
    return false;
  }

  try {
    if (!isConfigured) {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      const apiKey = Platform.OS === 'ios' ? RC_IOS_PUBLIC_KEY : RC_ANDROID_PUBLIC_KEY;
      Purchases.configure({ apiKey });
      isConfigured = true;
    }

    if (onCustomerInfoUpdate) {
      Purchases.addCustomerInfoUpdateListener((info) => {
        onCustomerInfoUpdate(hasActiveProEntitlement(info), info);
      });
    }

    const customerInfo = await Purchases.getCustomerInfo();
    const isPro = hasActiveProEntitlement(customerInfo);
    if (onCustomerInfoUpdate) {
      onCustomerInfoUpdate(isPro, customerInfo);
    }
    return isPro;
  } catch (err) {
    console.warn('[RevenueCat] Could not initialize SDK (expected in Expo Go / simulator):', err);
    return false;
  }
}

export async function getActiveOffering(): Promise<PurchasesOffering | null> {
  if (!isConfigured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.all[RC_OFFERING_IDENTIFIER] ?? offerings.current ?? null;
  } catch (err) {
    console.warn('[RevenueCat] Failed to fetch offerings:', err);
    return null;
  }
}

export interface PaywallPresentationResult {
  purchased: boolean;
  restored: boolean;
  cancelled: boolean;
  nativePaywallShown: boolean;
  errorMessage?: string;
}

export async function presentRevenueCatPaywall(): Promise<PaywallPresentationResult> {
  if (!isConfigured || (Platform.OS !== 'android' && Platform.OS !== 'ios') || isExpoGoRuntime()) {
    return {
      purchased: false,
      restored: false,
      cancelled: false,
      nativePaywallShown: false,
      errorMessage: 'Native RevenueCat UI requires an Android/iOS build (EAS / prebuild).',
    };
  }

  try {
    const offering = await getActiveOffering();
    const result = await RevenueCatUI.presentPaywall(
      offering
        ? { offering, displayCloseButton: true }
        : { displayCloseButton: true }
    );

    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
        return { purchased: true, restored: false, cancelled: false, nativePaywallShown: true };
      case PAYWALL_RESULT.RESTORED:
        return { purchased: true, restored: true, cancelled: false, nativePaywallShown: true };
      case PAYWALL_RESULT.CANCELLED:
        return { purchased: false, restored: false, cancelled: true, nativePaywallShown: true };
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.NOT_PRESENTED:
      default:
        return {
          purchased: false,
          restored: false,
          cancelled: false,
          nativePaywallShown: false,
          errorMessage: 'Paywall could not be presented.',
        };
    }
  } catch (err: any) {
    console.warn('[RevenueCat] presentPaywall error:', err);
    return {
      purchased: false,
      restored: false,
      cancelled: false,
      nativePaywallShown: false,
      errorMessage: err?.message || 'Paywall presentation failed.',
    };
  }
}

export async function presentRevenueCatPaywallIfNeeded(): Promise<PaywallPresentationResult> {
  if (!isConfigured || (Platform.OS !== 'android' && Platform.OS !== 'ios') || isExpoGoRuntime()) {
    return {
      purchased: false,
      restored: false,
      cancelled: false,
      nativePaywallShown: false,
    };
  }

  try {
    const offering = await getActiveOffering();
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: 'Pro Plan 1 Month',
      offering: offering ?? undefined,
      displayCloseButton: true,
    });

    const unlocked =
      result === PAYWALL_RESULT.PURCHASED ||
      result === PAYWALL_RESULT.RESTORED ||
      result === PAYWALL_RESULT.NOT_PRESENTED;

    return {
      purchased: unlocked,
      restored: result === PAYWALL_RESULT.RESTORED,
      cancelled: result === PAYWALL_RESULT.CANCELLED,
      nativePaywallShown: true,
    };
  } catch (err: any) {
    return {
      purchased: false,
      restored: false,
      cancelled: false,
      nativePaywallShown: false,
      errorMessage: err?.message,
    };
  }
}

export async function restoreRevenueCatPurchases(): Promise<{
  isPro: boolean;
  nativeSupported: boolean;
  errorMessage?: string;
}> {
  if (!isConfigured || (Platform.OS !== 'android' && Platform.OS !== 'ios') || isExpoGoRuntime()) {
    return {
      isPro: false,
      nativeSupported: false,
      errorMessage: 'Restore purchases requires a native Android/iOS build.',
    };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    return {
      isPro: hasActiveProEntitlement(customerInfo),
      nativeSupported: true,
    };
  } catch (err: any) {
    return {
      isPro: false,
      nativeSupported: true,
      errorMessage: err?.message || 'Could not restore purchases.',
    };
  }
}

export function isRevenueCatNativeConfigured(): boolean {
  return isConfigured;
}
