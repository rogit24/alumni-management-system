# PowerShell script to start ONLY essential microservices locally

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Starting ESSENTIAL Alumni Connect Backend Services" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Ensure logs directory exists
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

$services = @(
    @{ Name = "ServiceRegistry"; Jar = "ServiceRegistry\target\ServiceRegistry-1.0.0.jar"; Delay = 15 },
    @{ Name = "ApiGateway";      Jar = "ApiGateway\target\ApiGateway-1.0.0.jar";      Delay = 5 },
    @{ Name = "UserService";     Jar = "UserService\target\UserService-1.0.0.jar";     Delay = 5 },
    @{ Name = "ProfileMS";       Jar = "ProfileMS\target\profile-ms-1.0.0.jar";       Delay = 5 },
    @{ Name = "JobMS";           Jar = "JobMS\target\job-ms-1.0.0.jar";           Delay = 5 }
)

foreach ($service in $services) {
    $name = $service.Name
    $jar = $service.Jar
    $delay = $service.Delay

    Write-Host "Launching $name ($jar)..." -ForegroundColor Yellow
    Start-Process java -ArgumentList "-Xms48m -Xmx160m -Xss256k -XX:+UseSerialGC -XX:CICompilerCount=2 -XX:MaxMetaspaceSize=128m -XX:CompressedClassSpaceSize=16m -XX:ReservedCodeCacheSize=48m -XX:-UseCompressedOops -jar $jar" -RedirectStandardOutput "logs\$name-stdout.log" -RedirectStandardError "logs\$name-stderr.log" -NoNewWindow
    Write-Host "Waiting $delay seconds..." -ForegroundColor DarkGray
    Start-Sleep -Seconds $delay
}

Write-Host "Launching AiService (Python FastAPI)..." -ForegroundColor Yellow
Start-Process python -ArgumentList "main.py" -WorkingDirectory "AiService" -RedirectStandardOutput "logs\AiService-stdout.log" -RedirectStandardError "logs\AiService-stderr.log" -NoNewWindow
Write-Host "Waiting 5 seconds..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

Write-Host "=============================================" -ForegroundColor Green
Write-Host "Essential services started successfully in the background!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "Keep-Alive active." -ForegroundColor Cyan
while ($true) {
    Start-Sleep -Seconds 10
}
