import express, { Request, Response, NextFunction } from 'express';

import { jwtTokenType } from '../../types';
import { jwtToken } from '../../token';
import { sql } from '../../dbHandle';

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post('/', async (req: Request, res: Response) => {
    const userToken: string | null = req.headers.authorization as string ?? null;

    if (!userToken) {
        return res.json({
            isError: true,
            message: '토큰이 비어있습니다.',
        });
    }

    const {title, s_date, e_date, content, cID}: {title: string, s_date: string, e_date: string, content: string, cID: string} = Object.assign(req.body, req.query);

    if (!title || !s_date || !e_date || !content) {
        return res.json({
            isError: true,
            message: '입력하지 않은 값들이 있습니다.',
        });
    }

    const { isError, returnValue }: { isError: boolean, returnValue: jwtTokenType } = await jwtToken.verifyToken(userToken);

    if (isError || returnValue.type !== "A") {
        return res.json({
            isError: true,
            message: '데이터 접근 권한이 없습니다.',
        });
    }

    try {
        const query1 = await sql(`select * from ${process.env.MYSQL_DB}.calendar from calendarID`, [cID])
        if(Array.isArray(query1) && query1.length === 0) {
            const query2:any = await sql(`insert into ${process.env.MYSQL_DB}.calendar VALUES(NULL, ?, ?, ?, ?, 0)`, [title, s_date, e_date, content])
            if (query2?.affectedRows == 0) {
                return res.json({
                    isError: true,
                    message: '책을 추가하지 못했습니다.'
                });
            }
            return res.json({
                isError: false,
                message: '새로운 책을 추가했습니다.',
            });
        }
        return res.json({
            isError: true,
            message: '이미 있는 책입니다.'
        })
    } catch (err) {
        return res.json({
            isError: true,
            message: err
        })
    }
});

export = router;
