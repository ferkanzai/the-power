import { Request } from "express";

export type ErrnoException = {
  code?: number;
} & Error;

export interface NextFunctionWithErrno extends NextFunction {
  (err?: ErrnoException): void;
}
