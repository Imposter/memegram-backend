import * as os from "os";
import { Result, ResultCode } from "../core/result";
import { JsonController, Get as GetReq } from "routing-controllers";

@JsonController("/system")
export default class SystemController {
    @GetReq("/info")
    info() {
        return new Result(ResultCode.Ok, {
            architecture: os.arch,
            memory: {
                free: os.freemem,
                total: os.totalmem
            },
            hostname: os.hostname,
            os: {
                platform: os.platform,
                release: os.release,
                type: os.type
            },
            uptime: os.uptime
        });
    }
}