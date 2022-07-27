"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = require("express-rate-limit");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const api_1 = __importDefault(require("./api"));
dotenv_1.default.config();
class App {
    constructor() {
        this.application = (0, express_1.default)();
        this.setMiddleWare();
        this.getRouting();
    }
    setMiddleWare() {
        this.application.use((0, cors_1.default)());
        this.application.use(express_1.default.json());
        this.application.use((0, express_rate_limit_1.rateLimit)({
            windowMs: 1 * 60 * 1000,
            max: 100
        }));
    }
    getRouting() {
        this.application.use('/', api_1.default);
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map