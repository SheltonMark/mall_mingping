const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'code/frontend/src/app/(frontend)/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Hero Left/Right Navigation Buttons - expand single line to multiple lines
const heroButtonsSingleLine = /\{\/\* Hero Left\/Right Navigation Buttons - squared style \*\/\}\s+\{heroImages\.length > 1 && \(\s+<>\s+<button\s+onClick=\{.*?<\/button>\s+<\/>\s+\)\}/;

const heroButtonsExpanded = `
            {/* Hero Left/Right Navigation Buttons - squared style */}
            {heroImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentHeroIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1))}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-sm flex items-center justify-center hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                  aria-label={language === 'zh' ? '上一张' : 'Previous'}
                >
                  <ChevronLeft size={24} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setCurrentHeroIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-sm flex items-center justify-center hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                  aria-label={language === 'zh' ? '下一张' : 'Next'}
                >
                  <ChevronRight size={24} strokeWidth={2} />
                </button>
              </>
            )}
`;

// Replace the single-line hero buttons with properly formatted version
content = content.replace(
  /\{\/\* Hero Left\/Right Navigation Buttons - squared style \*\/\}.*?<\/>\s*\)\}/,
  heroButtonsExpanded.trim()
);

// 2. Fix Linear Progress Indicator - expand single line to multiple lines
const progressBarExpanded = `
                {/* Linear Progress Indicator - 线性进度条 */}
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
                          aria-label={\`\${language === 'zh' ? '跳转到证书' : 'Go to certificate'} \${index + 1}\`}
                        />
                      ))}
                    </div>
                  </div>
                )}
`;

content = content.replace(
  /\{\/\* Linear Progress Indicator - 线性进度条 \*\/\}.*?\)\}/,
  progressBarExpanded.trim()
);

// 3. Remove BUY NOW button above hero (lines with pt-32 pb-8)
content = content.replace(
  /\s*\{\/\* BUY NOW Button - Above Hero.*?<\/div>\s*<\/div>\s*\n\s*\{\/\* Hero Section/s,
  '\n\n      {/* Hero Section'
);

// 4. Change hero inner button text to BUY NOW
content = content.replace(
  /\{language === 'zh' \? '探索产品' : 'Explore Products'\}/g,
  "{language === 'zh' ? '立即下单' : 'BUY NOW'}"
);

// 5. Change bg-neutral-50 to bg-white for Why Choose Us and Our Collection sections
content = content.replace(
  /<section className="py-20 md:py-32 bg-neutral-50"/g,
  '<section className="py-20 md:py-32 bg-white"'
);
content = content.replace(
  /<section className="py-32 bg-neutral-50"/g,
  '<section className="py-32 bg-white"'
);

// 6. Remove rounded-lg from hero section
content = content.replace(
  /className="relative h-\[480px\] md:h-\[580px\] lg:h-\[680px\] overflow-hidden rounded-lg"/g,
  'className="relative h-[480px] md:h-[580px] lg:h-[680px] overflow-hidden"'
);

// 7. Add animations to hero text and button
// Find the hero text content section and add animation classes
content = content.replace(
  /<h1 className="text-white mb-4"/,
  '<h1 className="text-white mb-4 animate-fade-in-up"'
);

content = content.replace(
  /<p className="text-white\/90 text-base md:text-lg/,
  '<p className="text-white/90 text-base md:text-lg animate-fade-in-up animation-delay-200'
);

content = content.replace(
  /<p className="text-white\/70 text-sm mb-8">/,
  '<p className="text-white/70 text-sm mb-8 animate-fade-in-up animation-delay-400">'
);

// Add animation to the hero button (the one inside hero)
content = content.replace(
  /\{\/\* Explore Products Button - Inside Hero \*\/\}\s+<Link/,
  '{/* BUY NOW Button - Inside Hero */}\n                  <Link'
);

content = content.replace(
  /className="group relative inline-flex items-center justify-center px-8 py-2\.5 sm:px-10 sm:py-3 bg-primary text-neutral-900/,
  'className="group relative inline-flex items-center justify-center px-8 py-2.5 sm:px-10 sm:py-3 bg-primary text-neutral-900 animate-fade-in-up animation-delay-600'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Homepage modifications completed:');
console.log('1. Fixed Hero navigation buttons formatting');
console.log('2. Fixed Certificate progress bar formatting');
console.log('3. Removed BUY NOW button above hero');
console.log('4. Changed hero button text to BUY NOW');
console.log('5. Changed Why Choose Us background to white');
console.log('6. Changed Our Collection background to white');
console.log('7. Removed Hero rounded corners');
console.log('8. Added fade-in-up animations to hero elements');
