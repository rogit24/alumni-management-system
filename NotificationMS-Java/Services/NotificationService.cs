using Microsoft.EntityFrameworkCore;
using NotificationMS.Data;
using NotificationMS.DTOs;
using NotificationMS.Exceptions;
using NotificationMS.Models;

namespace NotificationMS.Services
{
    public class NotificationService : INotificationService
    {
        private readonly NotificationDbContext _context;

        public NotificationService(NotificationDbContext context)
        {
            _context = context;
        }

        public async Task<NotificationDto> CreateNotificationAsync(NotificationDto dto)
        {
            var notification = new Notification
            {
                UserId = dto.UserId!.Value,
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type!.Value,
                IsRead = dto.IsRead,
                CreatedAt = string.IsNullOrWhiteSpace(dto.CreatedAt)
                    ? DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                    : dto.CreatedAt
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return new NotificationDto
            {
                UserId = notification.UserId,
                Title = notification.Title ?? string.Empty,
                Message = notification.Message ?? string.Empty,
                Type = notification.Type,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };
        }

        public async Task<List<Notification>> GetAllNotificationsAsync()
        {
            return await _context.Notifications.ToListAsync();
        }

        public async Task<Notification> GetNotificationByIdAsync(long id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                throw new ResourceNotFoundException("Notification not found with id : " + id);
            }
            return notification;
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(long userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<Notification>> GetNotificationsByReadStatusAsync(bool isRead)
        {
            return await _context.Notifications
                .Where(n => n.IsRead == isRead)
                .ToListAsync();
        }

        public async Task<Notification> MarkAsReadAsync(long id)
        {
            var notification = await GetNotificationByIdAsync(id);
            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return notification;
        }

        public async Task DeleteNotificationAsync(long id)
        {
            var notification = await GetNotificationByIdAsync(id);
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUserNotificationsAsync(long userId)
        {
            var userNotifs = await _context.Notifications.Where(n => n.UserId == userId).ToListAsync();
            if (userNotifs.Any())
            {
                _context.Notifications.RemoveRange(userNotifs);
                await _context.SaveChangesAsync();
            }
        }
    }
}
