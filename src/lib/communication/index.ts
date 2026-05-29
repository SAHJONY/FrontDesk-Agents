// Communication Department - Main Export
// Voice + SMS Integration for FRONTDESK AGENTS

export { twilioService } from './twilioService';
export { blandService } from './blandService';
export { phoneOnboardingService, PhoneOnboardingService } from './phone-provisioning';
export * from './types';

// Re-export phone provisioning types
export type {
  PhoneOnboardingConfig,
  ProvisionedPhoneResource,
  OnboardingResult
} from './phone-provisioning';