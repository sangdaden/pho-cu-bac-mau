# Key art bìa: cảnh bóc lịch của keyart.py, thêm nhiều lớp chi tiết (nhà xa, cây, dây điện, mây,
# ghế nhựa, xe đạp, hoa giấy, đèn dây, mảnh giấy bay) cho ảnh bìa và trang chủ.
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'keyart_bia_goc.py'), encoding='utf-8').read()
extra = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'keyart_bia_them.py'), encoding='utf-8').read()
src = src.replace("cycles(sc, W, H, S)", extra + "\ncycles(sc, W, H, S)")
exec(compile(src, 'keyart.py', 'exec'))
