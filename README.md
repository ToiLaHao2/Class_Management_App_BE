# Class Management App (CMA) — Backend System

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![Architecture](https://img.shields.io/badge/Architecture-Modular_Monolith-orange)

## 📖 Overview (Tổng Quan)

**Class Management App (CMA)** là project backend mà tôi làm để học hỏi dựa trên các keywork và gợi ý qua trao đổi với AI từ Antigravity IDE và tìm hiểu thông tin trên mạng.

Project backend này dđược thiết kế để quản lý các nghiệp vụ lớp học, học viên, khóa học và các tài nguyên liên quan.

Bộ mã nguồn này không chỉ phục vụ cho dự án CMA mà còn là một bộ khung tôi muốn tự làm và tìm hiểu nhằm nhận sự góp ý từ cộng đồng và đồng thời cung cấp một nền tảng chuẩn mực, an toàn và dễ tái sử dụng cho bất kỳ dự án Node.js nào đang cần sự tổ chức nghiêm ngặt nhưng không muốn gánh vác sự cồng kềnh của NestJS.

---

## 🎯 Mục Đích Phát Triển

Dự án được xây dựng dựa trên triết lý **"Điểm cân bằng hoàn hảo"**:

1. **Developer Experience (DX):** Viết code nhanh như Express thuần, nhưng có Type-Safety của TypeScript bắt lỗi tận răng.
2. **Auto-Documentation:** Không bao giờ phải viết tài liệu API bằng tay. Định nghĩa TypeScript Types = Swagger Docs.
3. **Decoupling (Giảm Lệ Thuộc):** Mọi Service, Repository, Database không gọi trực tiếp lẫn nhau mà giao tiếp thông qua Dependency Injection (DI) Container, giúp dễ dàng unit test và thay thế công nghệ (VD: Đổi từ Firebase sang PostgreSQL cực kỳ dễ dàng).
4. **Scalability:** Có sẵn kiến trúc Queue (Worker) cho các tác vụ nặng và Socket cho realtime, có thể scale độc lập từng phần.

---

## 🛠 Tech Stack (Công Nghệ Sử Dụng)

- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Web Framework:** [Express.js](https://expressjs.com/)
- **Dependency Injection (DI):** [Awilix](https://github.com/jeffijoe/awilix)
- **Auto Routing & API Docs:** [tsoa](https://tsoa-community.github.io/docs/) + [Swagger UI](https://swagger.io/tools/swagger-ui/)
- **Cơ sở dữ liệu (Database):** [PostgreSQL](https://www.postgresql.org/) (Sử dụng `pg` driver với mô hình Relational)
- **Caching & Message Queue:** [Redis](https://redis.io/) + [BullMQ](https://docs.bullmq.io/)
- **Data Validation & Config:** [Zod](https://zod.dev/)
- **Quản lý Monorepo:** NPM Workspaces (`npm -w`)

---

## 🏗 Kiến Trúc (Architecture)

Hệ thống sử dụng mô hình **Modular Monolithic** kết hợp **Monorepo** qua NPM Workspaces. Kiến trúc chia làm 2 ranh giới rõ ràng:

- `apps/`: Các điểm khởi chạy ứng dụng (Entry points).
- `libs/`: Nơi chứa toàn bộ cốt lõi hệ thống và logic nghiệp vụ.

### 🗂 Cấu Trúc Thư Mục Chi Tiết & Hướng Dẫn Tùy Chỉnh

Hệ thống được thiết kế theo tư duy **Domain-Driven Design (DDD)** kết hợp **Clean Architecture** thu gọn. Dưới đây là phân tích ý nghĩa của từng thư mục và cách bạn có thể can thiệp tùy chỉnh chúng:

#### 1. `apps/` (Lớp Giao Tiếp Mạng - Network Layer)

Đây là nơi chứa các ứng dụng/services có thể chạy độc lập. Chúng đóng vai trò là "cổng vào" tiếp nhận kết nối từ thế giới bên ngoài.

- **`api-gateway/`**: Chứa REST API server chính (Express).
  - *Tùy chỉnh:* Thêm các Global Middleware (CORS, Helmet, Rate Limit). Đổi port, đổi engine nếu cần.
- **`socket/`**: Chứa server xử lý kết nối Websocket (hiện dùng Socket.io).
  - *Tùy chỉnh:* Thêm các namespaces, định nghĩa các event realtime (Chat, Thông báo).
- **`worker/`**: Chứa tiến trình chạy ngầm xử lý hàng đợi (BullMQ).
  - *Tùy chỉnh:* Thêm các Job Processors tải nền (vd: cronjob điểm danh, gửi email hàng loạt).

#### 2. `libs/core/` (Lớp Nền Tảng Lõi - Core Infrastructure)

Nơi chứa toàn bộ công cụ nền tảng. Code ở đây **tuyệt đối không được chứa logic nghiệp vụ (business logic)**. Mọi thứ ở đây được tái sử dụng khắp nơi.

- **`config/`**: Nơi `Zod` đọc và validate biến môi trường `.env`.
  - *Tùy chỉnh:* Khi bạn khai báo thêm biến mới trong `.env`, bắt buộc phải khai báo cả luật kiểm tra vào `env.validation.ts` ở đây.
- **`container/`**: Nơi khơi tạo Dependency Injection Container (Awilix).
  - *Tùy chỉnh:* Khi viết xong một tiện ích Core mới (vd: `SmtpEmailService`), bạn phải import và đăng ký (`container.register`) vào đây để các module khác có thể lấy ra dùng.
- **`database/`**: Nơi khởi tạo kết nối DB (hiện tại là Firebase Firestore).
  - *Tùy chỉnh:* Nếu dự án muốn đổi sang MongoDB, PostgresSQL... bạn chỉ việc sửa logic khởi tạo ở thư mục này. Khái niệm Repository ở các module sẽ không bị ảnh hưởng.
- **`http/`**, **`logger/`**, **`cache/`**: Các chức năng hệ thống độc lập.

#### 3. `libs/modules/` (Lớp Nghiệp Vụ - Business Logic Layer)

Đây là không gian bạn làm việc 90% thời gian. Mỗi thư mục bên trong đại diện cho một "Miền nghiệp vụ" độc lập (Feature).

- **`users/`, `courses/`...**: Mỗi feature module sẽ tự bao đóng (encapsulate) MVC của riêng nó.
  - *Tùy chỉnh & Mở rộng:* Giả sử cần làm tính năng "Thanh toán", bạn tạo mới `libs/modules/payments/`. Cấu trúc bên trong sẽ là:
    - `payments.model.ts`: Khai báo Interface, DTO request/response.
    - `payments.service.ts`: Xử lý logic gọi cổng VNPay/Momo.
    - `payments.controller.ts`: Định nghĩa REST API `@Get`, `@Post` qua tsoa decorators.
    - `index.ts`: File entry point để "nhúng" (export IAppModule) service thanh toán vào hệ thống DI chung.

#### 4. Cấu hình cấp cao (Root Configurations)

- **`tsoa.json`**: Cấu hình công cụ sinh API.
  - *Tùy chỉnh:* Đổi tên, version của trang API Docs, hoặc định tuyến lại nơi lưu trữ thư mục `generated`.
- **`package.json`**: File quản trị dự án Monorepo.
  - *Tùy chỉnh:* Thêm scripts chạy tự động hoặc quản lý version của các thư viện xuyên suốt dự án.

---

## 🔄 Lịch Sử Cập Nhật & Migration (Chuyển Đổi Sang PostgreSQL)

Dự án ban đầu được thiết kế chạy trên Firebase Firestore nhưng đã thực hiện **chuyển đổi toàn diện sang PostgreSQL** theo kiến trúc Modular DB. Các giai đoạn đã hoàn thiện:

### ✅ Phase 1: Foundation (Nền Móng)

- Chuyển đổi Database Layer sang cấu trúc RDBMS sử dụng `pg` connection pool có tích hợp **Auto-migration** (tự động tạo bảng & seed admin khi boot).
- Tái cấu trúc module `users` sử dụng **UUID**, thêm trường dữ liệu `date_of_birth` thay vì Firebase Document ID. Tách riêng thông tin liên lạc thành bảng `contacts`.
- Giới thiệu module `categories` đóng vai trò là Global Lookup Table chứa hằng số (constants) toàn hệ thống.

### ✅ Phase 2: Role-based Profiles (Hồ Sơ Theo Vai Trò)

- Tạo riêng rẽ 3 bảng định danh độc lập: `teacher_profiles`, `student_profiles`, `parent_profiles`.
- Áp dụng logic **UPSERT** thông minh: Hệ thống tự động nhận diện `Role` từ JWT Token và xử lý bảng profile tương ứng thông qua API gộp (Unified API) `/api/profiles/me`.

### ✅ Phase 3: Core Business - Classes & Lessons (Lớp Học & Nội Dung)

- Thiết lập Core module gánh vác 4 bảng cốt lõi: `classes`, `teachers_classes` (danh sách giáo viên đứng lớp), `classes_students` (danh sách học sinh ghi danh), và `lessons` (bài giảng).
- Áp dụng tiền tệ `DECIMAL(12,2)` cho học phí (price) và ràng buộc Foreign Keys nghiêm ngặt, tự động nhận dạng owner của lớp học từ thẻ ID của JWT.

### ✅ Phase 4: Assignments & Submissions (Bài Tập & Chấm Điểm)

- Xây dựng hệ thống Bài tập (Assignments) tích hợp Ngân hàng câu hỏi (Questions).
- Hỗ trợ học sinh nộp bài (Student Submissions) và lưu trữ lịch sử chấm điểm.

### ✅ Phase 5: Schedules & Attendance (Lịch Học & Điểm Danh)

- Quản lý lịch học chi tiết (Schedules) cho từng lớp.
- Hệ thống Nhật ký bài giảng (Lesson Logs) hỗ trợ điểm danh và theo dõi tiến độ dạy học.

### ✅ Phase 6: Polymorphic Attachments (Hệ Thống Tệp Đính Kèm)

- Tách rời module `attachments` độc lập, sử dụng mô hình **Polymorphic Storage** (một file có thể gắn vào Lịch học, Bài tập, hoặc Tin nhắn).
- Tích hợp **Cloudinary** để lưu trữ đám mây, xử lý tệp tin qua luồng Stream an toàn, không lưu tạm trên server.

### ✅ Phase 7: Real-time Notifications (Thông Báo Thời Gian Thực)

- Xây dựng hệ thống thông báo đa kênh: Lưu trữ bền vững (Persistence) và Phát sóng tức thời (Real-time).
- Tích hợp **Socket.IO** với **Redis Emitter**, hỗ trợ Room-based messaging (gửi tin cho đúng người qua Private Room).

### ⏳ Upcoming Phases (Sắp Tới)

- **Phase 8:** `chat` (Hệ thống trò chuyện trực tiếp giữa Giáo viên và Phụ huynh/Học sinh).
- **Phase 9:** `payments` (Quản lý học phí & tích hợp cổng thanh toán trực tuyến).
- **Phase 10:** `analytics` (Báo cáo thống kê hiệu quả học tập và doanh thu).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu hệ thống:

- Node.js >= 18.x
- NPM >= 9.x
- Redis Server (Local hoặc Upstash)
- Cloudinary Account (Dùng cho Phase 6)

### Bước 1: Clone và Cài đặt

*Lưu ý: Bắt buộc chạy lệnh ở thư mục ROOT (`CMA-Backend`), NPM sẽ tự động cài và liên kết (hoist) các thư viện cho tất cả các workspaces con.*

```bash
git clone <repository-url>
cd CMA-Backend
npm install
```

### Bước 2: Thiết lập biến môi trường

Copy file `.env.example` thành `.env` và điền các thông tin cần thiết:

```bash
cp .env.example .env
```

Các thông tin quan trọng nhất cần điền:

- **PostgreSQL Database:** `PG_USER`, `PG_PASSWORD`, `PG_HOST`, `PG_PORT`, `PG_DATABASE`.
- **Cloudinary:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **Hệ thống chung:** `REDIS_HOST`, `REDIS_PASSWORD`, `JWT_SECRET`.

### Bước 3: Khởi động hệ thống (Dev Mode)

Lệnh này sẽ tự động chạy quy trình:

1. `tsoa:gen` sinh ra các file routing và swagger.json.
2. Chạy song song 3 app: Gateway (Port 3000), Worker, Socket (Port 3002).

```bash
npm run dev
```

---

## 💼 Use Cases Chi Tiết (Sử Dụng Hệ Thống)

Dưới đây là các kịch bản thực tế mà hệ thống Backend hiện tại đã đáp ứng hoàn hảo:

### 1. Quản Lý Học Thuật & Đào Tạo

- **Kịch bản:** Giáo viên tạo một lớp học Toán mới.
- **Tính năng Backend:**
  - Tạo thực thể `classes`, phân quyền `owner` cho giáo viên.
  - Upload tài liệu PDF bài giảng lên Cloudinary gắn vào lớp học (`attachments`).
  - Lên lịch học định kỳ (`schedules`) cho cả tháng.
  - Hệ thống tự động báo cho học sinh khi có bài tập mới (`notifications` + `socket.io`).

### 2. Tương Tác & Theo Dõi Phụ Huynh

- **Kịch bản:** Phụ huynh đăng nhập để xem tình hình đi học của con.
- **Tính năng Backend:**
  - API gộp `/profiles/me` tự động lấy thông tin từ bảng `parent_profiles` và liên kết với dữ liệu học sinh.
  - Xem `lesson_logs` để biết con có đi học (attendance) và nhận xét của giáo viên.
  - Nhận thông báo thời gian thực khi con vừa được điểm danh vào lớp.

### 3. Nộp Bài & Chấm Điểm Tự Động/Thủ Công

- **Kịch bản:** Học sinh làm bài tập và gửi ảnh chụp bài làm.
- **Tính năng Backend:**
  - Sử dụng `multipart/form-data` qua Gateway để stream ảnh trực tiếp lên mây.
  - Lưu metadata vào bảng `submissions` gắn kèm UUID của bài tập.
  - Giảng viên nhận thông báo có bài nộp mới để vào chấm điểm.

### 4. Hệ Thống Thông Báo Đa Nền Tảng

- **Kịch bản:** Admin gửi thông báo bảo trì toàn hệ thống.
- **Tính năng Backend:**
  - Sử dụng `EventPublisher` đẩy sự kiện vào Redis.
  - Toàn bộ Client (Web/App) đang kết nối Socket sẽ nhận pop-up ngay lập tức.
  - Người dùng offline khi login lại sẽ thấy thông báo trong danh sách "Chưa đọc".

---

## ⚠️ Những Lưu Ý Quan Trọng (Must Read)

1. **Thay đổi API / Controller:** Khi thêm Route mới, bắt buộc chạy `npm run tsoa:gen` để cập nhật Swagger và Route Map.
2. **Kiểm thử bền bỉ:** Toàn bộ các file kiểm thử E2E (End-to-End) theo từng giai đoạn được lưu trữ tại thư mục `/tests/integration`.
3. **Mở rộng Real-time:** Khi mở rộng tính năng Chat, chỉ cần kế thừa logic `EventPublisher` đã xây dựng ở Phase
