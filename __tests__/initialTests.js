require('dotenv').config();

test('Test database set for jest', () => {
  expect(process.env.database).toBe('wesellhouses_test');
})