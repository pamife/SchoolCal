import {
  generateLicenseCode,
  normalizeLicenseCode,
  hashLicenseCode,
  createMaskedPrefix,
} from '../src/services/licensing/licenseCrypto';
import {
  isPlanEligible,
  getRequiredPlanForFeature,
  FEATURE_GATES,
} from '../src/config/features';

async function runTests() {
  console.log('--- Running Licensing Logic Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  // 1. Code Generation
  const plusCode = generateLicenseCode('PLUS');
  assert(plusCode.startsWith('SCAL-PLUS-'), 'Plus code starts with SCAL-PLUS-');
  assert(plusCode.length === 24, `Code length is 24 (${plusCode})`);

  const proCode = generateLicenseCode('PRO');
  assert(proCode.startsWith('SCAL-PRO-'), 'Pro code starts with SCAL-PRO-');

  // 2. Normalization
  const rawInput = ' scal-plus-7x4k-92pm-q8fd ';
  const normalized = normalizeLicenseCode(rawInput);
  assert(normalized === 'SCAL-PLUS-7X4K-92PM-Q8FD', 'Code normalized properly');

  // 3. Masking
  const masked = createMaskedPrefix('SCAL-PLUS-7X4K-92PM-Q8FD');
  assert(masked === 'SCAL-PLUS-****-Q8FD', `Masked prefix correct (${masked})`);

  // 4. SHA-256 Hashing
  const hash1 = await hashLicenseCode('SCAL-PLUS-7X4K-92PM-Q8FD');
  const hash2 = await hashLicenseCode('scal-plus-7x4k-92pm-q8fd');
  assert(hash1 === hash2, 'Hashing is deterministic and case-insensitive');
  assert(hash1.length > 0, 'Hash output is non-empty');

  // 5. Plan Hierarchy & Eligibility
  assert(isPlanEligible('STANDARD', 'STANDARD') === true, 'Standard has Standard');
  assert(isPlanEligible('STANDARD', 'PLUS') === false, 'Standard does not have Plus');
  assert(isPlanEligible('STANDARD', 'PRO') === false, 'Standard does not have Pro');

  assert(isPlanEligible('PLUS', 'STANDARD') === true, 'Plus has Standard');
  assert(isPlanEligible('PLUS', 'PLUS') === true, 'Plus has Plus');
  assert(isPlanEligible('PLUS', 'PRO') === false, 'Plus does not have Pro');

  assert(isPlanEligible('PRO', 'STANDARD') === true, 'Pro has Standard');
  assert(isPlanEligible('PRO', 'PLUS') === true, 'Pro has Plus');
  assert(isPlanEligible('PRO', 'PRO') === true, 'Pro has Pro');

  // 6. Feature Gates
  assert(getRequiredPlanForFeature('calendar') === 'STANDARD', 'Calendar requires Standard');
  assert(getRequiredPlanForFeature('webuntisSync') === 'PLUS', 'WebUntis requires Plus');
  assert(getRequiredPlanForFeature('gradeAnalytics') === 'PRO', 'Grade analytics requires Pro');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
