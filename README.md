# Thiệp cưới Hồng Nhung & Việt Hào

Website thiệp cưới ngày 06/12/2026. Bản champagne với tranh thiên nga, chữ viết tay và hiệu ứng nhẹ; không có phần Gửi thiệp hay tạo lời mời riêng.

## Xem website

Khi GitHub Pages được bật cho repo thuộc tài khoản `Hieppham-190305`:

https://hieppham-190305.github.io/Hong_Nhung-wedding.github.io/

Có thể mở liên kết bằng Chrome, Cốc Cốc, Edge, Safari hoặc trình duyệt trên điện thoại. Việc xuất hiện trong kết quả tìm kiếm Google phụ thuộc vào quá trình lập chỉ mục của Google.

## GitHub Pages

Trong **Settings → Pages**, chọn **Deploy from a branch**, nhánh **main**, thư mục **/ (root)** và lưu. Thư mục gốc chứa `index.html` cùng `.nojekyll`, không cần cài đặt hay build.

## Chỉnh sửa

- `index.html`: tên, gia đình, lịch lễ và tiệc, địa điểm.
- `style.css`, `effects.css`, `atelier.css`: kiểu chữ, màu sắc và bố cục điện thoại.
- `app.js`: đếm ngược và tải lịch ICS.
- `effects.js`: mở thiệp, hiệu ứng cuộn và chuyển động nhẹ; hỗ trợ giảm chuyển động theo cài đặt thiết bị.
- `swan-motion.js`, `swans.css`, `swans-pair.webp`, `swan-lake.webp`: hai thiên nga bơi lại gần nhau, uốn cổ, cử động cánh và có bóng phản chiếu, mặt nước chuyển động, hiệu ứng lùi khung hình. Tự dùng cách hiển thị nhẹ hơn nếu WebGL không khả dụng. Chi tiết và prompt minh họa tại `SWANS.md`.
- `swan-garden.webp`, `swans.jpg`, `botanical.svg`: minh họa thiên nga và hoa văn. Tranh `swan-garden.webp` được tạo bằng ImageGen, không phải ảnh chụp cô dâu, chú rể hay địa điểm.

Website không thu thập thông tin khách hoặc xác nhận tham dự. Font chữ tải từ Google Fonts với font dự phòng. Đường dẫn có tham số `?guest=...` hiển thị tên khách trên thiệp mà không lưu dữ liệu vào máy chủ.

Xem thử cục bộ: `python -m http.server 4173`, sau đó mở http://localhost:4173.
