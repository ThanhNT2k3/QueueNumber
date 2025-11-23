# Counter Assignment Audit Feature

## Tổng quan

Tính năng audit này cho phép theo dõi đầy đủ lịch sử chuyển quầy của teller trong hệ thống QMS. Mỗi khi teller chuyển quầy, hệ thống sẽ tự động tạo một bản ghi audit với đầy đủ thông tin.

## Các thành phần đã implement

### 1. Backend API

#### Entity: `CounterAssignmentHistory`
Lưu trữ thông tin audit với các trường:
- **CounterId, CounterName**: Quầy được assign
- **UserId, UserName, UserEmail**: User được assign (null nếu unassign)
- **PreviousUserId, PreviousUserName**: User trước đó (null nếu lần đầu assign)
- **Action**: Loại hành động (ASSIGNED, REASSIGNED, UNASSIGNED)
- **BranchId**: Chi nhánh
- **PerformedByUserId, PerformedByUserName**: Người thực hiện hành động
- **Timestamp**: Thời gian thực hiện
- **Reason**: Lý do chuyển quầy
- **IpAddress**: Địa chỉ IP

#### API Endpoints

**GET /api/counterassignmenthistory**
- Query params: `fromDate`, `toDate`
- Lấy tất cả audit records với filter theo thời gian

**GET /api/counterassignmenthistory/counter/{counterId}**
- Lấy audit history của một quầy cụ thể

**GET /api/counterassignmenthistory/user/{userId}**
- Lấy audit history của một user cụ thể

**GET /api/counterassignmenthistory/branch/{branchId}**
- Lấy audit history của một chi nhánh

**PUT /api/counters/{id}/assign-staff**
- Assign user vào counter và tự động tạo audit log
- Body:
```json
{
  "userId": "guid",
  "performedByUserId": "guid",
  "performedByUserName": "string",
  "reason": "string"
}
```

### 2. Frontend Implementation

#### AuthContext - `assignCounter` method
```typescript
const assignCounter = async (counterId: string, reason?: string): Promise<boolean>
```
- Gọi API backend để assign counter
- Tự động tạo audit log
- Cập nhật local state sau khi thành công

#### useCounterSession Hook
```typescript
const handleCounterSelect = async (counterId: string) => {
  const success = await assignCounter(counterId, 'Teller switched counter');
  if (success) {
    setSelectedCounterId(counterId);
  }
}
```
- Sử dụng `assignCounter` thay vì update local only
- Đảm bảo mọi lần chuyển quầy đều được audit

#### CounterAssignmentAuditPage
Trang quản lý audit với các tính năng:
- **Filters**: Lọc theo ngày, chi nhánh, loại action
- **Statistics**: Hiển thị tổng số records, assignments, reassignments, unassignments
- **Table view**: Hiển thị chi tiết từng audit record
- **Export-ready**: Dễ dàng mở rộng để export Excel/CSV

### 3. User Flow

#### Khi Teller chuyển quầy:

1. **User action**: Teller click vào icon refresh → chọn quầy mới từ dialog
2. **Frontend**: 
   - Gọi `handleCounterSelect(newCounterId)`
   - `assignCounter` được gọi với reason "Teller switched counter"
3. **Backend**:
   - Nhận request tại `/api/counters/{id}/assign-staff`
   - Kiểm tra user có tồn tại không
   - Kiểm tra user có cùng branch với counter không
   - Unassign user khỏi counter cũ (nếu có)
   - Assign user vào counter mới
   - Tạo audit log với action "REASSIGNED" hoặc "ASSIGNED"
   - Lưu IP address, timestamp, reason
   - Broadcast update qua SignalR
4. **Frontend**: 
   - Nhận response thành công
   - Cập nhật local state
   - UI tự động refresh

#### Xem Audit History (Admin/Manager):

1. **Navigation**: Click vào tab "AUDIT" trong navigation bar
2. **Filter**: Chọn date range, branch, action type
3. **View**: Xem danh sách audit records với đầy đủ thông tin
4. **Statistics**: Xem tổng quan số lượng assignments, reassignments, unassignments

## Cách test

### Test 1: Chuyển quầy thông thường
1. Login với teller account
2. Vào Counter Terminal
3. Click icon refresh bên cạnh tên counter
4. Chọn counter khác
5. Kiểm tra audit page → phải có record mới với action "REASSIGNED"

### Test 2: Xem audit history
1. Login với admin account
2. Click tab "AUDIT"
3. Xem danh sách audit records
4. Test filters: chọn date range, branch, action
5. Verify statistics được tính đúng

### Test 3: Kiểm tra thông tin audit
Mỗi audit record phải có:
- ✅ Timestamp chính xác
- ✅ Counter name
- ✅ User name và email
- ✅ Previous user (nếu là reassignment)
- ✅ Action type đúng (ASSIGNED/REASSIGNED/UNASSIGNED)
- ✅ Branch ID
- ✅ Performed by user
- ✅ Reason: "Teller switched counter"
- ✅ IP address

## Lợi ích

1. **Traceability**: Theo dõi được ai làm việc ở quầy nào, khi nào
2. **Accountability**: Biết được ai thực hiện việc assign/reassign
3. **Compliance**: Đáp ứng yêu cầu audit của ngân hàng
4. **Troubleshooting**: Dễ dàng debug khi có vấn đề về counter assignment
5. **Analytics**: Có thể phân tích pattern chuyển quầy, workload distribution

## Mở rộng trong tương lai

- [ ] Export audit log ra Excel/CSV
- [ ] Email notification khi có reassignment
- [ ] Dashboard analytics về counter utilization
- [ ] Retention policy cho audit data
- [ ] Advanced search với full-text search
- [ ] Audit log cho các actions khác (ticket operations, status changes, etc.)
