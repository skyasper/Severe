import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dateInputToUnixEnd,
  dateInputToUnixStart,
  formatDateUtc,
  formatTokenAmount,
  isValidAddress,
  isValidProofId,
  normalizeProofRecord,
  parseProofIdArg,
  parseTokenAmount,
  resolveAbiFunction,
  shortenAddress,
  validateIssueProofForm,
} from './proofUtils';

const SAMPLE_ISSUER = '0x1111111111111111111111111111111111111111';
const SAMPLE_RECIPIENT = '0x2222222222222222222222222222222222222222';
const USDC_ADDR = '0x3600000000000000000000000000000000000000';

test('token decimal formatting and parsing handles 6-decimal USDC and 18-decimal tokens', () => {
  assert.equal(formatTokenAmount(1250_500000n, 6, 'USDC'), '1,250.5 USDC');
  assert.equal(formatTokenAmount(1000000n, 6, 'EURC'), '1 EURC');
  assert.equal(formatTokenAmount(2500000000000000000n, 18, 'TOKEN'), '2.5 TOKEN');

  assert.equal(parseTokenAmount('1250.50', 6), 1250_500000n);
  assert.equal(parseTokenAmount('1,000', 6), 1000_000000n);
  assert.equal(parseTokenAmount('0', 6), null);
  assert.equal(parseTokenAmount('1.1234567', 6), null);
  assert.equal(parseTokenAmount('-10', 6), null);
});

test('address and proof ID validation enforces strict formats', () => {
  assert.equal(isValidAddress(USDC_ADDR), true);
  assert.equal(isValidAddress('0x123'), false);

  assert.equal(isValidProofId('1'), true);
  assert.equal(isValidProofId('42'), true);
  assert.equal(
    isValidProofId('0x' + 'a'.repeat(64)),
    true
  );
  assert.equal(isValidProofId('abc'), false);
  assert.equal(isValidProofId(''), false);

  assert.equal(parseProofIdArg('19'), 19n);
  assert.equal(parseProofIdArg('invalid'), null);
});

test('validateIssueProofForm catches missing or invalid fields without bypassing', () => {
  const invalidErrors = validateIssueProofForm(
    {
      recipient: 'not-an-address',
      tokenAddress: USDC_ADDR,
      amount: '0',
      periodStart: '2026-03-10',
      periodEnd: '2026-03-01',
      note: '',
      attested: false,
    },
    6
  );

  assert.ok(invalidErrors.recipient);
  assert.ok(invalidErrors.amount);
  assert.ok(invalidErrors.periodEnd);
  assert.ok(invalidErrors.attested);

  const validErrors = validateIssueProofForm(
    {
      recipient: SAMPLE_RECIPIENT,
      tokenAddress: USDC_ADDR,
      amount: '4500.25',
      periodStart: '2026-02-01',
      periodEnd: '2026-02-28',
      note: 'Q1 retainer settlement',
      attested: true,
    },
    6
  );

  assert.deepEqual(validErrors, {});
});

test('normalizeProofRecord handles named objects, verifyProof tuples, and positional arrays', () => {
  const named = normalizeProofRecord({
    id: 7n,
    issuer: SAMPLE_ISSUER,
    recipient: SAMPLE_RECIPIENT,
    token: USDC_ADDR,
    totalAmount: 5000_000000n,
    periodStart: 1735689600n,
    periodEnd: 1738367999n,
    issuedAt: 1738400000n,
    note: 'January payroll',
    revoked: false,
  });

  assert.ok(named);
  assert.equal(named.id, '7');
  assert.equal(named.totalAmount, 5000_000000n);
  assert.equal(named.revoked, false);

  const verifyTuple = normalizeProofRecord([
    false,
    [
      9n,
      SAMPLE_ISSUER,
      SAMPLE_RECIPIENT,
      USDC_ADDR,
      100_000000n,
      1735689600n,
      1738367999n,
      1738400000n,
      'Revoked entry',
      false,
    ],
  ]);

  assert.ok(verifyTuple);
  assert.equal(verifyTuple.id, '9');
  assert.equal(verifyTuple.revoked, true);

  // Zero recipient means uninitialized / nonexistent record
  const emptyRecord = normalizeProofRecord({
    id: 0n,
    issuer: '0x0000000000000000000000000000000000000000',
    recipient: '0x0000000000000000000000000000000000000000',
    token: '0x0000000000000000000000000000000000000000',
    totalAmount: 0n,
    periodStart: 0n,
    periodEnd: 0n,
    issuedAt: 0n,
    note: '',
    revoked: false,
  });
  assert.equal(emptyRecord, null);
});

test('date helpers and ABI resolver work deterministically', () => {
  const start = dateInputToUnixStart('2026-01-01');
  const end = dateInputToUnixEnd('2026-01-31');
  assert.ok(end > start);
  assert.equal(formatDateUtc(start), 'Jan 01, 2026');
  assert.equal(shortenAddress(USDC_ADDR), '0x3600...0000');

  const fn = resolveAbiFunction(
    [{ type: 'function', name: 'getPlatformStats' }],
    ['getStats', 'getPlatformStats']
  );
  assert.equal(fn?.name, 'getPlatformStats');
});
