import * as S from "fp-ts/string";
import { flow, pipe } from "fp-ts/function";
import * as RA from "fp-ts/lib/ReadonlyArray.js";
import * as O from "fp-ts/Option";
import { readFileSync } from "node:fs";
import * as RR from "fp-ts/lib/ReadonlyRecord.js";
import { add, match } from "./2.js";

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

export const tryParseNumber = (s: string) =>
  String(Number(s)) === s ? O.some(Number(s)) : O.none;

const join = (s: string) => (xs: readonly string[]) => xs.join(s);

const basicCalibration: CalibrationFn = flow(
  (s: string) => s.replace(/[^0-9]/g, ""),
  S.split(""),
  (xs) => [RA.head(xs), RA.last(xs)],
  RA.compact,
  join(""),
  tryParseNumber
);

type CalibrationFn = (s: string) => O.Option<number>;

const reverseString = flow(S.split(""), RA.reverse, join(""));

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
    tryParseNumber
  );
};

// RR.find

const day1 = (calibrationFn: CalibrationFn) =>
  flow(S.split("\n"), RA.map(calibrationFn), RA.compact, RA.reduce(0, add));

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

    expect(advancedCalibration("two1nine")).toStrictEqual(O.some(29));
    expect(advancedCalibration("eightwothree")).toStrictEqual(O.some(83));
    expect(advancedCalibration("abcone2threexyz")).toStrictEqual(O.some(13));
    expect(advancedCalibration("xtwone3four")).toStrictEqual(O.some(24));
    expect(advancedCalibration("4nineeightseven2")).toStrictEqual(O.some(42));
    expect(advancedCalibration("zoneight234")).toStrictEqual(O.some(14));
    expect(advancedCalibration("7pqrstsixteen")).toStrictEqual(O.some(76));

    expect(advancedCalibration("zoneight234")).toStrictEqual(O.some(14));

    expect(advancedCalibration("587cdbcb2mspbgbl")).toStrictEqual(O.some(52));
    expect(advancedCalibration("twojkblghsctseven8eight")).toStrictEqual(
      O.some(28)
    );
    expect(advancedCalibration("2xmdmtgcjhd8eighttwo")).toStrictEqual(
      O.some(22)
    );
    expect(advancedCalibration("nine6qpfzxhsdsfour9")).toStrictEqual(
      O.some(99)
    );
    expect(advancedCalibration("9rvqhjvmh7kcvnineccn9rzpzs")).toStrictEqual(
      O.some(99)
    );
    expect(advancedCalibration("tbsxkhhv6twozrtczg6seven")).toStrictEqual(
      O.some(67)
    );
    expect(
      advancedCalibration("ccpeightbcvknglvcv81gcjnlnfnine9")
    ).toStrictEqual(O.some(89));
    expect(advancedCalibration("1twone")).toStrictEqual(O.some(11));
  });
  it("day1", () => {
    expect(day1(basicCalibration)(DEMO)).toStrictEqual(142);
    expect(day1(basicCalibration)(USER_INPUT)).toStrictEqual(56506);
    expect(day1(advancedCalibration)(DEMO2)).toStrictEqual(281);
    expect(day1(advancedCalibration)(USER_INPUT)).gt(56001);
    expect(day1(advancedCalibration)(USER_INPUT)).eq(56017);
  });
}
