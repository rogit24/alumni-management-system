# PowerShell script to start all Spring Boot microservices locally and keep alive

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Starting Alumni Connect Backend Microservices" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Ensure logs directory exists
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

# Define services in order of launch dependency with correct jar names and safe delays
$services = @(
    @{ Name = "ServiceRegistry"; Jar = "ServiceRegistry\target\ServiceRegistry-1.0.0.jar"; Delay = 22 },
    @{ Name = "ApiGateway";      Jar = "ApiGateway\target\ApiGateway-1.0.0.jar";      Delay = 5 },
    @{ Name = "UserService";     Jar = "UserService\target\UserService-1.0.0.jar";     Delay = 5 },
    @{ Name = "ProfileMS";       Jar = "ProfileMS\target\profile-ms-1.0.0.jar";       Delay = 5 },
    @{ Name = "JobMS";           Jar = "JobMS\target\job-ms-1.0.0.jar";           Delay = 5 },
    @{ Name = "ApplicationMS";   Jar = "ApplicationMS\target\application-ms-1.0.0.jar";   Delay = 5 },
    @{ Name = "ReferralMS";      Jar = "ReferralMS\target\ReferralMS-1.0.0.jar";      Delay = 5 },
    @{ Name = "MessageMS";       Jar = "MessageMS\target\message-ms-1.0.0.jar";       Delay = 5 },
    @{ Name = "NotificationMS";  Jar = "NotificationMS\target\NotificationMS-1.0.0.jar";  Delay = 5 }
)

foreach ($service in $services) {
    $name = $service.Name
    $jar = $service.Jar
    $delay = $service.Delay

    Write-Host "Launching $name ($jar)..." -ForegroundColor Yellow

    # Start the process in the background and redirect output to logs folder
    Start-Process java -ArgumentList "-jar $jar" -RedirectStandardOutput "logs\$name-stdout.log" -RedirectStandardError "logs\$name-stderr.log" -NoNewWindow

    # Optional delay to allow Registry/Gateway/Services to start
    Write-Host "Waiting $delay seconds..." -ForegroundColor DarkGray
    Start-Sleep -Seconds $delay
}

Write-Host "=============================================" -ForegroundColor Green
Write-Host "All services started successfully in the background!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "Keep-Alive active. Do NOT terminate this task, or the backend services will close." -ForegroundColor Cyan
while ($true) {
    Start-Sleep -Seconds 10
}
