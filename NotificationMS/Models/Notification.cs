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
        [Required]
        public long UserId { get; set; }

        [Column("title")]
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Column("message")]
        [Required]
        [MaxLength(2000)]
        public string Message { get; set; } = string.Empty;

        [Column("type")]
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // Store NotificationType as string

        [Column("is_read")]
        public bool IsRead { get; set; } = false;

        private string _createdAt = string.Empty;

        [Column("created_at")]
        [MaxLength(50)]
        public string CreatedAt 
        { 
            get => string.IsNullOrEmpty(_createdAt) ? System.DateTime.Now.ToString("yyyy-MM-dd") : _createdAt;
            set => _createdAt = value;
        }
    }
}
