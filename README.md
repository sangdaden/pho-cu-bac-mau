# Phố Cũ Bạc Màu

Game giải đố đi ngang: Tò, con tò he bột gạo, bóc lớp xám (những tờ lịch đã bóc rồi bị quên) khỏi một con phố Việt để trả lại màu.

## Bản chơi thử

- `prototype/man-1/` — Màn 1 "Mái hiên", chơi trên trình duyệt (Three.js). Mở `index.html`.
  - ← → đi, ↑ hoặc Space nhảy, E nắm mép sáng rồi đi lùi để kéo (E lần nữa để buông), H gợi ý, R về chỗ an toàn. Trên điện thoại có nút bấm.
  - Mở đầu: phố còn màu, lịch cũ bay tới phủ xám (Space để bỏ qua). Có 5 đom đóm, đủ thì mở ký ức của cô Hai.
  - Ba mảng xám: bóc thử (đèn ông sao), bóc để mái hiên bung ra làm bậc, bóc trên mái để sào phơi đồ bắc cầu qua kênh.
- `prototype/nhan-vat-3d/` — Dàn 6 nhân vật toon xoay được, có lý do thiết kế từng người.

Đây là bản thử cơ chế và nhịp màn, sẽ chuyển sang Godot khi chốt.

## Công cụ

- `tools/blender/` — script Blender (bpy) dựng nhân vật và render toon: `toon.py` (vật liệu 3 tông + viền inverted hull), `lineup.py` (ảnh xếp hàng so chiều cao từ glTF của trang nhân vật).
