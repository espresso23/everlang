So sánh đặc trưng âm thanh (Audio Embeddings) để phân tích và chấm điểm phát âm.

Semantic Search: Tìm kiếm câu hỏi/từ đồng nghĩa dựa trên ngữ nghĩa thay vì từ khóa chính xác.

RAG (Retrieval-Augmented Generation) cho AI Chatbot đóng vai giáo viên hội thoại (AI Tutor).


PostgreSQL: Làm DB chính + dùng sẵn plugin pgvector để làm AI/Vector Search mà không cần cài thêm DB riêng.

Trợ giảng AI (Nâng cấp Outline / Ý tưởng mà không viết thay)

Smart Dashboard ("Hôm nay học gì?")Dựa trên kỹ thuật Rule-based Prioritization Queue kết hợp Background Task Scheduler:Cron Job (Chạy mỗi 00:00 sáng): Quét toàn bộ hệ thống để khởi tạo danh sách việc cần làm (Daily Micro-Tasks) cho từng user.Thuật toán sắp xếp thứ tự ưu tiên (Priority Engine):Độ ưu tiên 1 (Cao nhất): Từ vựng SRS đến hạn ôn tập trong ngày (next_review_date <= today).Độ ưu tiên 2: Bài làm dở dang chưa hoàn thành (status == 'IN_PROGRESS').Độ ưu tiên 3: Luyện tập kĩ năng đang có điểm thấp nhất (Dựa vào Band score bình quân các bài làm gần nhất).Độ ưu tiên 4: Bài học mới theo Lộ trình (Learning Path).Progress Aggregation: Đếm tổng nhiệm vụ $N$. Khi $N_{\text{completed}} == N_{\text{total}}$, cập nhật Streak ngày học của người dùng.


Mở rộng Kiến trúc dữ liệu cho Đa ngôn ngữ (Multilingual Database Schema)
Đối với ứng dụng đa ngôn ngữ, không tạo bảng riêng cho từng tiếng (ví dụ: words_korean, words_japanese). Thay vào đó, thiết kế hệ thống theo mô hình Localization Schema hóa thông tin:


Nguồn dữ liệu Kho từ vựng & Từ điển lấy từ đâu?
Nguồn 1: Dữ liệu mở công khai (Open-Source Dictionaries) — Miễn phí & Cốt lõi
B. Kỹ thuật Tách từ & Phân tích ngữ pháp (Morphological Analysis / Tokenization)Khi người dùng bôi đen/copy cả một câu tiếng Hàn/Trung/Nhật và bấm "Tra từ", hệ thống phải tự tách câu thành các từ đơn lẻ:Tiếng Nhật: Dùng thư viện MeCab hoặc SudachiPy để phân tích câu $\rightarrow$ tách Kana/Kanji $\rightarrow$ tự chuyển động từ về dạng nguyên thể (Dictionary Form) để tra dictionary.Tiếng Trung: Dùng Jieba hoặc HanLP để phân tích câu không có khoảng trắng thành các từ ghép có nghĩa.Tiếng Hàn: Dùng KoNLPy (Mecab-ko) để tách trợ từ (은/는/이/가) ra khỏi danh từ và đưa động từ chia quá khứ/tương lai về dạng gốc (-다).



Feature in todo list:
Writing và Speaking được AI chấm và chỉ lỗi khá kỹ: sai ở đâu, sửa thành gì, vì sao. Có bản viết lại để đối chiếu, cụm nào hay thì lưu thẳng vào kho từ vựng để ôn sau.
Listening và Reading làm tính giờ, chấm tự động ra band luôn
• Mock test full Writing và Speaking for korean, test follow as TOPIK standard






EverLang là ứng dụng học và luyện thi đa ngôn ngữ (IELTS, TOPIK, HSK, JLPT) tích hợp AI cá nhân hóa.

Sở hữu kho đề thi thực tế chuẩn format thật, EverLang tự động chấm điểm Listening/Reading và ứng dụng AI chấm chữa chi tiết Writing/Speaking từng lỗi sai. Kết hợp cùng thuật toán Lặp lại ngắt quãng (SRS) xóa bỏ tình trạng "học trước quên sau" và Smart Dashboard tự động xếp lịch học mỗi ngày, EverLang giúp bạn chinh phục mọi chứng chỉ hiệu quả và tiết kiệm thời gian nhất.