import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';

import { sql } from '../dbHandle';
import { cryptoHandle } from '../cryptoHandle';

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post('/', async (req: Request, res: Response, next: NextFunction) => {

    // 새롭게 개발 예정

});

export = router;