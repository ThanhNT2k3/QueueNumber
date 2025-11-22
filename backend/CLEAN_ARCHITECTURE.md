# Clean Architecture Implementation - BankNext QMS Backend

## Tổng quan kiến trúc

Dự án đã được refactor theo mô hình **Clean Architecture** với 4 layers chính:

```
┌─────────────────────────────────────────┐
│         BankNext.QMS.Api                │  ← Presentation Layer
│  (Controllers, SignalR Hubs, Services)  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│     BankNext.QMS.Application            │  ← Application Layer
│   (Services, DTOs, Interfaces)          │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    BankNext.QMS.Infrastructure          │  ← Infrastructure Layer
│   (Repositories, DbContext, Data)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        BankNext.QMS.Core                │  ← Domain Layer
│      (Entities, Enums, Models)          │
└─────────────────────────────────────────┘
```

## Chi tiết các Layer

### 1. **Core Layer** (Domain)
- **Mục đích**: Chứa business logic thuần túy, không phụ thuộc vào bất kỳ layer nào
- **Nội dung**:
  - `Entities/`: Ticket, Counter, User
  - `Enums/`: ServiceType, TicketStatus, CustomerSegment, CounterStatus
- **Dependency**: Không có (độc lập hoàn toàn)

### 2. **Application Layer**
- **Mục đích**: Chứa business logic của ứng dụng, use cases
- **Nội dung**:
  - `Services/`: TicketService (business logic)
  - `DTOs/`: CreateTicketRequest, TicketDto, CallTicketRequest
  - `Interfaces/`: IRepository, ITicketRepository, ICounterRepository, INotificationService
- **Dependency**: Core Layer
- **Đặc điểm**: 
  - Định nghĩa interfaces cho repositories
  - Không biết về database hay SignalR cụ thể
  - Chứa toàn bộ business rules

### 3. **Infrastructure Layer**
- **Mục đích**: Implement các interfaces từ Application, xử lý data access
- **Nội dung**:
  - `Repositories/`: TicketRepository, CounterRepository (implement IRepository)
  - `Data/`: QmsDbContext, DbSeeder
- **Dependency**: Core Layer, Application Layer
- **Đặc điểm**:
  - Implement repository pattern
  - Xử lý Entity Framework Core
  - Không được reference Api layer

### 4. **Api Layer** (Presentation)
- **Mục đích**: HTTP endpoints, SignalR hubs, dependency injection
- **Nội dung**:
  - `Controllers/`: TicketsController, CountersController, AuthController
  - `Hubs/`: QmsHub (SignalR)
  - `Services/`: SignalRNotificationService (implement INotificationService)
  - `Program.cs`: DI container configuration
- **Dependency**: Application Layer, Infrastructure Layer
- **Đặc điểm**:
  - Controllers gọi Application Services
  - Không chứa business logic
  - Chỉ làm nhiệm vụ routing và mapping

## Dependency Flow

```
Api → Application → Core
  ↓
Infrastructure → Application → Core
```

**Nguyên tắc quan trọng**:
- Core không phụ thuộc vào ai
- Application chỉ phụ thuộc Core
- Infrastructure phụ thuộc Core và Application
- Api phụ thuộc tất cả nhưng chỉ gọi Application Services

## Ví dụ Flow: Tạo Ticket

1. **Client** gửi POST request → `TicketsController.CreateTicket()`
2. **Controller** nhận `CreateTicketRequest` DTO
3. **Controller** gọi `TicketService.CreateTicketAsync(request)`
4. **TicketService**:
   - Tính toán priority (business logic)
   - Gọi `ITicketRepository.GetTodayCountByServiceTypeAsync()` để lấy số lượng
   - Tạo ticket number
   - Gọi `ITicketRepository.AddAsync()` để lưu
   - Gọi `INotificationService.NotifyTicketCreatedAsync()` để broadcast
5. **Repository** (Infrastructure) thực hiện query database
6. **NotificationService** (Api) gửi SignalR message
7. **Controller** trả về `CreateTicketResponse` DTO

## Lợi ích của Clean Architecture

✅ **Testability**: Dễ dàng mock interfaces để unit test  
✅ **Maintainability**: Tách biệt concerns, dễ bảo trì  
✅ **Flexibility**: Dễ thay đổi database hoặc framework  
✅ **Independence**: Business logic không phụ thuộc vào infrastructure  
✅ **Scalability**: Dễ mở rộng với các features mới  

## Dependency Injection Setup

Trong `Program.cs`:

```csharp
// Application Services
builder.Services.AddScoped<TicketService>();

// Repositories
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ICounterRepository, CounterRepository>();

// Infrastructure Services
builder.Services.AddScoped<INotificationService, SignalRNotificationService>();
```

## Các bước tiếp theo để hoàn thiện

1. ✅ Tạo Application Layer với Services và DTOs
2. ✅ Tạo Repository Pattern trong Infrastructure
3. ✅ Refactor Controllers để sử dụng Services
4. ⏳ Implement CQRS pattern (Commands/Queries) nếu cần
5. ⏳ Thêm validation layer (FluentValidation)
6. ⏳ Implement Unit of Work pattern
7. ⏳ Thêm logging và error handling middleware
8. ⏳ Implement AutoMapper cho DTO mapping

## Build và Run

```bash
cd backend/src/BankNext.QMS.Api
dotnet build
dotnet run
```

Backend sẽ chạy tại: `http://localhost:5257`
