import * as S from "fp-ts/string";
import { flow, pipe } from "fp-ts/function";
import * as RA from "fp-ts/lib/ReadonlyArray.js";
import * as O from "fp-ts/Option";
import { readFileSync } from "node:fs";
import * as RR from "fp-ts/lib/ReadonlyRecord.js";
import * as N from "fp-ts/lib/number.js";
import { add, match, parseNumber } from "./helpers.js";

const parseCard = flow(
  match(/Card [0-9 ]+:([0-9 ]+)\|([0-9 ]+)/),
  RA.dropLeft(1),
  RA.map(flow(S.split(/ +/g), RA.map(parseNumber), RA.compact)),
  (collections) => {
    const [winning, user] = collections;
    const matches = RA.intersection(N.Eq)(user, winning).length;
    return O.some({ winning, user, matches });
  }
);

const day4 = flow(
  S.split("\n"),
  RA.map(parseCard),
  RA.compact,
  RA.map((x) => Math.floor(2 ** (x.matches - 1))),
  RA.reduce(0, add)
);

const day4pt2 = flow(
  S.split("\n"),
  RA.map(parseCard),
  RA.compact,
  (cards) => {
    return cards.reduce((collected: Record<number, number>, c, index) => {
      collected[index] ||= 1;
      for (let i = 0; i < c.matches; i++) {
        collected[index + i + 1] ||= 1;
        collected[index + i + 1] += collected[index];
      }
      return collected;
    }, {});
  },
  Object.values,
  RA.reduce(0, add)
);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const DEMO = readFileSync(
    new URL("../inputs/4/demo.txt", import.meta.url),
    "utf-8"
  );
  const USER = readFileSync(
    new URL("../inputs/4/user.txt", import.meta.url),
    "utf-8"
  );

  it("day4", () => {
    expect(day4(DEMO)).toStrictEqual(13);
    expect(day4(USER)).gt(12160);
    expect(day4(USER)).toStrictEqual(23847);
    expect(day4pt2(DEMO)).toStrictEqual(30);
    expect(day4pt2(USER)).toStrictEqual(8570000);
  });
}
