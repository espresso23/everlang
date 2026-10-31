# Discovery — Từ vựng theo chủ đề và luyện phát âm

Ngày: 2026-10-31. Trạng thái: **đề xuất để tham khảo**, chưa duyệt scope/estimate/sprint. Branch: `docs/vocabulary-pronunciation-discovery`. Phạm vi: tự học tiếng Hàn; chưa mở rộng ngôn ngữ hoặc cam kết phủ mọi ngành nghề.

## Quyết định đề xuất

Xây vòng **chọn tình huống → học từ/cụm trong câu → nghe → thử nhớ/dùng → luyện nói → lưu và ôn → theo dõi điểm yếu**. Phát triển từ module hiện có, không tạo kho SRS thứ hai. “Đầy đủ” cần được định nghĩa bằng coverage matrix chủ đề × trình độ × tình huống × chất lượng nội dung, không bằng một tổng số từ quảng cáo.

Hai hướng: (A, khuyến nghị) hoàn thiện một lát cắt từ vựng/audio/ôn tập và chạy spike chấm phát âm song song trước khi bật điểm; (B) làm speaking-first với tập câu nhỏ và chấm phát âm làm trung tâm, chấp nhận thư viện chủ đề phát triển chậm hơn. Chưa có dữ liệu giờ/tuần, ngân sách audio/API và bản ghi benchmark nên không chốt lịch.

## Hiện trạng đã đối chiếu tĩnh

- [Vocabulary API](../../app/api/vocabulary/route.ts), `GET/POST/PUT`: từ/cụm/ngữ pháp, nghĩa/ngữ cảnh/nguồn cá nhân; chống trùng hiện dùng user + term + kind, chưa phân biệt sense của cùng một từ.
- [Vocabulary screen](../../app/vocabulary/page.tsx), `Vocabulary`: thêm/sửa/ôn và gọi `speak`; chưa có thư viện bộ từ theo chủ đề được biên soạn ở luồng này.
- [SRS](../../lib/learning/srs.ts), `newCard/reviewCard`: FSRS hiện có; giữ lịch/log, không gán điểm phát âm thành mức nhớ tự động.
- [Recordings API](../../app/api/recordings/route.ts), `POST`: Google STT → AI góp ý transcript → S3/SQL. Prompt hiện chủ động không chấm phát âm. [Đặc tả/audit](../features/immersive-learning/README.md) ghi provider/device chưa verified trọn luồng.
- Đây là review source/docs, **không** là kiểm thử microphone/provider/browser hoặc audit runtime mới.

## Bằng chứng tham khảo

Các nguồn dưới được đọc ngày 2026-10-31; chỉ xem nội dung công khai, chưa dùng thử tài khoản/app hoặc gọi API trả phí.

| ID | Nguồn trực tiếp | Loại / quan sát | Giới hạn và ứng dụng |
|---|---|---|---|
| S1 | [NIKL — tìm theo phạm trù](https://krdict.korean.go.kr/vie/dicSearch/actCategory) | UI công khai: chủ đề/tình huống, ngữ nghĩa và sơ/trung/cao cấp | Học cách phân loại nhiều chiều; không chứng minh kho từ mọi ngành đã đầy đủ. |
| S2 | [LingQ Korean](https://www.lingq.com/en/learn-korean-online/) | Mô tả sản phẩm: nội dung theo sở thích, audio/transcript, từ trong ngữ cảnh và SRS | Vendor claim, chưa test; gợi ý nối bộ từ với bài đọc/nghe thay vì chỉ danh sách. |
| S3 | [TEUIDA](https://www.teuida.net/en) | Mô tả sản phẩm: nói theo tình huống và phản hồi phát âm | Chưa đo độ chính xác; học cách đặt bài nói trong nhiệm vụ giao tiếp. |
| S4 | [Hàn Quốc Lý Thú](https://hanquoclythu.com/) | Navigation công khai có quy tắc phát âm, từ theo chủ đề sơ/trung cấp, đọc–dịch | Không kết luận tính năng tracking/chấm nói có hay không từ navigation. |
| S5 | [Tiếng Hàn Thú Vị — địa điểm](https://www.tienghanthuvi.edu.vn/2026/06/tu-vung-tieng-han-chu-e-ia-iem-noi-chon.html) | Search index hiện từ theo chủ đề/nút nghe | Mở bài trả 429; tín hiệu gián tiếp, chưa xác minh playback và không dùng làm bằng chứng chấm phát âm. |
| S6 | [Azure language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=pronunciation-assessment) | Tài liệu kỹ thuật: pronunciation assessment có ko-KR | Xác minh hỗ trợ, chưa chứng minh chất lượng cho người Việt. |
| S7 | [Azure assessment usage](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment) | Model assessment riêng; prosody en-US; phoneme names giới hạn locale, các locale khác chỉ có score phoneme | Không hứa highlight chính xác tên âm Hàn hoặc điểm ngữ điệu bằng tính năng tiếng Anh. Cần xem payload ko-KR thực tế. |
| S8 | [NIKL copyright](https://krdict.korean.go.kr/vie/kboardPolicy/copyRightTermsInfo) | Có chính sách tái sử dụng và ghi công | Trước nhập dữ liệu/audio, rà điều kiện từng loại tài sản, API và ngoại lệ; chưa phê duyệt ingest. |

Các nguồn chứng minh cách tổ chức/tính năng được công bố, không chứng minh hiệu quả ghi nhớ. Chưa có phỏng vấn hoặc thống kê pain point; các giả thuyết sau cần kiểm chứng.

## Pain point → hành vi đề xuất

| ID | Giả thuyết cần kiểm | Đáp ứng đề xuất | Cách kiểm chứng |
|---|---|---|---|
| H1 | Biết nghĩa nhưng khó dùng từ vào tình huống | Nghĩa cụ thể, collocation, câu và mini-dialogue, câu tự đặt | Nhờ người học làm nhiệm vụ dùng từ sau bài, review câu theo rubric. |
| H2 | Nhìn chữ biết nhưng nghe không nhận ra | Audio từ/câu, nghe chọn nghĩa, chép ngắn và lặp đoạn | Đo riêng recall nghe và đọc trên nội dung đã duyệt. |
| H3 | Có điểm nói nhưng không biết sửa gì hoặc không tin điểm | Nghe lại đoạn, vùng cần luyện có bằng chứng, bài sửa mục tiêu, báo điểm sai | Đối chiếu feedback với người duyệt; theo dõi false rejection và disagreement. |
| H4 | Thêm nhiều bộ từ làm quá tải ôn | Kiểm tra từ đã biết, chọn số từ mới, ưu tiên thẻ đến hạn | Quan sát tồn thẻ/hoàn thành ôn và recall trễ; không dùng streak thay kết quả học. |

## Feature inventory đề xuất

| Nhóm | Phạm vi quan trọng | Ưu tiên |
|---|---|---|
| Thư viện chủ đề | Đời sống, học tập, công việc chung, lĩnh vực chuyên môn; lọc level/mục tiêu, preview coverage, chọn bộ và bỏ qua từ biết | Must |
| Nội dung từ | Lemma + POS + sense ID, nghĩa Việt, cách đọc Hangul, cụm thường dùng, câu Hàn–Việt, register, nguồn/version/reviewer; Hanja khi hữu ích | Must |
| Audio | Từ và câu riêng; giọng/tốc độ, nghe lặp, nhãn TTS/người thật; audio khớp version văn bản; fallback khi thiếu âm thanh | Must |
| Học chủ động | Recall hai chiều theo nghĩa cụ thể, nghe hiểu, cloze, tự đặt câu; nhận biết khác với dùng được | Must |
| Ôn/tiến độ | Kết nối FSRS cũ, giữ context/sense, không duplicate do học bộ khác, hạn mức từ mới, lịch ngày; tách nhớ/hiểu nghe/phát âm | Must |
| Luyện phát âm | Nghe mẫu → thu từ/câu → nghe A/B → chấm có điều kiện → gợi ý bài sửa → thử lại/lịch sử | Must cho mục tiêu sản phẩm; rollout gated |
| Ngữ âm mục tiêu | Batchim, nối âm, đồng hóa và phụ âm dễ nhầm; bài phân biệt âm + câu ngắn, ví dụ do người duyệt | Should |
| Tình huống | Hội thoại có vai: mua hàng, gọi điện, phỏng vấn, họp; dùng từ vừa học; đánh giá dùng từ và nội dung tách phát âm | Should |
| Nền tự học rộng hơn | Ngữ pháp/so sánh mẫu, đọc/nghe theo trình độ, viết/dịch và sổ lỗi, diagnostic và lộ trình | Tích hợp backlog đã có |
| Cá nhân hóa nội dung | Nhập từ/câu riêng, báo lỗi học liệu/điểm, đề xuất dựa trên mục tiêu và lỗi đã xác minh | Should/later |

Khung chủ đề là **đề xuất taxonomy**, không tuyên bố “thường dùng nhất” nếu chưa có corpus/tần suất/tiêu chí chọn: đời sống (ăn uống, nhà ở, đi lại, sức khỏe, quan hệ, hành chính); học tập và xã hội (trường học, truyền thông, môi trường, kinh tế); công việc chung (email, họp, báo cáo, tuyển dụng); chuyên ngành (IT, kinh doanh–marketing, tài chính, sản xuất–logistics, du lịch–khách sạn, y tế, pháp lý). Chọn ngành bằng nhu cầu thực; ngành chuyên sâu cần duyệt chuyên môn ngoài việc biết tiếng Hàn.

## Hợp đồng nghiệp vụ cần refine

- Kho chung versioned thuộc content-authoring/MongoDB; bản ghi học/FSRS/attempt thuộc PostgreSQL; audio object storage, metadata/source/version tham chiếu rõ. Đây là thiết kế đề xuất, chưa có schema/route mới.
- Một từ có nhiều nghĩa; nhiều topic cùng trỏ entry/sense. Snapshot câu/source vào lịch sử, không thay silent khi cập nhật học liệu. Migration uniqueness cá nhân phải có chiến lược giữ state/log.
- Audio mẫu duyệt trước khi publish; ví dụ tự biên soạn hoặc có quyền dùng. Không sinh toàn bộ ví dụ bằng AI rồi tự coi đúng. Chưa hứa đầy đủ bằng AI generation.
- Với thu âm: user chủ động bật mic và đồng ý gửi provider; nghe local trước; retention/xóa, ownership, private URL, retry/idempotency và giới hạn chi phí cần spec trước code.
- Âm thanh rỗng/nhiễu/thiếu quyền mic/provider timeout → hướng dẫn thử lại, không lưu điểm 0 giả. Cho phép tiếp tục học bằng đọc nếu audio unavailable.
- Điểm phát âm là đánh giá luyện tập từ âm thanh; không lấy độ khớp STT hoặc nhận xét LLM trên transcript để đổi thành điểm. Không quy điểm ngữ điệu tiếng Anh sang tiếng Hàn. Không tự suy vị trí lưỡi từ transcript.
- Điểm từ riêng đánh giá hẹp hơn câu; tốc độ/fluency chỉ hiện ở ngữ cảnh phù hợp. Phát âm và nhớ từ lưu riêng; score không tự chọn Again/Hard/Good/Easy.
- Không phạt dấu câu trong bài dịch; bài nói đọc mẫu so nội dung có chuẩn hóa phù hợp, không đánh đồng thiếu punctuation với lỗi âm thanh.

## Bổ sung: thư viện đọc lại và tra cứu kiến thức

Yêu cầu bổ sung của owner ngày 2026-10-31: có tài liệu để đọc lại, ngữ pháp, quán dụng ngữ/idiom và các nội dung liên quan. Đưa vào phạm vi discovery; chưa thay đổi commitment sprint.

| Phân khu đề xuất | Nội dung và hành vi |
|---|---|
| Ngữ pháp | Ý nghĩa, cách kết hợp/chia, điều kiện dùng, sắc thái, hạn chế, lỗi hay mắc; ví dụ Hàn–Việt/audio; so sánh cấu trúc gần nghĩa; liên kết bài tập. |
| Quán dụng ngữ / idiom (관용구) | Một nhóm nội dung với hai nhãn tìm kiếm Việt/Anh, tránh làm hai kho trùng. Nghĩa đen khi hữu ích, nghĩa sử dụng, tình huống phù hợp/không phù hợp, ví dụ hội thoại và biến thể. |
| Tục ngữ (속담) | Ý nghĩa, thông điệp, ngữ cảnh văn hóa và ví dụ sử dụng; đối chiếu tiếng Việt chỉ khi có tương đương phù hợp, không ép dịch từng chữ. |
| Thành ngữ Hán-Hàn (사자성어/고사성어) | Chữ Hán/âm đọc khi có nguồn, giải nghĩa, nguồn gốc được kiểm chứng nếu nêu, mức trang trọng và ví dụ; nhãn phân loại có thể giao nhau, không buộc taxonomy loại trừ. |
| Cụm kết hợp / mẫu diễn đạt | Collocation, lời nói thường dùng, kính ngữ và văn nói/văn viết; liên kết nghĩa cụ thể của từ. |
| Quy tắc phát âm | Bài giải thích ngắn có audio và ví dụ nối âm/batchim/biến âm đã duyệt, dẫn sang bài luyện từ/câu tương ứng. |
| Tài liệu và bài đọc | Bài hướng dẫn tổng hợp, đọc theo trình độ/chủ đề, transcript; mục lục/heading anchors, nguồn/quyền, version; PDF chỉ thêm khi có quyền và nhu cầu, không bắt buộc MVP. |

Chức năng đọc lại: tìm theo chữ Hàn/từ khóa Việt, lọc loại/chủ đề/level; bookmark, tiếp tục vị trí đọc, ghi chú cá nhân; liên kết bài liên quan; lưu mẫu/câu vào SRS. Chưa cần tạo chức năng đánh dấu trực tiếp trên PDF trong pilot. Nội dung HTML cấu trúc là nguồn chuẩn để tìm kiếm, đọc mobile và liên kết ổn định.

Hợp đồng đề xuất: một canonical knowledge entry có stable ID/version và quan hệ với từ/câu/bài tập. Tài liệu tổng hợp tham chiếu entry, không sao chép định nghĩa thành nhiều bản. Ghi chú/bookmark/progress của user riêng tư. “Đã đọc” không đồng nghĩa “đã nắm vững”; tạo thẻ phải do người học chọn. Vị trí đọc lưu theo section ID, fallback khi nội dung thay đổi; nội dung bị gỡ không làm mất ghi chú/thẻ đã lưu, nhưng hiển thị tình trạng nguồn theo chính sách snapshot.

Acceptance cần refine: tìm được bằng nhãn idiom/quán dụng ngữ mà không tạo hai entry; đi từ đoạn đọc đến đúng mẫu/nghĩa rồi quay lại vị trí đọc; bookmark/ghi chú đồng bộ đúng user; thiếu kết quả có fallback; thẻ giữ nguồn/version và không reset lịch khi lưu lại. Kiểm keyboard, đọc trên mobile và text zoom; không chỉ cung cấp ảnh chụp/PDF không đọc được văn bản.

Nguồn S9: [NIKL Open API documentation](https://krdict.korean.go.kr/kor/openApi/openApiInfo), đọc 2026-10-31: tài liệu chính thức phân biệt mục tìm 관용구 và 속담, có tìm nghĩa/ví dụ và bản dịch tiếng Việt. Chưa gọi API thực tế hoặc xác nhận coverage nội dung. Đây là căn cứ tham khảo taxonomy/tra cứu, không là nguồn thay thế biên soạn toàn bộ thư viện ngữ pháp.

Traceability: PB-001/002/005/006 đã bao phủ thư viện ngữ pháp và so sánh; PB-007 nối SRS, PB-013/014 đọc/nghe. Bookmark/reading-position riêng và thư viện idiom/proverb là phạm vi cần refine thêm, chưa coi đã có trong các PBI trên. Pilot bổ sung gợi ý 5 grammar entries hiện đã nằm trong kế hoạch + 10 idiom + 5 proverb đã duyệt; chưa tự cộng nội dung vào capacity. Không tạo board tracking thứ hai hoặc gán ID PBI mới trong discovery.

Review bổ sung: PASS về đề xuất taxonomy, kiểm trùng ngữ pháp hiện đã planned và ghi nguồn S9; NOT VERIFIED về học liệu, API thực, UI/progress đồng bộ. Khi triển khai phải cập nhật canonical feature docs, không dùng nghiên cứu này để thay thế spec.

## Lát cắt và acceptance mẫu

Pilot đề xuất: 3 chủ đề × 30 entry/sense = 90 mục, mỗi mục 2 câu tự biên soạn/duyệt, audio từ + câu; một tình huống cho mỗi chủ đề. Đây là giới hạn thử nghiệm, không phải lịch/cam kết mới. Đời sống và công việc chung trước, chuyên ngành sau khi có demand/reviewer.

1. Học lại entry/sense từ bộ khác không tạo lịch ôn thứ hai hoặc reset lịch cũ; homograph khác nghĩa không bị loại nhầm. Test migration nếu đổi uniqueness.
2. Published entry thiếu example/audio bắt buộc không vượt gate nội dung; admin thấy lỗi cụ thể. Text sửa version mới không trỏ nhầm audio cũ.
3. Audio/mic không khả dụng vẫn có trạng thái giải thích và đường tiếp tục; thử lại không nhân đôi attempt/thu phí logic.
4. Chỉ bật scoring sau spike: tập thu từ và câu có nhiều mức đọc, nhiều người/thiết bị, âm nhiễu/không nói và ca lỗi đã biết; người duyệt đối chiếu độc lập với model. Đề xuất bắt đầu 60 bản ghi, tối thiểu 3 người; số này chưa chứng minh đại diện, cần mở rộng khi phát hiện lỗi. Chốt tiêu chí sai lệch/false rejection trước khi quyết định go/no-go; chưa có kết quả.
5. Đo delayed recall, lỗi feedback do reviewer xác nhận, tỷ lệ âm thanh không chấm được, latency và cost/attempt; baseline/target còn TBD. Không dùng số từ đã mở làm “đã thành thạo”.

## Liên kết backlog và bước tiếp

- PB-018: refine thẻ/audio/context; PB-013/014: audio + reader; PB-020: record/replay/private; PB-026: spike và đánh giá phát âm; PB-007/008/011: liên kết SRS/mastery/daily plan. Đọc [backlog chuẩn](../planning/PRODUCT_BACKLOG.md) trước thay đổi.
- Bộ từ chung/taxonomy/editorial và content pilot là ứng viên PBI mới cần kiểm trùng/refine; **chưa cấp ID hoặc tự thêm vào sprint**.
- Hướng A: chốt content schema + pilot, đồng thời spike Azure ko-KR trước quyết định mở rộng PB-026. Hướng B: ưu tiên spike + một topic speaking trước, giảm độ rộng content.
- Sau khi owner chọn hướng và scope: cập nhật canonical JSON/backlog rồi tạo/cập nhật 5 docs feature trước code. Lượt này chỉ discovery, không sửa code hoặc trạng thái kế hoạch.

## Review discovery

PASS: tham chiếu source hiện có, phân biệt baseline/proposed, nguồn chính và giới hạn 429, đề xuất nối PBI hiện có. NOT VERIFIED: thực hành đối thủ, chất lượng provider/score, nội dung/audio pilot và nghiên cứu người học. Revisit khi có kết quả spike, phản hồi người học hoặc quyết định phạm vi; không tạo automation.
