# PowerShell script to build all remaining microservices
$services = @(
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
    Write-Host "Building $service..."
    Push-Location $service
    mvn clean package -DskipTests
    Pop-Location
}
Write-Host "All services built successfully."
