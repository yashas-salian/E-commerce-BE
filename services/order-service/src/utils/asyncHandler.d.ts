import type { NextFunction, Request, Response } from "express";
type Handler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare function asyncHandler(fn: Handler): (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=asyncHandler.d.ts.map