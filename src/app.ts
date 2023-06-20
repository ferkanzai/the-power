import express, { Application, Request, Response } from "express";
import appRouter from "./routes";
import { ErrnoException, NextFunctionWithErrno } from "./types/app";

const app = express();

const configApp = (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/", appRouter);

  app.use((req, __, next: NextFunctionWithErrno) => {
    const error = {
      message: `path ${req.path} not found`,
      code: 404,
      name: "NotFoundError",
    } as const;

    next(error);
  });

  app.use(
    (error: ErrnoException, _: Request, res: Response, __: NextFunctionWithErrno) => {
      console.error(error);

      res.status(error.code || 500).json({
        success: false,
        info: {
          message: error.message,
        },
      });
    }
  );

  return app;
};

export default configApp(app);
