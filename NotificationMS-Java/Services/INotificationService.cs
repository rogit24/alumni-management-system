using NotificationMS.DTOs;
using NotificationMS.Models;

namespace NotificationMS.Services
{
    public interface INotificationService
    {
        Task<NotificationDto> CreateNotificationAsync(NotificationDto dto);
        Task<List<Notification>> GetAllNotificationsAsync();
        Task<Notification> GetNotificationByIdAsync(long id);
        Task<List<Notification>> GetUserNotificationsAsync(long userId);
        Task<List<Notification>> GetNotificationsByReadStatusAsync(bool isRead);
        Task<Notification> MarkAsReadAsync(long id);
        Task DeleteNotificationAsync(long id);
        Task DeleteUserNotificationsAsync(long userId);
    }
}
