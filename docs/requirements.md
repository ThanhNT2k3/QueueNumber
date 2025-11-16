# Requirements – Queue Management System (QMS)

## 1. Overview
Hệ thống quản lý bốc số đa chi nhánh – đa quầy dùng trong ngân hàng/bệnh viện.
Khách hàng đến bấm số, hệ thống tự phân loại và phân phối đến quầy phù hợp.
Quầy xử lý khách theo thứ tự ưu tiên và record kết quả.

---

## 2. Key Features

### 2.1 Multi-Branch Support
- Hệ thống có N chi nhánh.
- Mỗi chi nhánh có nhiều quầy (Counter).
- Mỗi quầy có chức năng riêng (tư vấn, giao dịch, nộp hồ sơ, khám bệnh, v.v.)

### 2.2 Ticket Generation (Bốc số)
- Bấm số theo:
  - Ngày
  - Loại yêu cầu (Service Type)
- Số thứ tự auto reset theo ngày.
- In số ra giấy theo template:
  - Logo chi nhánh
  - Số thứ tự
  - Loại yêu cầu
  - Thời gian bốc số
  - Quầy dự kiến (nếu có)

### 2.3 Ticket Routing (Phân quầy tự động)
- Hệ thống tự phân quầy dựa trên:
  - loại yêu cầu
  - trạng thái quầy (rảnh/bận)
  - workload hiện tại
- Nếu quầy đầy → chuyển sang quầy cùng chức năng.

### 2.4 Counter Processing (Xử lý tại quầy)
- Mỗi quầy có màn hình:
  - Ticket đang xử lý
  - Queue danh sách khách đang đợi
  - Thời gian trung bình xử lý
- Nhân viên có thể:
  - Gọi số tiếp theo
  - Bỏ qua số
  - Chuyển số sang quầy khác
  - Ghi kết quả xử lý

### 2.5 Display Screen (Màn hình hiển thị tổng)
- Tivi hiển thị:
  - Số đang gọi
  - Quầy đang gọi
  - Danh sách các số chờ
- Có hiệu ứng âm thanh “bing” như ngân hàng.

### 2.6 Admin Panel
- Quản lý chi nhánh
- Quản lý quầy
- Quản lý loại dịch vụ
- Dashboard thống kê:
  - Tổng số ticket theo ngày
  - Số đang xử lý
  - Thời gian xử lý trung bình
  - Hiệu suất quầy

---

## 3. Non-Functional Requirements
- Real-time update (SignalR bắt buộc)
- UI nhanh, tránh reload (Blazor Server hoặc Blazor WASM + SignalR)
- Mỗi quầy tối thiểu 2 màn hình:
  - UI quầy (agent)
  - màn hình gọi số (display)
- Hệ thống phải hoạt động liên tục 10 tiếng/ngày

---

## 4. Technical Constraints
- .NET 8 – Blazor Server (khuyến nghị)
- EF Core 8
- SQL Server
- SignalR
- Printer integration (ESC/POS hoặc in PDF template)

---

## 5. Acceptance Criteria
- Bấm số ≤ 1s
- Tự gán quầy đúng chức năng 100%
- Màn hình quầy auto update realtime ≤ 200ms
- Mỗi quầy xử lý ticket theo FIFO nhưng cho phép override
