import re

# Read the file
with open('code/frontend/src/app/(frontend)/products/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Image thumbnails - change from grid to flex with fixed size
# Replace the grid div with flex
old_grid = '''<div className={`grid gap-3 justify-center ${
                images.length === 2 ? 'grid-cols-2' :
                images.length === 3 ? 'grid-cols-3' :
                images.length === 4 ? 'grid-cols-4' :
                'grid-cols-5'
              }`}>'''

new_grid = '''<div className="flex gap-3 justify-center">'''

content = content.replace(old_grid, new_grid)

# Replace aspect-square with fixed size
old_button_class = '''className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${'''
new_button_class = '''className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${'''

content = content.replace(old_button_class, new_button_class)

# Fix 2: Category display - single language
old_category = '<span>{productGroup.category?.nameZh} / {productGroup.category?.nameEn}</span>'
new_category = "<span>{language === 'zh' ? productGroup.category?.nameZh : productGroup.category?.nameEn}</span>"

content = content.replace(old_category, new_category)

# Fix 3 & 4: Specification display - bilingual
# In params tab
old_spec_params = '<div className="whitespace-pre-line">{selectedSku.specification}</div>'
new_spec_params = "<div className=\"whitespace-pre-line\">{language === 'zh' ? selectedSku.specification : selectedSku.specificationEn}</div>"

content = content.replace(old_spec_params, new_spec_params)

# In main specification section
lines = content.split('\n')
new_lines = []
in_spec_section = False
for i, line in enumerate(lines):
    if '货品规格 - 选择品名后显示' in line:
        in_spec_section = True
    if in_spec_section and '{selectedSku.specification}' in line and 'whitespace-pre-line' in line:
        line = line.replace('{selectedSku.specification}', "{language === 'zh' ? selectedSku.specification : selectedSku.specificationEn}")
        in_spec_section = False
    new_lines.append(line)

content = '\n'.join(new_lines)

# Fix 5: Optional attributes - convert to language-specific labels
old_attrs = '''  const optionalAttributes = selectedSku?.optionalAttributes && Array.isArray(selectedSku.optionalAttributes)
    ? selectedSku.optionalAttributes
    : []'''

new_attrs = '''  const optionalAttributes = selectedSku?.optionalAttributes && Array.isArray(selectedSku.optionalAttributes)
    ? selectedSku.optionalAttributes.map((attr: any) => language === 'zh' ? attr.nameZh : attr.nameEn)
    : []'''

content = content.replace(old_attrs, new_attrs)

# Write the file
with open('code/frontend/src/app/(frontend)/products/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed product detail page")
