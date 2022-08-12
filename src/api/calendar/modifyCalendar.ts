import express, { Request, Response, NextFunction } from 'express';

import { jwtTokenType } from '../../types';
import { jwtToken } from '../../token';
import { sql } from '../../dbHandle';
import { cryptoHandle } from '../../cryptoHandle';

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.put('/', async (req: Request, res: Response) => {
    const userToken: string | null = req.headers.authorization as string ?? null;

    if (!userToken) {
        return res.json({
            isError: true,
            message: '토큰이 비어있습니다.',
        });
    }

    const { calendarID, title, s_date, e_date, content }: { calendarID: string, title: string, s_date: string, e_date: string, content: string } = Object.assign(req.body, req.query);

    if (!calendarID || !title || !s_date || !e_date || !content) {
        return res.json({
            isError: true,
            message: '입력하지 않은 값들이 있습니다.',
        });
    }

    const { isError, returnValue }: { isError: boolean, returnValue: jwtTokenType } = await jwtToken.verifyToken(userToken);

    if (isError || returnValue.type !== 'A') {
        return res.json({
            isError: true,
            message: '데이터 접근 권한이 없습니다.',
        });
    }

    try {
        const query1: any = await sql(`SELECT * FROM ${process.env.MYSQL_DB}.calendar WHERE calendarID=?`, [calendarID]);
        if (Array.isArray(query1) && query1.length === 0)
            return res.json({
                isError: true,
                message: '일정이 존재하지 않습니다.'
            });
        const query2: any = await sql(`UPDATE ${process.env.MYSQL_DB}.calendar SET title=?, sDate=?, eDate=?, content=? WHERE calendarID=? AND userID=?`,
            [title, s_date, e_date, content, calendarID, cryptoHandle.AES_DEC(returnValue.id)]);
        if (query2?.affectedRows == 0) {
            return res.json({
                isError: true,
                message: '다른 사람이 등록한 일정은 수정할 수 없습니다.'
            });
        }
        return res.json({
            isError: false,
            message: '성공적으로 일정을 수정했습니다.'
        });
    }
    catch (err) {
        return res.json({
            isError: true,
            message: err
        })
    }
});

export = router;