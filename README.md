# Phố Cũ Bạc Màu

Game giải đố đi ngang: Tò, con tò he bột gạo, bóc lớp xám (những tờ lịch đã bóc rồi bị quên) khỏi một con phố Việt để trả lại màu.

## Bản chơi thử

- `prototype/man-1/` — Màn 1 "Mái hiên", chơi trên trình duyệt (Three.js). Mở `index.html`.
  - ← → đi, ↑ hoặc Space nhảy, giữ E ở mép giấy cong rồi đi lùi để bóc, R chơi lại. Trên điện thoại có nút bấm.
  - Ba mảng xám: bóc thử (đèn ông sao), bóc để mái hiên bung ra làm bậc, bóc trên mái để sào phơi đồ bắc cầu qua kênh.
- `prototype/nhan-vat-3d/` — Dàn 6 nhân vật toon xoay được, có lý do thiết kế từng người.

Đây là bản thử cơ chế và nhịp màn, sẽ chuyển sang Godot khi chốt.

## Công cụ

- `tools/blender/` — script Blender (bpy) dựng nhân vật và render toon: `toon.py` (vật liệu 3 tông + viền inverted hull), `lineup.py` (ảnh xếp hàng so chiều cao từ glTF của trang nhân vật).
