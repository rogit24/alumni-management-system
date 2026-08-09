using Microsoft.EntityFrameworkCore;
using NotificationMS.Models;
using NotificationMS.Enums;

namespace NotificationMS.Data
{
    public class NotificationDbContext : DbContext
    {
        public NotificationDbContext(DbContextOptions<NotificationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Notification> Notifications { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.ToTable("notifications");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Type)
                      .HasConversion<string>()
                      .HasColumnName("type");
            });
        }
    }
}
