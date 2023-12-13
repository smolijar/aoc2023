import * as S from "fp-ts/string";
import { flow, pipe } from "fp-ts/function";
import * as RA from "fp-ts/lib/ReadonlyArray.js";
import * as O from "fp-ts/Option";
import { readFileSync } from "node:fs";
import { add, captureInt, max, mul } from "./helpers.js";

const parseRound = (colors: readonly string[]) =>
  ["red", "green", "blue"].map((color) =>
    pipe(
      colors,
      RA.findFirst(S.includes(color)),
      O.chain(captureInt),
      O.getOrElse(() => 0)
    )
  ) as [number, number, number];

const parseGameRecord = flow(
  S.split("; "),
  RA.map(S.split(", ")),
  RA.map(parseRound),
  (rounds) =>
    [
      rounds.map((r) => r[0]).reduce(max, 0),
      rounds.map((r) => r[1]).reduce(max, 0),
      rounds.map((r) => r[2]).reduce(max, 0),
    ] as const
);

const parseGame = flow(S.split(": "), ([idLabel, rawRecord]) => ({
  id: pipe(
    idLabel,
    captureInt,
    O.getOrElse(() => 0)
  ),
  maxes: parseGameRecord(rawRecord),
}));

const parse = flow(S.split("\n"), RA.map(parseGame));

const day2 = flow(
  parse,
  RA.filter((g) => g.maxes[0] <= 12 && g.maxes[1] <= 13 && g.maxes[2] <= 14),
  RA.map((g) => g.id),
  RA.reduce(0, add)
);

const day2pt2 = flow(
  parse,
  RA.map((g) => g.maxes.reduce(mul, 1)),
  RA.reduce(0, add)
);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const DEMO = readFileSync(
    new URL("../inputs/2/demo.txt", import.meta.url),
    "utf-8"
  );
  const USER = readFileSync(
    new URL("../inputs/2/user.txt", import.meta.url),
    "utf-8"
  );
  it("day2", () => {
    expect(day2(DEMO)).toStrictEqual(8);
    expect(day2(USER)).toStrictEqual(2256);
    expect(day2pt2(DEMO)).toStrictEqual(2286);
    expect(day2pt2(USER)).toStrictEqual(74229);
  });
}
