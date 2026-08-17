# PowerShell script to launch all microservices in separate background processes

$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "Yadav@12345"
$env:JWT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"

# 1. Start Eureka Server if not running on 8761
$eurekaPort = Get-NetTCPConnection -LocalPort 8761 -ErrorAction SilentlyContinue
if (-not $eurekaPort) {
    Write-Host "Starting Eureka Server..."
    Start-Process java -ArgumentList "-jar", "eureka-server\target\eureka-server-0.0.1-SNAPSHOT.jar" -WindowStyle Hidden
    Start-Sleep -Seconds 5
} else {
    Write-Host "Eureka Server already running on port 8761."
}

# 2. Start API Gateway if not running on 8080
$gatewayPort = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if (-not $gatewayPort) {
    Write-Host "Starting API Gateway..."
    Start-Process java -ArgumentList "-jar", "api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar" -WindowStyle Hidden
    Start-Sleep -Seconds 3
} else {
    Write-Host "API Gateway already running on port 8080."
}

# 3. List of core microservices
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

foreach ($service in $services) {
    $jarPath = "$service\target\$service-0.0.1-SNAPSHOT.jar"
    if (Test-Path $jarPath) {
        Write-Host "Launching $service..."
        Start-Process java -ArgumentList "-jar", $jarPath -WindowStyle Hidden
        Start-Sleep -Seconds 2
    } else {
        Write-Warning "JAR file for $service not found at $jarPath"
    }
}

Write-Host "Backend service launch process complete!"
