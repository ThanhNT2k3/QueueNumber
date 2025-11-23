# Counter Assignment Audit History Feature

## Overview
Đã triển khai hệ thống **Audit History** để tracking toàn bộ lịch sử assign/unassign counter cho staff theo thời gian. Tính năng này giúp Manager và Admin có thể:
- Xem lịch sử ai đã được assign vào counter nào
- Tracking khi nào user đổi counter
- Biết ai đã thực hiện thay đổi assignment
- Query history theo nhiều tiêu chí khác nhau

## Backend Changes

### 1. New Entity: `CounterAssignmentHistory`
**File:** `backend/src/BankNext.QMS.Core/Entities/CounterAssignmentHistory.cs`

Entity này lưu trữ mọi thay đổi về counter assignment với các thông tin:
- `CounterId`, `CounterName`: Counter được assign
- `UserId`, `UserName`, `UserEmail`: User được assign (null nếu unassign)
- `PreviousUserId`, `PreviousUserName`: User trước đó (cho trường hợp reassign)
- `Action`: Loại hành động - "ASSIGNED", "UNASSIGNED", "REASSIGNED"
- `BranchId`: Branch nơi xảy ra thay đổi
- `PerformedByUserId`, `PerformedByUserName`: Người thực hiện thay đổi (Manager/Admin)
- `Timestamp`: Thời điểm thay đổi
- `Reason`: Lý do thay đổi (optional)
- `IpAddress`: IP address của người thực hiện

### 2. Database Updates
**File:** `backend/src/BankNext.QMS.Infrastructure/Data/QmsDbContext.cs`

Thêm DbSet mới:
```csharp
public DbSet<CounterAssignmentHistory> CounterAssignmentHistories { get; set; }
```

### 3. Repository Layer
**Files:**
- `backend/src/BankNext.QMS.Application/Interfaces/ICounterAssignmentHistoryRepository.cs`
- `backend/src/BankNext.QMS.Infrastructure/Repositories/CounterAssignmentHistoryRepository.cs`

Repository cung cấp các phương thức query:
- `GetByCounterIdAsync(counterId)`: Lấy history của 1 counter
- `GetByUserIdAsync(userId)`: Lấy history của 1 user
- `GetByBranchIdAsync(branchId)`: Lấy history của 1 branch
- `GetAllAsync(fromDate, toDate)`: Lấy tất cả với filter theo ngày

### 4. Controller Updates

#### CountersController
**File:** `backend/src/BankNext.QMS.Api/Controllers/CountersController.cs`

Cập nhật endpoint `PUT /api/counters/{id}/assign-staff`:
- Lưu thông tin previous assignment trước khi thay đổi
- Tự động log audit entry sau mỗi lần assign/unassign
- Xác định action type (ASSIGNED/UNASSIGNED/REASSIGNED)
- Lưu thông tin người thực hiện và lý do

Request body mới:
```json
{
  "userId": "guid-or-null",
  "performedByUserId": "guid",
  "performedByUserName": "Manager Name",
  "reason": "Staff assignment"
}
```

#### New Controller: CounterAssignmentHistoryController
**File:** `backend/src/BankNext.QMS.Api/Controllers/CounterAssignmentHistoryController.cs`

API endpoints mới:
- `GET /api/counterassignmenthistory?fromDate=...&toDate=...`: Lấy tất cả history
- `GET /api/counterassignmenthistory/counter/{counterId}`: History của counter
- `GET /api/counterassignmenthistory/user/{userId}`: History của user
- `GET /api/counterassignmenthistory/branch/{branchId}`: History của branch

### 5. User Entity Update
**File:** `backend/src/BankNext.QMS.Core/Entities/User.cs`

Thêm property `Email` để lưu trong audit log.

## Frontend Changes

### Counter Management UI
**File:** `src/features/manager/CounterManagement.tsx`

#### New Features:

1. **"View Assignment History" Button**
   - Nút mới ở góc trên bên phải màn hình Counter Management
   - Click để mở modal xem lịch sử

2. **Audit History Modal**
   - Modal full-screen hiển thị toàn bộ lịch sử assignment
   - **Filter Panel** với 4 tiêu chí:
     - Counter: Chọn counter cụ thể
     - Staff: Chọn staff cụ thể
     - From Date: Từ ngày
     - To Date: Đến ngày
   - Button "Apply Filters" để query

3. **History Timeline Display**
   - Hiển thị dạng cards theo thời gian (mới nhất trước)
   - Mỗi entry hiển thị:
     - Counter name
     - Timestamp (format Việt Nam)
     - Action badge (màu khác nhau cho ASSIGNED/UNASSIGNED/REASSIGNED)
     - Previous Staff (nếu có)
     - New Staff (nếu có)
     - Performed By (ai thực hiện)
     - Reason (lý do)

4. **Enhanced Assignment Request**
   - Khi assign/unassign staff, frontend tự động gửi thêm:
     - `performedByUserId`: ID của manager đang đăng nhập
     - `performedByUserName`: Tên của manager
     - `reason`: Lý do mặc định

## Usage Example

### Scenario 1: Manager assign staff vào counter
1. Manager vào Counter Management
2. Chọn staff từ dropdown
3. Hệ thống tự động:
   - Cập nhật counter assignment
   - Ghi log: "ASSIGNED - Teller User to VIP Counter by Manager User"

### Scenario 2: Manager reassign counter
1. Counter đã có Teller A
2. Manager assign Teller B vào counter đó
3. Hệ thống ghi log: "REASSIGNED - from Teller A to Teller B"

### Scenario 3: Xem lịch sử
1. Click "View Assignment History"
2. Filter theo counter hoặc staff
3. Xem timeline đầy đủ các thay đổi

## Benefits

✅ **Compliance & Audit**: Đáp ứng yêu cầu audit trail cho ngân hàng
✅ **Transparency**: Minh bạch mọi thay đổi về phân công
✅ **Accountability**: Biết ai đã thực hiện thay đổi nào
✅ **Troubleshooting**: Dễ dàng tra cứu khi có vấn đề
✅ **Analytics**: Có thể phân tích pattern assign counter theo thời gian

## Technical Notes

- Audit log được tạo **tự động** mỗi khi có assignment change
- Không thể xóa audit log (immutable)
- Query performance tốt nhờ index theo counterId, userId, branchId, timestamp
- Frontend cache history trong modal, chỉ refetch khi apply filter

## Future Enhancements

Có thể mở rộng thêm:
- Export audit log ra Excel/PDF
- Email notification khi có assignment change
- Dashboard analytics về counter utilization
- Retention policy cho audit data (archive sau X tháng)
