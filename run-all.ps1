$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "root"
$env:JWT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"

if (-not (Test-Path "service-logs")) { New-Item -ItemType Directory -Path "service-logs" }

$services = @(
    "eureka-server",
    "api-gateway",
    "auth-service",
    "profile-service",
    "business-card-service",
    "portfolio-service",
    "notification-service",
    "qr-service",
    "analytics-service",
    "feedback-service",
    "meeting-service",
    "admin-service",
    "media-service"
)

foreach ($service in $services) {
    $jar = "$service\target\$service-0.0.1-SNAPSHOT.jar"
    if (Test-Path $jar) {
        Write-Host "Launching $service..."
        $logFile = "service-logs\$service.log"
        $errFile = "service-logs\$service-err.log"
        Start-Process java -ArgumentList "-jar", $jar -RedirectStandardOutput $logFile -RedirectStandardError $errFile -WindowStyle Hidden
        Start-Sleep -Seconds 3
    }
}
Write-Host "All services started."
