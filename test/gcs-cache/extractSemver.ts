import test from 'ava';
import {
  extractSemver,
} from '../../src/extractSemver';

test('extracts semver', (t) => {
  t.is(extractSemver('v1.0.0'), '1.0.0');
});

test('produces NULL if semver cannot be identified', (t) => {
  t.is(extractSemver('foo'), null);
});
