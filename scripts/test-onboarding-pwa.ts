import { getDevicePlatformInfo, isRunningStandalone } from '../src/services/pwa/pwaService';
import { DEFAULT_USER_SETTINGS } from '../src/data/mockData';

console.log('====================================================');
console.log('🚀 Running SchoolCal Onboarding & PWA Assistent Tests');
console.log('====================================================');

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  }
}

// 1. PWA & Device Detection Tests
console.log('\n--- 1. PWA & Device Detection Tests ---');
const isStandalone = isRunningStandalone();
assert(typeof isStandalone === 'boolean', 'isRunningStandalone returns a boolean');

const info = getDevicePlatformInfo();
assert(typeof info === 'object', 'getDevicePlatformInfo returns an object');
assert(typeof info.isStandalone === 'boolean', 'info.isStandalone is boolean');
assert(typeof info.osName === 'string' && info.osName.length > 0, `osName detected: ${info.osName}`);
assert(typeof info.browserName === 'string' && info.browserName.length > 0, `browserName detected: ${info.browserName}`);
assert(['iphone', 'ipad', 'android_phone', 'android_tablet', 'windows', 'mac', 'linux', 'other'].includes(info.deviceType), `valid deviceType: ${info.deviceType}`);

// 2. Default User Settings & Onboarding Flags
console.log('\n--- 2. Onboarding Status in Default Settings ---');
assert(DEFAULT_USER_SETTINGS.onboardingCompleted === false, 'Default onboardingCompleted is false');
assert(DEFAULT_USER_SETTINGS.onboardingVersion === 1, 'Default onboardingVersion is 1');
assert(DEFAULT_USER_SETTINGS.defaultCalendarView === 'week', 'Default calendar view is week');
assert(DEFAULT_USER_SETTINGS.theme === 'system', 'Default theme is system');

console.log(`\n====================================================`);
console.log(`Test Results: ${passed} passed, ${failed} failed.`);
console.log(`====================================================`);

if (failed > 0) {
  process.exit(1);
}
