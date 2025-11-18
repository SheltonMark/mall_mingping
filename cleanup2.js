const fs = require('fs');
let lines = fs.readFileSync('./code/frontend/src/app/(frontend)/page.tsx', 'utf8').split('\n');

// Find and fix line 404 (index 403) - remove everything after )}
for (let i = 0; i < lines.length; i++) {
  // If line starts with )} and has extra garbage after it
  if (lines[i].trim().startsWith(')}') && lines[i].includes('</div>') && lines[i].length > 100) {
    lines[i] = '                )}';
    console.log(`Fixed line ${i + 1}: removed garbage code`);
  }
}

fs.writeFileSync('./code/frontend/src/app/(frontend)/page.tsx', lines.join('\n'));
console.log('✅ Cleanup complete');
