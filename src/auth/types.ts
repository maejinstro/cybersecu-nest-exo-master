export interface JwtPayload {
  sub: number;
  role: string;
}

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}
