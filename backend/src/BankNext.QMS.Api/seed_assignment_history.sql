-- Seed Counter Assignment History with dummy data

-- Scenario 1: Counter 1 - Initial assignment to Teller User (3 days ago)
INSERT INTO CounterAssignmentHistories (Id, CounterId, CounterName, UserId, UserName, UserEmail, PreviousUserId, PreviousUserName, Action, BranchId, PerformedByUserId, PerformedByUserName, Timestamp, Reason, IpAddress)
VALUES (
    lower(hex(randomblob(16))),
    '5C86D8A2-B5D3-4C98-AD8D-192284C0F73D',
    'Counter 1',
    '7B8BA721-C266-4B80-8A62-B4857E9F8AA9',
    'Teller User',
    'teller@sc.com',
    NULL,
    NULL,
    'ASSIGNED',
    'B01',
    '4F60843C-2A4D-498C-891B-DB0BBB6B598C',
    'Manager User',
    datetime('now', '-3 days'),
    'Initial staff assignment for morning shift',
    '192.168.1.100'
);

-- Scenario 2: Counter 1 - Unassigned (2 days ago)
INSERT INTO CounterAssignmentHistories (Id, CounterId, CounterName, UserId, UserName, UserEmail, PreviousUserId, PreviousUserName, Action, BranchId, PerformedByUserId, PerformedByUserName, Timestamp, Reason, IpAddress)
VALUES (
    lower(hex(randomblob(16))),
    '5C86D8A2-B5D3-4C98-AD8D-192284C0F73D',
    'Counter 1',
    NULL,
    NULL,
    NULL,
    '7B8BA721-C266-4B80-8A62-B4857E9F8AA9',
    'Teller User',
    'UNASSIGNED',
    'B01',
    '4F60843C-2A4D-498C-891B-DB0BBB6B598C',
    'Manager User',
    datetime('now', '-2 days'),
    'Staff went on break',
    '192.168.1.100'
);

-- Scenario 3: Counter 1 - Reassigned to Teller User (1 day ago)
INSERT INTO CounterAssignmentHistories (Id, CounterId, CounterName, UserId, UserName, UserEmail, PreviousUserId, PreviousUserName, Action, BranchId, PerformedByUserId, PerformedByUserName, Timestamp, Reason, IpAddress)
VALUES (
    lower(hex(randomblob(16))),
    '5C86D8A2-B5D3-4C98-AD8D-192284C0F73D',
    'Counter 1',
    '7B8BA721-C266-4B80-8A62-B4857E9F8AA9',
    'Teller User',
    'teller@sc.com',
    NULL,
    NULL,
    'ASSIGNED',
    'B01',
    '4F60843C-2A4D-498C-891B-DB0BBB6B598C',
    'Manager User',
    datetime('now', '-1 day'),
    'Staff returned from break',
    '192.168.1.101'
);

-- Scenario 4: Counter 3 - Assigned to Manager User (5 hours ago)
INSERT INTO CounterAssignmentHistories (Id, CounterId, CounterName, UserId, UserName, UserEmail, PreviousUserId, PreviousUserName, Action, BranchId, PerformedByUserId, PerformedByUserName, Timestamp, Reason, IpAddress)
VALUES (
    lower(hex(randomblob(16))),
    '341CA72A-D81D-4E10-94AD-802A1D7A0A2A',
    'Counter 3',
    '4F60843C-2A4D-498C-891B-DB0BBB6B598C',
    'Manager User',
    'manager@sc.com',
    NULL,
    NULL,
    'ASSIGNED',
    'B01',
    '4F60843C-2A4D-498C-891B-DB0BBB6B598C',
    'Manager User',
    datetime('now', '-5 hours'),
    'Manager covering for absent staff',
    '192.168.1.102'
);

-- Scenario 5: VIP Counter - Assigned to Teller User (2 hours ago)
INSERT INTO CounterAssignmentHistories (Id, CounterId, CounterName, UserId, UserName, UserEmail, PreviousUserId, PreviousUserName, Action, BranchId, PerformedByUserId, PerformedByUserName, Timestamp, Reason, IpAddress)
VALUES (
    lower(hex(randomblob(16))),
    '2D0E2C09-F272-436E-BF65-11653C687342',
    'VIP Counter',
    '7B8BA721-C266-4B80-8A62-B4857E9F8AA9',
    'Teller User',
    'teller@sc.com',
    NULL,
    NULL,
    'ASSIGNED',
    'B01',
    '4F60843C-2A4D-498C-891B-DB0BBB6B598C',
    'Manager User',
    datetime('now', '-2 hours'),
    'VIP service desk opening',
    '192.168.1.103'
);

-- Scenario 6: VIP Counter - Reassigned from Teller to Manager (30 minutes ago)
INSERT INTO CounterAssignmentHistories (Id, CounterId, CounterName, UserId, UserName, UserEmail, PreviousUserId, PreviousUserName, Action, BranchId, PerformedByUserId, PerformedByUserName, Timestamp, Reason, IpAddress)
VALUES (
    lower(hex(randomblob(16))),
    '2D0E2C09-F272-436E-BF65-11653C687342',
    'VIP Counter',
    '4F60843C-2A4D-498C-891B-DB0BBB6B598C',
    'Manager User',
    'manager@sc.com',
    '7B8BA721-C266-4B80-8A62-B4857E9F8AA9',
    'Teller User',
    'REASSIGNED',
    'B01',
    '4F60843C-2A4D-498C-891B-DB0BBB6B598C',
    'Manager User',
    datetime('now', '-30 minutes'),
    'VIP customer requires manager assistance',
    '192.168.1.103'
);

-- Scenario 7: Counter 1 - Recent unassignment (5 minutes ago)
INSERT INTO CounterAssignmentHistories (Id, CounterId, CounterName, UserId, UserName, UserEmail, PreviousUserId, PreviousUserName, Action, BranchId, PerformedByUserId, PerformedByUserName, Timestamp, Reason, IpAddress)
VALUES (
    lower(hex(randomblob(16))),
    '5C86D8A2-B5D3-4C98-AD8D-192284C0F73D',
    'Counter 1',
    NULL,
    NULL,
    NULL,
    '7B8BA721-C266-4B80-8A62-B4857E9F8AA9',
    'Teller User',
    'UNASSIGNED',
    'B01',
    '4F60843C-2A4D-498C-891B-DB0BBB6B598C',
    'Manager User',
    datetime('now', '-5 minutes'),
    'End of shift',
    '192.168.1.100'
);
