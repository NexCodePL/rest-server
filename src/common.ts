import { ListenerSetupFunction } from "./generic.types";

export const listenerBasicSetup: ListenerSetupFunction = (request, response, setup?: ListenerSetupFunction) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    response.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, X-Requested-With, Authorization, Referer"
    );

    if (request.method === "OPTIONS") {
        response.statusCode = 200;
        response.end();
        return;
    }

    if (setup) {
        return setup(request, response);
    }

    return true;
};
