using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotificationMS.Data;
using NotificationMS.Models;

namespace NotificationMS.Controllers
{
    [ApiController]
    [Route("api/v1/notifications")]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationDbContext _context;

        public NotificationController(NotificationDbContext context)
        {
            _context = context;
        }

        // Create Notification
        [HttpPost]
        public async Task<ActionResult<Notification>> CreateNotification([FromBody] Notification notification)
        {
            if (notification == null)
            {
                return BadRequest("Notification request body is null.");
            }

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(notification);
        }

        // Get All Notifications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetAllNotifications()
        {
            var list = await _context.Notifications.ToListAsync();
            return Ok(list);
        }

        // Get Notification By Id
        [HttpGet("{id}")]
        public async Task<ActionResult<Notification>> GetNotificationById(long id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound($"Notification with ID {id} not found.");
            }
            return Ok(notification);
        }

        // Get Notifications of User
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetUserNotifications(long userId)
        {
            var userNotifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .ToListAsync();
            return Ok(userNotifications);
        }

        // Get Read/Unread Notifications
        [HttpGet("status/{isRead}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotificationsByReadStatus(bool isRead)
        {
            var notifications = await _context.Notifications
                .Where(n => n.IsRead == isRead)
                .ToListAsync();
            return Ok(notifications);
        }

        // Mark Notification As Read
        [HttpPut("{id}/read")]
        public async Task<ActionResult<Notification>> MarkAsRead(long id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound($"Notification with ID {id} not found.");
            }

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(notification);
        }

        // Delete Notification
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(long id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound($"Notification with ID {id} not found.");
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
