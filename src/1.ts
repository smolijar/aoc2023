import * as S from 'fp-ts/string';
import { flow, pipe, flip } from 'fp-ts/function';
import * as RA from 'fp-ts/lib/ReadonlyArray.js';
import * as O from 'fp-ts/Option';
import { readFileSync } from 'node:fs';
import * as RR from 'fp-ts/lib/ReadonlyRecord.js';
import { sort } from 'fp-ts/lib/ReadonlyNonEmptyArray.js';
import * as N from 'fp-ts/number';
import { contramap } from 'fp-ts/Ord';

const DIGITS = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
};

const tryParseNumber = (s: string) =>
  String(Number(s)) === s ? O.some(Number(s)) : O.none;

const join = (s: string) => (xs: readonly string[]) => xs.join(s);

const basicCalibration: CalibrationFn = flow(
  (s: string) => s.replace(/[^0-9]/g, ''),
  S.split(''),
  xs => [RA.head(xs), RA.last(xs)],
  RA.compact,
  join(''),
  tryParseNumber
);

type CalibrationFn = (s: string) => O.Option<number>;

const reverseSring = flow(S.split(''), RA.reverse, join(''));

const advancedCalibartion = (s: string) => {
  if (!s) return O.none;
  const [first] = s.match(
    new RegExp(pipe(RR.keys(DIGITS), RA.append('[0-9]'), join('|')))
  );
  const [last] = pipe(
    reverseSring(s).match(
      new RegExp(
        pipe(
          RR.keys(DIGITS),
          RA.map(reverseSring),
          RA.append('[0-9]'),
          join('|')
        )
      )
    )
  );
  return pipe(
    [first, reverseSring(last)],
    RA.map(s => DIGITS[s as keyof typeof DIGITS] ?? s),
    join(''),
    tryParseNumber
  );
};
const basicCalibartion = basicCalibration;

const day1 = (calibartionFn: CalibrationFn) =>
  flow(
    S.split('\n'),
    RA.map(calibartionFn),
    RA.compact,
    RA.reduce(0, (a, b) => a + b)
  );

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const DEMO = readFileSync(
    new URL('../inputs/1/demo.txt', import.meta.url),
    'utf-8'
  );
  const DEMO2 = readFileSync(
    new URL('../inputs/1/demo2.txt', import.meta.url),
    'utf-8'
  );
  const USER_INPUT = readFileSync(
    new URL('../inputs/1/user.txt', import.meta.url),
    'utf-8'
  );
  it('getCalibration', () => {
    expect(basicCalibartion('1abc2')).toStrictEqual(O.some(12));
    expect(basicCalibartion('treb7uchet')).toStrictEqual(O.some(77));
    expect(basicCalibartion('trebuchet')).toStrictEqual(O.none);

    expect(advancedCalibartion('two1nine')).toStrictEqual(O.some(29));
    expect(advancedCalibartion('eightwothree')).toStrictEqual(O.some(83));
    expect(advancedCalibartion('abcone2threexyz')).toStrictEqual(O.some(13));
    expect(advancedCalibartion('xtwone3four')).toStrictEqual(O.some(24));
    expect(advancedCalibartion('4nineeightseven2')).toStrictEqual(O.some(42));
    expect(advancedCalibartion('zoneight234')).toStrictEqual(O.some(14));
    expect(advancedCalibartion('7pqrstsixteen')).toStrictEqual(O.some(76));

    expect(advancedCalibartion('zoneight234')).toStrictEqual(O.some(14));

    expect(advancedCalibartion('587cdbcb2mspbgbl')).toStrictEqual(O.some(52));
    expect(advancedCalibartion('twojkblghsctseven8eight')).toStrictEqual(
      O.some(28)
    );
    expect(advancedCalibartion('2xmdmtgcjhd8eighttwo')).toStrictEqual(
      O.some(22)
    );
    expect(advancedCalibartion('nine6qpfzxhsdsfour9')).toStrictEqual(
      O.some(99)
    );
    expect(advancedCalibartion('9rvqhjvmh7kcvnineccn9rzpzs')).toStrictEqual(
      O.some(99)
    );
    expect(advancedCalibartion('tbsxkhhv6twozrtczg6seven')).toStrictEqual(
      O.some(67)
    );
    expect(
      advancedCalibartion('ccpeightbcvknglvcv81gcjnlnfnine9')
    ).toStrictEqual(O.some(89));
    expect(advancedCalibartion('1twone')).toStrictEqual(O.some(11));
  });
  it('day1', () => {
    expect(day1(basicCalibartion)(DEMO)).toStrictEqual(142);
    expect(day1(basicCalibartion)(USER_INPUT)).toStrictEqual(56506);
    expect(day1(advancedCalibartion)(DEMO2)).toStrictEqual(281);
    expect(day1(advancedCalibartion)(USER_INPUT)).gt(56001);
    expect(day1(advancedCalibartion)(USER_INPUT)).eq(56017);
  });
}
