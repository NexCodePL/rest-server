import { IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import { parse as JSONparse } from "secure-json-parse";

import { ListenerSetupFunction, Request, Router } from "./generic.types";

export async function listener(
    request: IncomingMessage,
    response: ServerResponse,
    router: Router,
    setup?: ListenerSetupFunction
): Promise<void> {
    if (!request.url || !request.method) {
        response.statusCode = 400;
        response.end();
        return;
    }

    const urlObject = parse(request.url, true);

    let data: any | undefined = undefined;

    if (request.method === "POST") {
        const body = await awaitBody(request);
        if (body) {
            data = JSONparse(body, undefined, { protoAction: "remove", constructorAction: "remove" });
        }
    }

    const requestObject: Request = {
        method: request.method,
        headers: request.headers,
        rawHeaders: request.rawHeaders,
        data: data,
        params: urlObject.query,
    };

    const canProceed = setup ? setup(requestObject, response) : true;

    if (!canProceed) return;

    const endpointFunction = router[`${request.method}:${urlObject.pathname}`];

    if (!endpointFunction) {
        response.statusCode = 404;
        response.end();
        return;
    }

    const endpointResponse = endpointFunction(requestObject);

    if (!endpointResponse) {
        response.statusCode = 500;
        response.end();
        return;
    }

    let responseData: string | undefined = undefined;

    if (endpointResponse.data) {
        try {
            responseData = JSON.stringify(endpointResponse.data);
        } catch (e) {
            response.statusCode = 500;
            response.end();
            return;
        }
    }

    response.setHeader("Content-Type", "application/json");
    response.statusCode = endpointResponse.status;
    response.end(responseData);
}

async function awaitBody(request: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        request.on("data", onData);
        request.on("end", onEnd);
        request.on("error", onEnd);

        function onData(chunk: Buffer) {
            chunks.push(chunk);
        }

        function onEnd(error?: any) {
            request.removeListener("data", onData);
            request.removeListener("end", onEnd);
            request.removeListener("error", onEnd);

            if (error) {
                reject(error);
            }

            resolve(Buffer.concat(chunks).toString("utf8"));
        }
    });
}
