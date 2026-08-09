using System.ComponentModel.DataAnnotations;
using NotificationMS.Enums;

namespace NotificationMS.DTOs
{
    public class NotificationDto
    {
        [Required(ErrorMessage = "User Id is required")]
        public long? UserId { get; set; }

        [Required(ErrorMessage = "Title is required")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Message is required")]
        public string Message { get; set; } = string.Empty;

        [Required(ErrorMessage = "Notification Type is required")]
        public NotificationType? Type { get; set; }

        public bool IsRead { get; set; } = false;

        public string? CreatedAt { get; set; }
    }
}
