$res = Invoke-WebRequest -Uri 'http://localhost:3001/api/products/groups/7f72791b-6100-4ed7-87a0-5ff76d2d36e4' -UseBasicParsing
$data = $res.Content | ConvertFrom-Json
$sku = $data.skus[0]
Write-Host "=== SKU: $($sku.productCode) ==="
Write-Host "`nadditionalAttributes:"
$sku.additionalAttributes | ConvertTo-Json -Depth 10
