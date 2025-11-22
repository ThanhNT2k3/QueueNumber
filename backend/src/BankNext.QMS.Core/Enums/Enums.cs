namespace BankNext.QMS.Core.Enums;

public enum ServiceType
{
    DEPOSIT,
    WITHDRAWAL,
    LOAN,
    CONSULTATION,
    VIP
}

public enum TicketStatus
{
    WAITING,
    CALLED,
    SERVING,
    COMPLETED,
    MISSED,
    TRANSFERRED
}

public enum CustomerSegment
{
    REGULAR,
    GOLD,
    DIAMOND
}

public enum CounterStatus
{
    ONLINE,
    OFFLINE,
    PAUSED
}
