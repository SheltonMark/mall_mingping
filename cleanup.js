const fs = require('fs');
let content = fs.readFileSync('./code/frontend/src/app/(frontend)/page.tsx', 'utf8');

// Remove the duplicate garbage on line 404
content = content.replace(
  /\)\}\s+className=\{`flex-1.*?\)\}/,
  ')}'
);

fs.writeFileSync('./code/frontend/src/app/(frontend)/page.tsx', content);
console.log('✅ Removed duplicate garbage code');
