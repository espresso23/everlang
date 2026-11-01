
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class ConfigService {
async get(_r: Request, _u: Viewer) {return { google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) };
}
}
