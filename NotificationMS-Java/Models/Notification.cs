using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotificationMS.Models
{
    [Table("notifications")]
    public class Notification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public long Id { get; set; }

        [Column("user_id")]
        public long UserId { get; set; }

        [Column("title")]
        public string? Title { get; set; }

        [Column("message")]
        public string? Message { get; set; }

        [Column("type")]
        public NotificationMS.Enums.NotificationType Type { get; set; }

        [Column("is_read")]
        public bool IsRead { get; set; } = false;

        [Column("created_at")]
        public string? CreatedAt { get; set; }
    }
}
