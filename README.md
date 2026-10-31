# Phố Cũ Bạc Màu

Game giải đố đi ngang: Tò, con tò he bột gạo, bóc lớp xám (những tờ lịch đã bóc rồi bị quên) khỏi một con phố Việt để trả lại màu.

## Bản chơi thử

Chơi tại https://phocu.markhocai.com. Trên điện thoại bấm "Cài lên điện thoại" ở màn hình chính để cài như app (PWA): mở toàn màn hình, nằm ngang, chơi được khi không có mạng (`prototype/sw.js`). Mỗi lần push lên `main` có sửa `prototype/`, `.github/workflows/pages.yml` đăng lại thư mục này lên GitHub Pages (tên miền trong `prototype/CNAME`).


- `prototype/man-1/` — Màn 1 "Mái hiên", chơi trên trình duyệt (Three.js). Mở `index.html`.
  - ← → đi, ↑ hoặc Space nhảy, giữ E ở mép giấy cong rồi đi lùi để bóc, R chơi lại. Trên điện thoại có nút bấm.
  - Ba mảng xám: bóc thử (đèn ông sao), bóc để mái hiên bung ra làm bậc, bóc trên mái để sào phơi đồ bắc cầu qua kênh.
- `prototype/nhan-vat-3d/` — Dàn 6 nhân vật toon xoay được, có lý do thiết kế từng người.

Đây là bản thử cơ chế và nhịp màn, sẽ chuyển sang Godot khi chốt.

## Lưu giữa màn

Game chạy theo bước cố định 1/60 giây, nên cùng một chuỗi thao tác luôn cho ra cùng một con phố. Trong lúc chơi, `chung/pho.js` ghi lại thao tác (nút nào đổi trạng thái ở bước nào, cộng các lần Dán lại và Gấp) vào `localStorage` khoá `phocu.jr`, cứ 5 giây một lần và khi rời trang. Bấm "Chơi tiếp" ở trang chính thì màn được chạy lại tới đúng bước đó sau màn đen, rồi Tò đứng đúng chỗ cũ với mọi câu đố đã giải. Nếu code màn đã đổi khiến bản chạy lại lệch chỗ, màn tự chơi lại từ đầu.

## Kiểm tra tự động

`tools/test/` có bot chơi hết từng màn (`play1.js`…`play9.js`) và hai bài thử "Chơi tiếp". GitHub Actions (`.github/workflows/kiem-tra.yml`) chạy cả ba trên mỗi PR có sửa `prototype/`.

```
cd tools/test && npm install && npx playwright install chromium
node run-all.js        # 9 màn, bot phải thắng, không lỗi trang
node resume.js         # thao tác ngẫu nhiên rồi Chơi tiếp, Tò phải về đúng chỗ
JRCHECK=1 NOSHOT=1 node play5.js ../../prototype/man-5/index.html /tmp/m5   # Chơi tiếp sau khi bot giải gần hết Màn 5
```

Sửa câu đố một màn thì sửa bot của màn đó luôn, nếu không bài kiểm tra sẽ đỏ.

## Công cụ

- `tools/blender/` — script Blender (bpy) dựng nhân vật và render toon: `toon.py` (vật liệu 3 tông + viền inverted hull), `lineup.py` (ảnh xếp hàng so chiều cao từ glTF của trang nhân vật).
