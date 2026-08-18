# ERRORS.md - Error Logging & Learning History

## [2026-08-18 13:07] - Tiến trình cũ chiếm Port 3000 & Giao diện bị cắt tỉ lệ 9:16 trên màn hình ngang

- **Type**: Process / UI Scaling
- **Severity**: Medium
- **File**: `server/index.js`, `public/css/cyberpunk-stage.css`, `public/index.html`
- **Agent**: meth
- **Root Cause**: 
  1. Tiến trình Node.js cũ vẫn chạy nền chiếm port 3000, khiến server mới bị nhảy sang port 3001 mà client chưa refresh đúng.
  2. Khung màn hình stream cố định 1080x1920 khi mở trên trình duyệt laptop/desktop thông thường bị tràn khung nhìn, dẫn đến mất nửa dưới màn hình.
  3. Thiếu Polyfill `CanvasRenderingContext2D.prototype.roundRect` trên các môi trường OBS/trình duyệt cũ.
- **Fix Applied**: 
  1. Đã kill toàn bộ tiến trình cũ chiếm port và khởi động lại sạch sẽ trên Port 3000.
  2. Thêm chế độ `fitToScreen()` tự động co giãn (`transform: scale(...)`) theo tỷ lệ cửa sổ người dùng khi xem thử nghiệm trên trình duyệt thường, đồng thời giữ nguyên 1080x1920 chuẩn khi bắt nguồn OBS.
  3. Bổ sung Polyfill `roundRect` và cơ chế tự động mở khóa `AudioContext` khi có tương tác chuột/bàn phím.
- **Prevention**: Luôn giải phóng port trước khi khởi chạy và tích hợp cơ chế tự động co giãn viewport cho các canvas tỷ lệ dọc 9:16.
- **Status**: Fixed

---
