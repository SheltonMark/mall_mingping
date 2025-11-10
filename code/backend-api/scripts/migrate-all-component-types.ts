import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAllComponentTypes() {
  console.log('=== Migrating ALL Component Types from Product Data ===\n');

  try {
    // 1. Extract all unique component names from productSpec
    const skus = await prisma.productSku.findMany({
      select: {
        id: true,
        productCode: true,
        productName: true,
        productSpec: true,
        additionalAttributes: true,
      },
    });

    console.log(`Analyzing ${skus.length} SKUs...\n`);

    // Map: component name -> { parts: Set<string>, usedInProducts: string[], codes: Set<string> }
    const componentMap = new Map<string, {
      nameZh: string;
      parts: Set<string>;
      usedInProducts: string[];
      codes: Set<string>;
    }>();

    // 2. Extract component names and their parts
    for (const sku of skus) {
      // From productSpec: get component names
      if (sku.productSpec) {
        try {
          const specs = typeof sku.productSpec === 'string'
            ? JSON.parse(sku.productSpec)
            : sku.productSpec;

          if (Array.isArray(specs)) {
            for (const spec of specs) {
              if (spec.name) {
                const nameZh = spec.name;

                if (!componentMap.has(nameZh)) {
                  componentMap.set(nameZh, {
                    nameZh,
                    parts: new Set(),
                    usedInProducts: [],
                    codes: new Set(),
                  });
                }

                const comp = componentMap.get(nameZh)!;
                if (!comp.usedInProducts.includes(sku.productCode)) {
                  comp.usedInProducts.push(sku.productCode);
                }

                if (spec.code) {
                  comp.codes.add(spec.code);
                }

                // Add parts from productSpec
                if (spec.parts && Array.isArray(spec.parts)) {
                  spec.parts.forEach((part: string) => comp.parts.add(part));
                }
              }
            }
          }
        } catch (e) {
          console.error(`Failed to parse productSpec for SKU ${sku.productCode}:`, e);
        }
      }

      // From additionalAttributes: get more parts for each component
      if (sku.additionalAttributes) {
        try {
          const attrs = typeof sku.additionalAttributes === 'string'
            ? JSON.parse(sku.additionalAttributes)
            : sku.additionalAttributes;

          if (Array.isArray(attrs)) {
            for (const attr of attrs) {
              // Find corresponding component name from productSpec
              const componentCode = attr.componentCode;
              if (!componentCode || !sku.productSpec) continue;

              const specs = typeof sku.productSpec === 'string'
                ? JSON.parse(sku.productSpec)
                : sku.productSpec;

              const matchingSpec = specs.find((s: any) => s.code === componentCode);
              if (!matchingSpec || !matchingSpec.name) continue;

              const nameZh = matchingSpec.name;
              if (!componentMap.has(nameZh)) continue;

              const comp = componentMap.get(nameZh)!;

              // Extract parts from color schemes
              if (attr.colorSchemes && Array.isArray(attr.colorSchemes)) {
                for (const scheme of attr.colorSchemes) {
                  if (scheme.colors && Array.isArray(scheme.colors)) {
                    for (const colorPart of scheme.colors) {
                      if (colorPart.part) {
                        comp.parts.add(colorPart.part);
                      }
                    }
                  }
                }
              }
              // Handle old format
              else if (attr.colors && Array.isArray(attr.colors)) {
                for (const colorPart of attr.colors) {
                  if (colorPart.part) {
                    comp.parts.add(colorPart.part);
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error(`Failed to parse additionalAttributes for SKU ${sku.productCode}:`, e);
        }
      }
    }

    // 3. Display found components
    console.log('=== Discovered Component Types ===\n');
    const sortedComponents = Array.from(componentMap.values()).sort((a, b) =>
      a.nameZh.localeCompare(b.nameZh)
    );

    sortedComponents.forEach(comp => {
      const codes = Array.from(comp.codes).join(', ');
      console.log(`[${comp.nameZh}]`);
      console.log(`  Associated codes: ${codes || 'N/A'}`);
      console.log(`  Used in ${comp.usedInProducts.length} products`);
      console.log(`  Parts (${comp.parts.size}): ${Array.from(comp.parts).join(', ') || 'None'}`);
      console.log('');
    });

    // 4. Generate component codes and prepare migration data
    console.log('=== Preparing Migration ===\n');

    // We'll create a code for each component based on a prefix + number
    const componentsToMigrate: Array<{
      code: string;
      nameZh: string;
      nameEn: string;
      parts: Array<{ nameZh: string; nameEn: string }>;
      sortOrder: number;
    }> = [];

    let codeCounter = 1;
    for (const comp of sortedComponents) {
      const code = `CP${String(codeCounter).padStart(3, '0')}`; // CP001, CP002, etc.

      componentsToMigrate.push({
        code,
        nameZh: comp.nameZh,
        nameEn: comp.nameZh, // Default to Chinese, needs manual translation
        parts: Array.from(comp.parts).map(part => ({
          nameZh: part,
          nameEn: part, // Default to Chinese, needs manual translation
        })),
        sortOrder: codeCounter,
      });

      console.log(`  [${code}] ${comp.nameZh} (${comp.parts.size} parts)`);
      codeCounter++;
    }

    // 5. Migrate to database
    console.log(`\n=== Migrating ${componentsToMigrate.length} Components ===\n`);

    // First, clear existing components (optional - comment out if you want to keep them)
    const existingCount = await prisma.component.count();
    console.log(`Found ${existingCount} existing components in database`);
    console.log('Deleting existing components...');
    await prisma.component.deleteMany({});
    console.log('✓ Cleared existing components\n');

    // Migrate new components
    let successCount = 0;
    for (const comp of componentsToMigrate) {
      try {
        await prisma.component.create({
          data: {
            code: comp.code,
            nameZh: comp.nameZh,
            nameEn: comp.nameEn,
            parts: comp.parts,
            sortOrder: comp.sortOrder,
            isActive: true,
          },
        });
        console.log(`  ✓ [${comp.code}] ${comp.nameZh} / ${comp.nameEn}`);
        successCount++;
      } catch (e: any) {
        console.error(`  ✗ Failed to migrate [${comp.code}] ${comp.nameZh}:`, e.message);
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total unique component types found: ${componentMap.size}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed: ${componentsToMigrate.length - successCount}`);
    console.log('\nNote: English names and part translations need to be updated manually in Component Configuration UI');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateAllComponentTypes()
  .then(() => {
    console.log('\nScript finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
