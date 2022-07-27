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
const axios_1 = __importDefault(require("axios"));
const lru_cache_1 = __importDefault(require("lru-cache"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const options = {
    max: 3,
    maxAge: 1000 * 60 * 60,
};
const cache = new lru_cache_1.default(options);
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: false }));
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { YMD } = Object.assign(req.body, req.query);
    if (!YMD) {
        return res.json({
            isError: true,
            message: '필수 옵션이 비어있습니다.'
        });
    }
    if (cache.has(YMD)) {
        const loadData = cache.get(YMD);
        return res.json({
            isError: false,
            message: '데이터를 로드하는데 성공했습니다.',
            mealData: loadData
        });
    }
    const getAPIurl = (_date) => ('https://open.neis.go.kr/hub/mealServiceDietInfo?' +
        'Type=json&' +
        `KEY=${process.env.neisToken}&` +
        'ATPT_OFCDC_SC_CODE=B10&' +
        'SD_SCHUL_CODE=7010137&' +
        `MLSV_YMD=${_date.split('-').join('')}`);
    try {
        const fetchMealData = yield axios_1.default.get(getAPIurl(YMD));
        let arr = [];
        for (let i = 0; i < fetchMealData.data['mealServiceDietInfo'][0]['head'][0]['list_total_count']; ++i) {
            let returnArray = [];
            const mealTitle = fetchMealData.data['mealServiceDietInfo'][1]['row'][i]['MMEAL_SC_NM'];
            const mealMenu = fetchMealData.data['mealServiceDietInfo'][1]['row'][i]['DDISH_NM'];
            mealMenu.split(/<br\/>/g).forEach((element) => {
                returnArray.push(element.replace(/\([^)]+\)/g, ''));
            });
            arr.push({
                title: mealTitle,
                menu: returnArray,
            });
        }
        cache.set(YMD, arr);
        return res.json({
            isError: false,
            message: '데이터를 로드하는데 성공했습니다.',
            mealData: arr
        });
    }
    catch (err) {
        return res.json({
            isError: true,
            message: 'Request를 보냈지만, 원하는 정보를 수신하지 못했습니다.',
        });
    }
}));
module.exports = router;
//# sourceMappingURL=meal.js.map