import axios from 'axios'
import express, { Request, Response, NextFunction } from 'express';

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));


declare var process : {
    env: {
        neis_auth_key: string
    }
}

const neis_auth_key = process.env.neis_auth_key // 나이스 인증키
const school_code = 7011489 // 우리 학교 나이스 학교 코드
let TIME_TABLE: any[] = []
let LAST_DATE_TIME_TABLE = ""

declare global {
    interface String {
        fillZero(number: number) : string | String
    }
}

String.prototype.fillZero = function(width: number) { // 빈공강 0으로 채우기
    return this.length >= width ? this:new Array(width-this.length+1).join('0')+this;

}

declare global {
    interface String {
        fillZero(number: number) : string | String
    }
}

String.prototype.fillZero = function(width: number) { // 빈공강 0으로 채우기
    return this.length >= width ? this:new Array(width-this.length+1).join('0')+this;

}

async function get_time_table() {
    let now = new Date()
    let start_date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()) // 현재 주간 시작 날짜 구하기
    let end_date = new Date(start_date.getTime() + 6 * 24 * 60 * 60000) // 주간 마지막 날짜 구하기 
    
    let date_string = start_date.getDate().toString() + end_date.getDate().toString() // 저장용 키 생성
    
    if (LAST_DATE_TIME_TABLE == date_string)  // 같은 주라면 저장해둔 시간표 리턴
        return TIME_TABLE
    

    TIME_TABLE = []
    LAST_DATE_TIME_TABLE = date_string

    for (let i = 0; i < 7; i++) { // 날짜별로 가져오기
        let get_date: any = new Date(start_date.getTime() + i * 24 * 60 * 60000)      
        let response = await axios.get("https://open.neis.go.kr/hub/hisTimetable", {
            params: {
                KEY: neis_auth_key,
                Type: "json",
                pIndex: 1,
                pSize: 1000,
                ATPT_OFCDC_SC_CODE: "B10",
                SD_SCHUL_CODE: school_code,
                ALL_TI_YMD: get_date.getFullYear().toString()+ (get_date.getMonth() + 1).toString().fillZero(2) + get_date.getDate().toString().fillZero(2),
            }
        }) // 나이스 API 요청
        
        let data = []
        if (!response.data.RESULT)  // 시간표 존재 여부 판별
            data = response.data.hisTimetable[1].row // 존재
        
        let day_lessons: {
            [key: string]: string[];
        } = {} // 시간표 임시 저장용 변수
    
        for (let lesson of data) {
            if (lesson.CLASS_NM != null) {
                let formated_name: string = (lesson.GRADE.toString() + lesson.CLASS_NM.toString()) // 저장용 이름

                if (day_lessons[formated_name] == undefined) 
                    day_lessons[formated_name] = []
                
                if (lesson.ITRT_CNTNT.startsWith("프로그래밍") == false)  // 나이스가 선택 과목을 제대로 표현하지 못해 선택과목은 제거 후 모든 금요일 5 6 7 교시에 선택 과목 추가
                    day_lessons[formated_name].push(lesson.ITRT_CNTNT)
                
            }
        }
        TIME_TABLE.push(day_lessons) // 임시 저장했던 시간표 최종 변수에 저장
    }

    let i = 0
    for (let table of TIME_TABLE) { // 금요일 5 6 7 교시에 선택 과목 추가
        for (let key of Object.keys(table)) {
            let table2 = table[key]
            if (i == 5) {
                table2.concat(["선택 과목", "선택 과목", "선택 과목"])
            }
        }
        i++
    }
    return TIME_TABLE // 끝
}


router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const { class_nm, day } = Object.assign(req.body, req.query);

    let data = await get_time_table()
    return res.json({
        isError: false,
        data: data[parseInt(day)][class_nm.replace('-', '')]
    });
});

export = router;