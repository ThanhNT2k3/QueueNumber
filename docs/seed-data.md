# Database Seed Data for UAT

## Overview
The application automatically seeds sample data on first run (development mode only).

## Seeded Data

### Branches (3)
1. **Chi nhánh Trung tâm**
   - Address: 123 Đường ABC, Quận 1, TP.HCM
   - Phone: 028-1234-5678
   - Counters: 3 (Quầy 1, Quầy 2, Quầy 3)

2. **Chi nhánh Quận 7**
   - Address: 456 Đường XYZ, Quận 7, TP.HCM
   - Phone: 028-8765-4321
   - Counters: 2 (Quầy 1, Quầy 2)

3. **Chi nhánh Bình Thạnh**
   - Address: 789 Đường DEF, Quận Bình Thạnh, TP.HCM
   - Phone: 028-5555-1234
   - Counters: 2 (Phòng khám 1, Phòng khám 2)

### Service Types (5)
1. **Tư vấn** (TV) - 15 minutes
2. **Giao dịch** (GD) - 10 minutes
3. **Nộp hồ sơ** (NH) - 20 minutes
4. **Khám bệnh** (KB) - 30 minutes
5. **Thanh toán** (TT) - 5 minutes

### Counters (7)

**Chi nhánh Trung tâm:**
- Quầy 1: Supports TV, GD
- Quầy 2: Supports GD, TT
- Quầy 3: Supports TV, NH

**Chi nhánh Quận 7:**
- Quầy 1: Supports GD, TT
- Quầy 2: Supports TV, GD

**Chi nhánh Bình Thạnh:**
- Phòng khám 1: Supports KB
- Phòng khám 2: Supports KB

### Sample Tickets (9)
- 5 completed tickets from today
- 3 waiting tickets (assigned to counters)
- 1 serving ticket (currently being processed)

## Testing Scenarios

### 1. Kiosk Testing
- Go to `/kiosk`
- Select "Chi nhánh Trung tâm"
- Choose a service type (e.g., "Tư vấn")
- Ticket will be auto-assigned to an available counter

### 2. Counter Testing
- Go to `/counter/1` (Quầy 1 at Chi nhánh Trung tâm)
- You'll see:
  - 1 serving ticket (TV009)
  - 3 waiting tickets (GD006, GD007, GD008)
- Test actions:
  - Call next ticket
  - Complete current ticket
  - Skip ticket

### 3. Display Screen Testing
- Go to `/display`
- Select "Chi nhánh Trung tâm"
- You'll see:
  - Currently calling: TV009 at Quầy 1
  - Waiting queue: GD006, GD007, GD008

### 4. Admin Panel Testing
- Go to `/admin`
- View dashboard statistics
- Manage branches, counters, service types
- All CRUD operations available

## Reset Database

To reset and re-seed the database:
1. Delete the database file: `src/Server/QueueManagementSystem.db`
2. Restart the application
3. The seeder will run automatically

## Notes
- Seed data is only created if the database is empty
- If you want to re-seed, delete the database file first
- All counters are initially set to "Available" (not busy)
- Sample tickets are created for "Chi nhánh Trung tâm" only

