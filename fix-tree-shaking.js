const fs = require('fs');
let content = fs.readFileSync('./code/frontend/src/app/(frontend)/page.tsx', 'utf8');

// Replace conditional rendering with conditional styling for Hero buttons
content = content.replace(
  /\{\/\* Hero Left\/Right Navigation Buttons \*\/\}\s+\{heroImages\.length > 1 && \(\s+<>/,
  '{/* Hero Left/Right Navigation Buttons */}\n            <>'
);

content = content.replace(
  /className="absolute left-4 md:left-8 top-1\/2 -translate-y-1\/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white\/10 backdrop-blur-sm border border-white\/30 text-white rounded-sm flex items-center justify-center hover:bg-white\/20 hover:border-white\/50 transition-all duration-300"\s+aria-label="Previous"/,
  'className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-sm flex items-center justify-center hover:bg-white/20 hover:border-white/50 transition-all duration-300 ${heroImages.length <= 1 ? \'hidden\' : \'\'}`}\n                aria-label="Previous"'
);

content = content.replace(
  /className="absolute right-4 md:right-8 top-1\/2 -translate-y-1\/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white\/10 backdrop-blur-sm border border-white\/30 text-white rounded-sm flex items-center justify-center hover:bg-white\/20 hover:border-white\/50 transition-all duration-300"\s+aria-label="Next"/,
  'className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-sm flex items-center justify-center hover:bg-white/20 hover:border-white/50 transition-all duration-300 ${heroImages.length <= 1 ? \'hidden\' : \'\'}`}\n                aria-label="Next"'
);

content = content.replace(
  /<\/button>\s+<\/>\s+\)\}\s+\{\/\* Navigation Dots \*\/\}/,
  '</button>\n            </>\n\n            {/* Navigation Dots */}'
);

// Same for certificates progress bar
content = content.replace(
  /\{\/\* Linear Progress Indicator \*\/\}\s+\{certificates\.length > 0 && \(/,
  '{/* Linear Progress Indicator */}\n                <div className={certificates.length === 0 ? \'hidden\' : \'\'}>'
);

content = content.replace(
  /<\/div>\s+<\/div>\s+\)\}\s+<\/div>\s+<\/div>/,
  '</div>\n                  </div>\n                </div>\n              </div>\n            </div>'
);

fs.writeFileSync('./code/frontend/src/app/(frontend)/page.tsx', content);
console.log('✅ Changed conditional rendering to conditional styling');
