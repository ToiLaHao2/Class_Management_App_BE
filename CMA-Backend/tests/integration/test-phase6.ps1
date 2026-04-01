$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:3000/api"
$email = "root@admin.com"
$password = "ChangeMe@123"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " CMA BACKEND - TEST PHASE 6 (ATTACHMENTS)    " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Login
Write-Host "1. Đăng nhập để lấy Token..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.accessToken
Write-Host "✅ Login thành công! Token: $($token.Substring(0, 20))..." -ForegroundColor Green

# 2. Tạo một file giả lập để chuẩn bị upload
Write-Host "`n2. Tạo file mẫu (sample_document.txt)..." -ForegroundColor Yellow
$dummyFilePath = "$PSScriptRoot\sample_document.txt"
"Đây là nội dung của file tài liệu nháp dùng để test hệ thống Upload." | Out-File -FilePath $dummyFilePath -Encoding utf8
Write-Host "✅ File nháp đã được tạo: $dummyFilePath" -ForegroundColor Green

# 3. Tạo một schedule giả (hoặc lấy đại 1 UUID)
# Để an toàn, lấy 1 UUID bất kỳ, vì Attachments module thiết kế PolyMorphic
$fakeRefId = [guid]::NewGuid().ToString()
$refType = "schedule"

# 4. Upload File đính kèm (Sử dụng curl.exe để hỗ trợ Form-Data mượt mà trên Windows)
Write-Host "`n3. Gửi request Upload Multipart/Form-Data lên Server..." -ForegroundColor Yellow
Write-Host "   Đang đẩy file lên Cloudinary, vui lòng chờ... ⏳" -ForegroundColor Magenta

# curl.exe có sẵn trên Windows 10/11
$uploadCmd = "curl.exe -s -X POST `"$baseUrl/attachments/upload`" " +
             "-H `"Authorization: Bearer $token`" " +
             "-F `"ref_type=$refType`" " +
             "-F `"ref_id=$fakeRefId`" " +
             "-F `"file=@$dummyFilePath`""

$uploadOutput = Invoke-Expression $uploadCmd
$attachment = $uploadOutput | ConvertFrom-Json

if ($attachment.id) {
    Write-Host "✅ Upload thành công!" -ForegroundColor Green
    Write-Host "   => ID: $($attachment.id)" -ForegroundColor Cyan
    Write-Host "   => Provider: $($attachment.provider)" -ForegroundColor Cyan
    Write-Host "   => Public URL: $($attachment.url)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Upload thất bại:" -ForegroundColor Red
    Write-Host $uploadOutput
    exit
}

# 5. Fetch File
Write-Host "`n4. Kiểm tra lấy danh sách Attachments theo ref_type và ref_id..." -ForegroundColor Yellow
$fetchRes = Invoke-RestMethod -Uri "$baseUrl/attachments?ref_type=$refType&ref_id=$fakeRefId" -Method Get -Headers @{ Authorization = "Bearer $token" }
if ($fetchRes.Count -gt 0) {
    Write-Host "✅ Lấy thành công $($fetchRes.Count) tệp đính kèm:" -ForegroundColor Green
    $fetchRes | Format-Table id, file_name, file_size, provider
}

# 6. Delete File
Write-Host "`n5. Xóa File khỏi Database & Cloudinary..." -ForegroundColor Yellow
$deleteRes = Invoke-RestMethod -Uri "$baseUrl/attachments/$($attachment.id)" -Method Delete -Headers @{ Authorization = "Bearer $token" }
Write-Host "✅ $($deleteRes.message)" -ForegroundColor Green

# 7. Dọn dẹp Dummy File
Remove-Item -Path $dummyFilePath -Force
Write-Host "`n🎉 HOÀN TẤT TEST PHASE 6 - HỆ THỐNG ATTACHMENTS HOẠT ĐỘNG HOÀN HẢO!" -ForegroundColor Green
