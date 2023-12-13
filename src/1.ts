import * as S from "fp-ts/string";
import { flip, flow, pipe } from "fp-ts/function";
import * as RA from "fp-ts/lib/ReadonlyArray.js";
import * as O from "fp-ts/Option";
import { readFileSync } from "node:fs";
import * as RR from "fp-ts/lib/ReadonlyRecord.js";
import { add, join, match, parseNumber, reverseString } from "./helpers.js";

const DIGITS = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

const basicCalibration: CalibrationFn = flow(
  (s: string) => s.replace(/[^0-9]/g, ""),
  S.split(""),
  (xs) => [RA.head(xs), RA.last(xs)],
  RA.compact,
  join(""),
  parseNumber
);

type CalibrationFn = (s: string) => O.Option<number>;

const advancedCalibration = (s: string) => {
  const getFirstMatch = flow(
    match(new RegExp(pipe(RR.keys(DIGITS), RA.append("[0-9]"), join("|")))),
    RA.head
  );
  const getLastMatch = flow(
    reverseString,
    match(
      new RegExp(
        pipe(
          RR.keys(DIGITS),
          RA.map(reverseString),
          RA.append("[0-9]"),
          join("|")
        )
      )
    ),
    RA.head,
    O.map(reverseString)
  );
  return pipe(
    [getFirstMatch, getLastMatch],
    RA.map((fn) => fn(s)),
    RA.compact,
    RA.map((s) => DIGITS[s as keyof typeof DIGITS] ?? s),
    join(""),
    parseNumber
  );
};

const createDay1 = (calibrationFn: CalibrationFn) =>
  flow(S.split("\n"), RA.map(calibrationFn), RA.compact, RA.reduce(0, add));

const day1 = createDay1(basicCalibration);
const day1pt2 = createDay1(advancedCalibration);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const DEMO = readFileSync(
    new URL("../inputs/1/demo.txt", import.meta.url),
    "utf-8"
  );
  const DEMO2 = readFileSync(
    new URL("../inputs/1/demo2.txt", import.meta.url),
    "utf-8"
  );
  const USER_INPUT = readFileSync(
    new URL("../inputs/1/user.txt", import.meta.url),
    "utf-8"
  );
  it("getCalibration", () => {
    expect(basicCalibration("1abc2")).toStrictEqual(O.some(12));
    expect(basicCalibration("treb7uchet")).toStrictEqual(O.some(77));
    expect(basicCalibration("trebuchet")).toStrictEqual(O.none);
    expect(advancedCalibration("1twone")).toStrictEqual(O.some(11));
  });
  it("day1", () => {
    expect(day1(DEMO)).toStrictEqual(142);
    expect(day1(USER_INPUT)).toStrictEqual(56506);
    expect(day1pt2(DEMO2)).toStrictEqual(281);
    expect(day1pt2(USER_INPUT)).gt(56001);
    expect(day1pt2(USER_INPUT)).eq(56017);
  });
}
