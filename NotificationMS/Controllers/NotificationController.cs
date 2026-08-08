using Microsoft.AspNetCore.Mvc;
using NotificationMS.DTOs;
using NotificationMS.Models;
using NotificationMS.Services;

namespace NotificationMS.Controllers
{
    [ApiController]
    [Route("api/v1/notifications")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // Create Notification
        [HttpPost]
        public async Task<ActionResult<NotificationDto>> CreateNotification([FromBody] NotificationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _notificationService.CreateNotificationAsync(dto);
            return Ok(created);
        }

        // Get All Notifications
        [HttpGet]
        public async Task<ActionResult<List<Notification>>> GetAllNotifications()
        {
            var notifications = await _notificationService.GetAllNotificationsAsync();
            return Ok(notifications);
        }

        // Get Notification By Id
        [HttpGet("{id:long}")]
        public async Task<ActionResult<Notification>> GetNotificationById(long id)
        {
            var notification = await _notificationService.GetNotificationByIdAsync(id);
            return Ok(notification);
        }

        // Get Notifications of User
        [HttpGet("user/{userId:long}")]
        public async Task<ActionResult<List<Notification>>> GetUserNotifications(long userId)
        {
            var notifications = await _notificationService.GetUserNotificationsAsync(userId);
            return Ok(notifications);
        }

        // Get Read/Unread Notifications
        [HttpGet("status/{isRead:bool}")]
        public async Task<ActionResult<List<Notification>>> GetNotificationsByReadStatus(bool isRead)
        {
            var notifications = await _notificationService.GetNotificationsByReadStatusAsync(isRead);
            return Ok(notifications);
        }

        // Mark Notification As Read
        [HttpPut("{id:long}/read")]
        public async Task<ActionResult<Notification>> MarkAsRead(long id)
        {
            var notification = await _notificationService.MarkAsReadAsync(id);
            return Ok(notification);
        }

        // Delete Notification
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeleteNotification(long id)
        {
            await _notificationService.DeleteNotificationAsync(id);
            return Ok();
        }

        // Delete All Notifications of User
        [HttpDelete("user/{userId:long}")]
        public async Task<IActionResult> DeleteUserNotifications(long userId)
        {
            await _notificationService.DeleteUserNotificationsAsync(userId);
            return Ok();
        }
    }
}
