# BankNext QMS - Requirements Specification

## 1. Business Functional Requirements (Góc nhìn Nghiệp vụ)

### 1.1. Customer Kiosk (Cấp số tự động)
*   **Language Selection**: Hỗ trợ đa ngôn ngữ (Tiếng Việt, Tiếng Anh).
*   **Service Selection**: Cho phép khách hàng chọn dịch vụ (Nộp tiền, Rút tiền, Tư vấn, VIP, v.v.).
*   **Priority Recognition**:
    *   Nhận diện khách hàng VIP (nếu có tích hợp nhận diện khuôn mặt hoặc quẹt thẻ).
    *   Tính toán điểm ưu tiên (Priority Score) dựa trên phân khúc khách hàng (Regular, Gold, Diamond) và loại dịch vụ.
*   **Ticket Generation**:
    *   Sinh số thứ tự theo quy tắc prefix dịch vụ (e.g., A001, V001).
    *   In phiếu số (mô phỏng hoặc tích hợp máy in nhiệt).
    *   Hiển thị thông báo chào mừng và hướng dẫn.

### 1.2. Waiting Area Display (Màn hình hiển thị trung tâm)
*   **Queue Status**: Hiển thị danh sách các số đang được phục vụ (Now Serving) và các số chuẩn bị đến lượt (Next in Line).
*   **Multimedia Content**: Phát video quảng cáo, tỷ giá, tin tức ở khu vực màn hình trống.
*   **Audio Announcement**: Phát loa đọc số thứ tự và quầy phục vụ (Text-to-Speech).
*   **Visual Alert**: Hiệu ứng nhấp nháy hoặc nổi bật khi có số mới được gọi.

### 1.3. Counter Terminal (Quầy giao dịch viên)
*   **Login/Logout**: Đăng nhập hệ thống (SSO).
*   **Counter Status**: Chuyển đổi trạng thái quầy (Online/Offline/Paused).
*   **Call Next**: Gọi số tiếp theo có độ ưu tiên cao nhất trong hàng đợi (dựa trên Priority Score và thời gian chờ).
*   **Recall**: Gọi lại số (nếu khách chưa tới). Giới hạn số lần gọi lại (ví dụ: 3 lần) trước khi hủy.
*   **Transfer**: Chuyển vé sang quầy khác hoặc dịch vụ khác (giữ nguyên độ ưu tiên).
*   **Complete**: Kết thúc giao dịch, cập nhật trạng thái vé.
*   **Customer Info**: Hiển thị thông tin khách hàng (nếu có), lịch sử giao dịch, gợi ý bán chéo (AI Insights).
*   **Missed**: Đánh dấu khách vắng mặt.

### 1.4. Counter Display (Màn hình tại quầy)
*   **Current Ticket**: Hiển thị số thứ tự đang phục vụ tại quầy đó.
*   **Counter Info**: Hiển thị tên/số quầy và tên giao dịch viên.
*   **Status**: Hiển thị trạng thái quầy (Đang phục vụ, Tạm nghỉ).

### 1.5. Feedback Terminal (Đánh giá chất lượng)
*   **Rating**: Cho phép khách hàng đánh giá sao (1-5 sao) sau khi giao dịch xong.
*   **Tags**: Chọn lý do đánh giá (Nhanh, Nhiệt tình, Chờ lâu, v.v.).
*   **Auto-Trigger**: Tự động hiển thị màn hình đánh giá khi giao dịch viên bấm "Complete".

### 1.6. Manager Dashboard (Quản trị & Báo cáo)
*   **Real-time Monitoring**: Giám sát số lượng khách đang chờ, số quầy đang hoạt động, thời gian chờ trung bình.
*   **Performance Stats**: Thống kê hiệu suất nhân viên (số khách phục vụ, thời gian trung bình).
*   **AI Insights**: Phân tích xu hướng, dự báo cao điểm, gợi ý phân bổ nhân sự (sử dụng Gemini).
*   **Reports**: Xuất báo cáo lịch sử giao dịch, đánh giá khách hàng.

---

## 2. Technical Requirements (Góc nhìn Kỹ thuật)

### 2.1. Backend API (.NET 6)
*   **Framework**: ASP.NET Core 6.0 Web API.
*   **Architecture**: Clean Architecture hoặc Layered Architecture (Controller, Service, Repository).
*   **Database**: SQL Server hoặc PostgreSQL (lưu trữ Ticket, Counter, Customer, Logs).
*   **Authentication & Authorization**:
    *   **SSO SAML2**: Tích hợp với Identity Provider (IdP) của ngân hàng (ADFS, Azure AD, Keycloak, etc.) để đăng nhập nhân viên.
    *   **JWT**: Sử dụng JWT cho session management sau khi SSO thành công.
    *   **Role-based Access Control (RBAC)**: Phân quyền (Admin, Teller, Kiosk Device).
*   **Real-time Communication**:
    *   **SignalR**: Sử dụng SignalR Core để đẩy dữ liệu realtime xuống Frontend (khi có vé mới, gọi số, cập nhật trạng thái).
    *   **Hubs**: `QMSHub` xử lý các sự kiện `TicketCreated`, `TicketCalled`, `CounterStatusChanged`.

### 2.2. Frontend (React 19 + TypeScript)
*   **Framework**: React 19, Vite.
*   **State Management**: React Context API hoặc Redux Toolkit (đồng bộ với Server state qua SignalR).
*   **Styling**: Tailwind CSS.
*   **Integration**:
    *   Gọi REST API cho các tác vụ CRUD (Lấy lịch sử, báo cáo).
    *   Lắng nghe WebSocket (SignalR) cho các tác vụ Realtime (Hiển thị số, Gọi số).

### 2.3. AI Integration
*   **Google Gemini API**:
    *   Backend proxy hoặc gọi trực tiếp (tùy bảo mật) để lấy Customer Insights và Queue Analysis.

### 2.4. Security
*   **CORS**: Cấu hình CORS chặt chẽ cho domain frontend.
*   **Secure Headers**: HSTS, Content Security Policy.
*   **Data Protection**: Mã hóa dữ liệu nhạy cảm của khách hàng.

### 2.5. Deployment
*   **Docker**: Container hóa Backend và Frontend.
*   **CI/CD**: Pipeline build và deploy tự động.

---

## 3. API Endpoints Draft

### Auth
*   `POST /api/auth/login-saml`: Initiate SAML login.
*   `POST /api/auth/callback-saml`: Handle SAML response.

### Tickets
*   `POST /api/tickets`: Create new ticket (Kiosk).
*   `GET /api/tickets`: Get all tickets (with filters).
*   `POST /api/tickets/{id}/call`: Call ticket (Teller).
*   `POST /api/tickets/{id}/complete`: Complete ticket.
*   `POST /api/tickets/{id}/recall`: Recall ticket.
*   `POST /api/tickets/{id}/transfer`: Transfer ticket.
*   `POST /api/tickets/{id}/feedback`: Submit feedback.

### Counters
*   `GET /api/counters`: Get list of counters.
*   `PUT /api/counters/{id}/status`: Update counter status.

### Dashboard
*   `GET /api/dashboard/stats`: Get real-time stats.
*   `GET /api/dashboard/ai-insights`: Get AI analysis.
