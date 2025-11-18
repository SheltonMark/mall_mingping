const fs = require('fs');
const filePath = './code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Hero navigation buttons - expand single line (line 181)
const heroButtonsSingleLine = /\{\/\* Hero Left\/Right Navigation Buttons - squared style \*\/\}\s+\{heroImages\.length > 1 && \(.*?<\/>\s*\)\}/;

const heroButtonsExpanded = `
            {/* Hero Left/Right Navigation Buttons */}
            {heroImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentHeroIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1))}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-sm flex items-center justify-center hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                  aria-label="Previous"
                >
                  <ChevronLeft size={24} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setCurrentHeroIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-sm flex items-center justify-center hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                  aria-label="Next"
                >
                  <ChevronRight size={24} strokeWidth={2} />
                </button>
              </>
            )}
`;

content = content.replace(heroButtonsSingleLine, heroButtonsExpanded.trim());

// Fix 2: Linear progress indicator - expand single line (line 265)
const progressBarSingleLine = /\{\/\* Linear Progress Indicator - 线性进度条 \*\/\}\s+\{certificates\.length > 0 && \(.*?\)\}/;

const progressBarExpanded = `
                {/* Linear Progress Indicator */}
                {certificates.length > 0 && (
                  <div className="flex justify-center mt-12 px-6">
                    <div className="max-w-md w-full flex gap-1">
                      {certificates.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentCertificateIndex(index)}
                          className={\`flex-1 h-1 rounded-sm transition-all duration-300 \${
                            index === currentCertificateIndex
                              ? 'bg-primary'
                              : 'bg-neutral-300 hover:bg-neutral-400'
                          }\`}
                          aria-label={\`Go to certificate \${index + 1}\`}
                        />
                      ))}
                    </div>
                  </div>
                )}
`;

content = content.replace(progressBarSingleLine, progressBarExpanded.trim());

// Fix 3: Remove BUY NOW button above hero (lines 142-156)
content = content.replace(
  /\s*\{\/\* BUY NOW Button - Above Hero.*?<\/Link>\s*<\/div>\s*<\/div>\s*\n/s,
  '\n'
);

// Fix 4: Change hero inner button text to BUY NOW
content = content.replace(
  /\{language === 'zh' \? '探索产品' : 'Explore Products'\}/g,
  "{language === 'zh' ? '立即下单' : 'BUY NOW'}"
);

// Fix 5: Change bg-neutral-50 to bg-white
content = content.replace(/bg-neutral-50/g, 'bg-white');

// Fix 6: Add animation classes to hero text elements
content = content.replace(
  /<h1 className="text-white mb-4"/,
  '<h1 className="text-white mb-4 animate-fade-in-up"'
);

content = content.replace(
  /<p className="text-white\/90 text-base md:text-lg font-normal/,
  '<p className="text-white/90 text-base md:text-lg animate-fade-in-up animation-delay-200 font-normal'
);

content = content.replace(
  /<p className="text-white\/70 text-sm mb-8">/,
  '<p className="text-white/70 text-sm mb-8 animate-fade-in-up animation-delay-400">'
);

content = content.replace(
  /\{\/\* Explore Products Button - Inside Hero \*\/\}/,
  '{/* BUY NOW Button - Inside Hero */}'
);

content = content.replace(
  /className="group relative inline-flex items-center justify-center px-8 py-2\.5 sm:px-10 sm:py-3 bg-primary text-neutral-900 font-semibold/,
  'className="group relative inline-flex items-center justify-center px-8 py-2.5 sm:px-10 sm:py-3 bg-primary text-neutral-900 animate-fade-in-up animation-delay-600 font-semibold'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ All fixes applied successfully');
