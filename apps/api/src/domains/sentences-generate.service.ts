import { HttpError } from '@everlang/backend/http';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class SentencesGenerateService {
async post(_r: Request, _u: Viewer) {
    throw new HttpError(
      410,
      "Tạo học liệu đã chuyển sang Quản trị để duyệt trước khi xuất bản.",
    );

}
}
