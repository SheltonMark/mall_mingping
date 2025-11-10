$res = Invoke-WebRequest -Uri 'http://localhost:3001/api/products/groups/7f72791b-6100-4ed7-87a0-5ff76d2d36e4' -UseBasicParsing
$data = $res.Content | ConvertFrom-Json

Write-Host "=== 检查API返回的parts数据 ===`n"

$sku = $data.skus[0]
Write-Host "产品: $($sku.productCode)`n"

if ($sku.additionalAttributes) {
    foreach ($attr in $sku.additionalAttributes) {
        Write-Host "组件 $($attr.componentCode):"

        if ($attr.colorSchemes -and $attr.colorSchemes.Count -gt 0) {
            $scheme = $attr.colorSchemes[0]
            Write-Host "  配色方案: $($scheme.name)"

            if ($scheme.colors) {
                foreach ($color in $scheme.colors) {
                    Write-Host "    - part: $($color.part)"
                    Write-Host "      color: $($color.color)"
                    Write-Host "      hexColor: $($color.hexColor)"
                    Write-Host ""
                }
            }
        }
        Write-Host ""
    }
}
