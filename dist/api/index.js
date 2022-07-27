"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const info_1 = __importDefault(require("./info"));
const login_1 = __importDefault(require("./login"));
const register_1 = __importDefault(require("./register"));
const search_1 = __importDefault(require("./search"));
const history_1 = __importDefault(require("./history"));
const loanAction_1 = __importDefault(require("./loanAction"));
const returnAction_1 = __importDefault(require("./returnAction"));
const pwReset_1 = __importDefault(require("./pwReset"));
const withDraw_1 = __importDefault(require("./withDraw"));
const addBook_1 = __importDefault(require("./addBook"));
const deleteBook_1 = __importDefault(require("./deleteBook"));
const meal_1 = __importDefault(require("./meal"));
const timetable_1 = __importDefault(require("./timetable"));
const token_1 = require("../token");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: false }));
router.use('/api/info', info_1.default);
router.use('/api/login', login_1.default);
router.use('/api/register', register_1.default);
router.use('/api/search', search_1.default);
router.use('/api/history', history_1.default);
router.use('/api/loanAction', loanAction_1.default);
router.use('/api/returnAction', returnAction_1.default);
router.use('/api/pwReset', pwReset_1.default);
router.use('/api/withDraw', withDraw_1.default);
router.use('/api/addBook', addBook_1.default);
router.use('/api/deleteBook', deleteBook_1.default);
router.use('/api/meal', meal_1.default);
router.use('/api/timetable', timetable_1.default);
router.post('/api/token', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = Object.assign(req.body, req.query);
    const result = yield token_1.jwtToken.verifyToken(token);
    return res.json(result);
}));
module.exports = router;
//# sourceMappingURL=index.js.map