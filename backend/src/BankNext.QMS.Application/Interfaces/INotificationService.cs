namespace BankNext.QMS.Application.Interfaces;

public interface INotificationService
{
    Task NotifyTicketCreatedAsync(object ticket);
    Task NotifyTicketCalledAsync(object ticket);
    Task NotifyTicketUpdatedAsync(object ticket);
    Task NotifyCounterUpdatedAsync(object counter);
}
