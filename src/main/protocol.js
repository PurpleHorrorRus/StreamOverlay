import { protocol } from "electron";
import { URL } from "url";
import path from "path";

const PRODUCTION_APP_PROTOCOL = "overlay";
// eslint-disable-next-line no-undef
const PRODUCTION_APP_PATH = path.join(__dirname, "..", "renderer");

protocol.registerSchemesAsPrivileged([
    { 
        scheme: PRODUCTION_APP_PROTOCOL, 
        privileges: { 
            secure: true, 
            standard: true 
        } 
    }
]);

export default {
    register: () => {
        protocol.registerFileProtocol(PRODUCTION_APP_PROTOCOL, (request, callback) => {
            const pathname = path.normalize(new URL(request.url).pathname);
            const fullPath = path.join(PRODUCTION_APP_PATH, pathname);
            callback({ path: fullPath });
        });
    }
};