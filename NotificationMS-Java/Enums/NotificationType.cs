using System.Text.Json.Serialization;

namespace NotificationMS.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum NotificationType
    {
        JOB,
        REFERRAL,
        MESSAGE,
        SYSTEM
    }
}
