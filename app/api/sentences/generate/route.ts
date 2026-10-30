import { api, HttpError } from "@/lib/api";
export const POST = api(
  "/api/sentences/generate",
  async () => {
    throw new HttpError(
      410,
      "Tạo học liệu đã chuyển sang Quản trị để duyệt trước khi xuất bản.",
    );
  },
  true,
);
