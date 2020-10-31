import { IncomingHttpHeaders, ServerResponse } from "http";

export interface Request {
    method: string;
    headers: IncomingHttpHeaders;
    rawHeaders: string[];
    data?: any;
    params?: any;
}

export interface Response {
    data?: Record<string, unknown>;
    status: number;
}

export type RouterEndpointFunction = (request: Request) => Response;

export type RouterEndpoint<T extends string> = {
    [K in T]: RouterEndpointFunction;
};

export interface Router {
    [key: string]: RouterEndpointFunction;
}

export type ListenerSetupFunction = (request: Request, response: ServerResponse) => boolean | undefined;
