import { statistics } from "@everlang/backend/learning/submissions";
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class UserStatsService {
async get(_: Request, u: Viewer) {return statistics(u.id);
}
}
