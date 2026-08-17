# PowerShell script to start all Nixtap Backend Microservices

$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "Yadav@12345"
$env:JWT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"

$services = @(
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

Write-Host "Starting microservices..."
foreach ($service in $services) {
    $jarPath = "$service\target\$service-0.0.1-SNAPSHOT.jar"
    if (Test-Path $jarPath) {
        Write-Host "Starting $service..."
        Start-Process java -ArgumentList "-jar", $jarPath -WindowStyle Hidden
        Start-Sleep -Seconds 2
    } else {
        Write-Warning "Jar not found for $service at $jarPath"
    }
}

Write-Host "All microservices start commands issued."
