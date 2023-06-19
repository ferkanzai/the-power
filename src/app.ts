import express, { Application, NextFunction, Request, Response } from "express";
import { ErrnoException } from "./types/app";
import appRouter from "./routes";

const app = express();

const configApp = (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/", appRouter);

  app.use((req, __, next) => {
    const error: ErrnoException = new Error(`path ${req.path} not found`);
    error.code = 404;

    next(error);
  });

  app.use(
    (error: ErrnoException, _: Request, res: Response, __: NextFunction) => {
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
