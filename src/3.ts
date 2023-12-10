import * as S from "fp-ts/string";
import { flow, pipe } from "fp-ts/function";
import * as RA from "fp-ts/lib/ReadonlyArray.js";
import * as O from "fp-ts/Option";
import { readFileSync } from "node:fs";
import * as RR from "fp-ts/lib/ReadonlyRecord.js";
import { tryParseNumber } from "./1.js";
import { add, mul } from "./2.js";

enum ComponentType {
  Number,
  Symbol,
}

class Range {
  constructor(private readonly start: number, private readonly end: number) {}

  public intersects(other: Range): boolean {
    return (
      (this.start >= other.start && this.start < other.end) ||
      (other.start >= this.start && other.start < this.end)
    );
  }
}

const parseRow = (rowNumber: number, row: string) => {
  return [...row.matchAll(/([0-9]+|[^0-9\.])/g)].map((r) => {
    const common = {
      rowNumber,
    };

    const index = r.index ?? 0;
    return pipe(
      r[0],
      tryParseNumber,
      O.matchW(
        () => ({
          ...common,
          type: ComponentType.Symbol as const,
          range: new Range(index - 1, index + 2),
          symbol: r[0],
        }),
        (number) => ({
          ...common,
          range: new Range(index, index + r[0].length),
          type: ComponentType.Number as const,
          number,
        })
      )
    );
  });
};

const d1 = (a: number, b: number) => Math.abs(a - b);

const day3 = flow(
  S.split("\n"),
  RA.mapWithIndex(parseRow),
  RA.flatten,
  (items) =>
    pipe(
      items,
      RA.filter(
        (item) =>
          item.type === ComponentType.Number &&
          items.some(
            (i) =>
              i.type === ComponentType.Symbol &&
              i.range.intersects(item.range) &&
              d1(i.rowNumber, item.rowNumber) <= 1
          )
      )
    ),
  RA.map((i) => (i.type === ComponentType.Number ? i.number : 0)),
  RA.reduce(0, add)
);

const day3pt2 = flow(
  S.split("\n"),
  RA.mapWithIndex(parseRow),
  RA.flatten,
  (items) =>
    pipe(
      items,
      RA.filterMap((item) => {
        if (
          item.type === ComponentType.Number ||
          (item.type === ComponentType.Symbol && item.symbol !== "*")
        )
          return O.none;

        const neighborNumbers = pipe(
          items,
          RA.filterMap((i) =>
            i.type === ComponentType.Number &&
            i.range.intersects(item.range) &&
            d1(i.rowNumber, item.rowNumber) <= 1
              ? O.some(i.number)
              : O.none
          )
        );

        if (neighborNumbers.length !== 2) return O.none;

        return O.some(pipe(neighborNumbers, RA.reduce(1, mul)));
      })
    ),
  RA.reduce(0, add)
);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const DEMO = readFileSync(
    new URL("../inputs/3/demo.txt", import.meta.url),
    "utf-8"
  );
  const USER = readFileSync(
    new URL("../inputs/3/user.txt", import.meta.url),
    "utf-8"
  );
  it("day3", () => {
    expect(day3(DEMO)).toStrictEqual(4361);
    expect(day3(USER)).toStrictEqual(537732);
    expect(day3pt2(DEMO)).toStrictEqual(467835);
    expect(day3pt2(USER)).toStrictEqual(84883664);
  });
}
