# Nixtap Microservices Platform Startup Script (PowerShell)
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "                      NIXTAP MICROSERVICES PLATFORM                       " -ForegroundColor Green
Write-Host "                  Starting All Backend Microservices & Frontend          " -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host ""

$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "Yadav@12345"
$env:JWT_SECRET  = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"

Write-Host "[1/11] Starting Eureka Service Discovery (Port 8761)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k java -jar eureka-server/target/eureka-server-0.0.1-SNAPSHOT.jar"
Start-Sleep -Seconds 10

Write-Host "[2/11] Starting API Gateway (Port 8080)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k java -jar api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar"
Start-Sleep -Seconds 5

Write-Host "[3/11] Starting Auth Service (Port 8081)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k `$env:DB_USERNAME=`"$env:DB_USERNAME`"; `$env:DB_PASSWORD=`"$env:DB_PASSWORD`"; `$env:JWT_SECRET=`"$env:JWT_SECRET`"; java -jar auth-service/target/auth-service-0.0.1-SNAPSHOT.jar"

Write-Host "[4/11] Starting Profile Service (Port 8082)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k `$env:DB_USERNAME=`"$env:DB_USERNAME`"; `$env:DB_PASSWORD=`"$env:DB_PASSWORD`"; `$env:JWT_SECRET=`"$env:JWT_SECRET`"; java -jar profile-service/target/profile-service-0.0.1-SNAPSHOT.jar"

Write-Host "[5/11] Starting Business Card Service (Port 8083)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k `$env:DB_USERNAME=`"$env:DB_USERNAME`"; `$env:DB_PASSWORD=`"$env:DB_PASSWORD`"; `$env:JWT_SECRET=`"$env:JWT_SECRET`"; java -jar business-card-service/target/business-card-service-0.0.1-SNAPSHOT.jar"

Write-Host "[6/11] Starting Portfolio Service (Port 8089)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k `$env:DB_USERNAME=`"$env:DB_USERNAME`"; `$env:DB_PASSWORD=`"$env:DB_PASSWORD`"; `$env:JWT_SECRET=`"$env:JWT_SECRET`"; java -jar portfolio-service/target/portfolio-service-0.0.1-SNAPSHOT.jar"

Write-Host "[7/11] Starting Analytics Service (Port 8086)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k `$env:DB_USERNAME=`"$env:DB_USERNAME`"; `$env:DB_PASSWORD=`"$env:DB_PASSWORD`"; `$env:JWT_SECRET=`"$env:JWT_SECRET`"; java -jar analytics-service/target/analytics-service-0.0.1-SNAPSHOT.jar"

Write-Host "[8/11] Starting Feedback Service (Port 8087)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k `$env:DB_USERNAME=`"$env:DB_USERNAME`"; `$env:DB_PASSWORD=`"$env:DB_PASSWORD`"; `$env:JWT_SECRET=`"$env:JWT_SECRET`"; java -jar feedback-service/target/feedback-service-0.0.1-SNAPSHOT.jar"

Write-Host "[9/11] Starting Meeting Service (Port 8088)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k `$env:DB_USERNAME=`"$env:DB_USERNAME`"; `$env:DB_PASSWORD=`"$env:DB_PASSWORD`"; `$env:JWT_SECRET=`"$env:JWT_SECRET`"; java -jar meeting-service/target/meeting-service-0.0.1-SNAPSHOT.jar"

Write-Host "[10/11] Starting Admin Service (Port 8093)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k `$env:DB_USERNAME=`"$env:DB_USERNAME`"; `$env:DB_PASSWORD=`"$env:DB_PASSWORD`"; `$env:JWT_SECRET=`"$env:JWT_SECRET`"; java -jar admin-service/target/admin-service-0.0.1-SNAPSHOT.jar"

Write-Host "[11/11] Starting Frontend Dev Server (Port 3000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd nixtap-frontend && npm run dev"

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "                  ALL NIXTAP SERVICES SUCCESSFULLY LAUNCHED!                " -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "  - Frontend Web UI (Local):    http://localhost:3000                        " -ForegroundColor Cyan
Write-Host "  - Frontend Web UI (Network):  http://192.168.0.107:3000                    " -ForegroundColor Cyan
Write-Host "  - Example Public Profile:     http://192.168.0.107:3000/kanhaiya           " -ForegroundColor Yellow
Write-Host "  - Example Public QR Studio:   http://192.168.0.107:3000/kanhaiya/qr        " -ForegroundColor Yellow
Write-Host "  - API Gateway Endpoint:       http://localhost:8080                        " -ForegroundColor Cyan
Write-Host "  - Eureka Service Dashboard:   http://localhost:8761                        " -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Green
