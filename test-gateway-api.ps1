# Test API Gateway Endpoints & Security

$baseUrl = "http://localhost:8080"
$testEmail = "gatewaytest_$(Get-Random)@example.com"
$testPassword = "Password123!"

Write-Host "=========================================="
Write-Host "1. Testing Registration via Gateway"
Write-Host "=========================================="
$regBody = @{
    fullName = "Gateway Security Test User"
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "[SUCCESS] Registration Response:"
    Write-Host ($regResponse | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "[FAIL] Registration Error: $($_.Exception.Message)"
}

Write-Host "`n=========================================="
Write-Host "2. Testing Login via Gateway"
Write-Host "=========================================="
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

$token = $null
$userId = $null
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "[SUCCESS] Login Response:"
    Write-Host ($loginResponse | ConvertTo-Json -Depth 5)
    
    if ($loginResponse.data) {
        $token = $loginResponse.data.accessToken
        $userId = $loginResponse.data.userId
    }
    Write-Host "Extracted JWT Token: $token"
    Write-Host "Extracted User ID: $userId"
} catch {
    Write-Host "[FAIL] Login Error: $($_.Exception.Message)"
}

Write-Host "`n=========================================="
Write-Host "3. Testing Protected Route /api/v1/profiles/user/$userId WITHOUT Token"
Write-Host "=========================================="
try {
    $unauthResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/profiles/user/$userId" -Method Get
    Write-Host "[UNEXPECTED SUCCESS] Endpoint allowed unauthenticated access!"
} catch {
    Write-Host "[EXPECTED SECURITY] Correctly blocked request without token: $($_.Exception.Message)"
}

Write-Host "`n=========================================="
Write-Host "4. Testing Protected Route /api/v1/profiles/user/$userId WITH Token"
Write-Host "=========================================="
if ($token -and $userId) {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    try {
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/profiles/user/$userId" -Method Get -Headers $headers
        Write-Host "[SUCCESS] Authenticated Profile Response:"
        Write-Host ($profileResponse | ConvertTo-Json -Depth 5)
    } catch {
        Write-Host "[RESPONSE]: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host "Response Body: $($reader.ReadToEnd())"
        }
    }
}

Write-Host "`n=========================================="
Write-Host "5. Testing Other Microservice Routes via Gateway"
Write-Host "=========================================="
$endpoints = @(
    "/api/v1/cards/user/$userId",
    "/api/v1/portfolio/user/$userId",
    "/api/v1/qr/user/$userId",
    "/api/v1/analytics/user/$userId",
    "/api/v1/feedback/user/$userId",
    "/api/v1/meetings/user/$userId"
)

foreach ($ep in $endpoints) {
    Write-Host "Testing $ep with Bearer token..."
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl$ep" -Method Get -Headers @{ "Authorization" = "Bearer $token" }
        Write-Host "  [SUCCESS $ep]:" ($res | ConvertTo-Json -Depth 2)
    } catch {
        Write-Host "  [RESPONSE $ep]: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host "  Body: $($reader.ReadToEnd())"
        }
    }
}
