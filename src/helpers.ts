import * as S from "fp-ts/string";
import { flip, flow, pipe } from "fp-ts/function";
import * as RA from "fp-ts/lib/ReadonlyArray.js";
import * as O from "fp-ts/Option";
import { readFileSync } from "node:fs";
import * as RR from "fp-ts/lib/ReadonlyRecord.js";

export const parseNumber = (s: string) =>
  String(Number(s)) === s ? O.some(Number(s)) : O.none;

export const join = (s: string) => (xs: readonly string[]) => xs.join(s);

export const reverseString = flow(S.split(""), RA.reverse, join(""));

export const match = (regex: RegExp) => (s: string) =>
  RA.fromArray(s.match(regex) ?? []);

export const captureInt = flow(match(/[0-9]+/), RA.head, O.chain(parseNumber));

export const add = <T extends number>(a: T, b: T) => a + b;
export const mul = <T extends number>(a: T, b: T) => a * b;
export const max = <T extends number>(a: T, b: T) => Math.max(a, b);
