@echo off
TITLE Nixtap Microservices Platform Single Launcher
COLOR 0A

echo =========================================================================
echo                       NIXTAP MICROSERVICES PLATFORM                       
echo                   Starting All Backend Microservices & Frontend          
echo =========================================================================
echo.

:: Set Database Credentials & JWT Secret
set DB_USERNAME=root
set DB_PASSWORD=Yadav@12345
set JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

echo [1/11] Starting Eureka Service Discovery (Port 8761)...
start "1. Eureka Server (8761)" cmd /k "java -jar eureka-server/target/eureka-server-0.0.1-SNAPSHOT.jar"
timeout /t 10 /nobreak >nul

echo [2/11] Starting API Gateway (Port 8080)...
start "2. API Gateway (8080)" cmd /k "java -jar api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar"
timeout /t 5 /nobreak >nul

echo [3/11] Starting Auth Service (Port 8081)...
start "3. Auth Service (8081)" cmd /k "set DB_USERNAME=%DB_USERNAME%&& set DB_PASSWORD=%DB_PASSWORD%&& set JWT_SECRET=%JWT_SECRET%&& java -jar auth-service/target/auth-service-0.0.1-SNAPSHOT.jar"

echo [4/11] Starting Profile Service (Port 8082)...
start "4. Profile Service (8082)" cmd /k "set DB_USERNAME=%DB_USERNAME%&& set DB_PASSWORD=%DB_PASSWORD%&& set JWT_SECRET=%JWT_SECRET%&& java -jar profile-service/target/profile-service-0.0.1-SNAPSHOT.jar"

echo [5/11] Starting Business Card Service (Port 8083)...
start "5. Business Card Service (8083)" cmd /k "set DB_USERNAME=%DB_USERNAME%&& set DB_PASSWORD=%DB_PASSWORD%&& set JWT_SECRET=%JWT_SECRET%&& java -jar business-card-service/target/business-card-service-0.0.1-SNAPSHOT.jar"

echo [6/11] Starting Portfolio Service (Port 8089)...
start "6. Portfolio Service (8089)" cmd /k "set DB_USERNAME=%DB_USERNAME%&& set DB_PASSWORD=%DB_PASSWORD%&& set JWT_SECRET=%JWT_SECRET%&& java -jar portfolio-service/target/portfolio-service-0.0.1-SNAPSHOT.jar"

echo [7/11] Starting Analytics Service (Port 8086)...
start "7. Analytics Service (8086)" cmd /k "set DB_USERNAME=%DB_USERNAME%&& set DB_PASSWORD=%DB_PASSWORD%&& set JWT_SECRET=%JWT_SECRET%&& java -jar analytics-service/target/analytics-service-0.0.1-SNAPSHOT.jar"

echo [8/11] Starting Feedback Service (Port 8087)...
start "8. Feedback Service (8087)" cmd /k "set DB_USERNAME=%DB_USERNAME%&& set DB_PASSWORD=%DB_PASSWORD%&& set JWT_SECRET=%JWT_SECRET%&& java -jar feedback-service/target/feedback-service-0.0.1-SNAPSHOT.jar"

echo [9/11] Starting Meeting Service (Port 8088)...
start "9. Meeting Service (8088)" cmd /k "set DB_USERNAME=%DB_USERNAME%&& set DB_PASSWORD=%DB_PASSWORD%&& set JWT_SECRET=%JWT_SECRET%&& java -jar meeting-service/target/meeting-service-0.0.1-SNAPSHOT.jar"

echo [10/11] Starting Admin Service (Port 8093)...
start "10. Admin Service (8093)" cmd /k "set DB_USERNAME=%DB_USERNAME%&& set DB_PASSWORD=%DB_PASSWORD%&& set JWT_SECRET=%JWT_SECRET%&& java -jar admin-service/target/admin-service-0.0.1-SNAPSHOT.jar"

echo [11/11] Starting Nixtap Frontend Dev Server (Port 3000)...
start "11. Frontend Dev Server (3000)" cmd /k "cd nixtap-frontend && npm run dev"

echo.
echo =========================================================================
echo                  ALL 11 SERVICES LAUNCHED SUCCESSFULLY!                   
echo =========================================================================
echo  - Frontend Web UI (Local):    http://localhost:3000                        
echo  - Frontend Web UI (Network):  http://192.168.0.107:3000                    
echo  - Example Public Profile:     http://192.168.0.107:3000/kanhaiya           
echo  - Example Public QR Studio:   http://192.168.0.107:3000/kanhaiya/qr        
echo  - API Gateway Endpoint:       http://localhost:8080                        
echo  - Eureka Service Dashboard:   http://localhost:8761                        
echo =========================================================================
pause
