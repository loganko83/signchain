$body = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body $body
$response | ConvertTo-Json
