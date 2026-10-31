# App Android (Capacitor)

Bọc bản web trong `prototype/` thành app, không viết lại game.

```
cd app
npm install
npm run www              # chép prototype/ sang www/ (bỏ service worker, CNAME)
npx cap add android      # lần đầu, cần Android Studio hoặc Android SDK + Java 17
npm run apk              # app/android/app/build/outputs/apk/debug/app-debug.apk
```

Không có máy cài Android SDK thì vào GitHub → Actions → "Dựng app Android (APK thử)" → Run workflow, tải file APK ở mục Artifacts về cài thử trên điện thoại (cần bật "Cài ứng dụng không rõ nguồn").

Lên Google Play cần thêm: tài khoản nhà phát triển (25 USD, một lần), khoá ký app (giữ kỹ, mất là không cập nhật được), bản `.aab` (`npm run aab` sau khi cấu hình khoá), và nội dung trang store ở `store/mo-ta.md`. Trang quyền riêng tư: https://phocu.markhocai.com/rieng-tu.html.

iOS cần máy Mac có Xcode và tài khoản Apple Developer (99 USD mỗi năm): `npm i @capacitor/ios@6.1.2 && npx cap add ios`.
