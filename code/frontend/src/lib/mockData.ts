import { ProductGroup, ProductSKU, Category } from '@/types'

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Cleaning Tools', sortOrder: 1 },
  { id: 'cat-2', name: 'Kitchen Items', sortOrder: 2 },
  { id: 'cat-3', name: 'Storage', sortOrder: 3 },
  { id: 'cat-4', name: 'Floor Cleaning', sortOrder: 4 },
  { id: 'cat-5', name: 'Window & Glass', sortOrder: 5 },
  { id: 'cat-6', name: 'Brushes & Brooms', sortOrder: 6 },
  { id: 'cat-7', name: 'Dusting Tools', sortOrder: 7 },
  { id: 'cat-8', name: 'Home Organization', sortOrder: 8 },
]

export const mockMaterials: Array<{ id: string; name: string }> = [
  { id: 'mat-1', name: 'Microfiber' },
  { id: 'mat-2', name: 'Stainless Steel' },
  { id: 'mat-3', name: 'Recycled Plastic' },
  { id: 'mat-4', name: 'Natural Bristles' },
  { id: 'mat-5', name: 'Synthetic Fibers' },
  { id: 'mat-6', name: 'Rubber' },
  { id: 'mat-7', name: 'Bamboo' },
  { id: 'mat-8', name: 'Nylon' },
]

export const mockProductGroups: ProductGroup[] = [
  {
    id: 'group-1',
    groupName: 'Rotating Mop Set',
    categoryId: 'cat-1',
    description: '360-degree rotation for easy cleaning',
    baseComponents: ['Handle', 'Mop Head', 'Cloth'],
    availableColors: {
      Handle: [
        { id: 'handle-blue', name: 'Blue', hex: '#4A90E2' },
        { id: 'handle-green', name: 'Green', hex: '#7ED321' },
        { id: 'handle-pink', name: 'Pink', hex: '#FF6B9D' },
      ],
      'Mop Head': [
        { id: 'head-white', name: 'White', hex: '#FFFFFF' },
        { id: 'head-gray', name: 'Gray', hex: '#9B9B9B' },
      ],
      Cloth: [
        { id: 'cloth-blue', name: 'Blue', hex: '#5A9FD4' },
        { id: 'cloth-green', name: 'Green', hex: '#8BC34A' },
      ],
    },
    skus: [
      {
        id: 'sku-1',
        sku: 'MOP-BLU-WHT-BLU',
        groupId: 'group-1',
        name: 'Rotating Mop Set',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSV4aulz9sIes42kl4uCCUZl_2JAHsp5KLbB1I84Iwb45hHb7Y2yAJ0CVWcFYbDQARNQvIVC0NbDNGqs89BKRUA4g2HQdEw4g5ZEf-xEee8ySqhkXD8QQOSTzQmOsxPciGGCFChki1rZfqbMVKDMJKPkGOfIv4yNfPtkdd7vUAuXvDWo3-L6hnLSkAN9O2g-h7DnN7Lw2wPsYtubHu36G5BAFOdUJUucXcIEi5UNSFBgj_xlac_2ePsWt_nSF-jNDmrBtXOKmL71kI',
        detailImages: ['/images/mop-detail-1.jpg', '/images/mop-detail-2.jpg'],
        price: 89.00,
        colorCombination: {
          Handle: { name: 'Blue', hex: '#4A90E2' },
          'Mop Head': { name: 'White', hex: '#FFFFFF' },
          Cloth: { name: 'Blue', hex: '#5A9FD4' },
        },
        status: 'active',
      },
      {
        id: 'sku-2',
        sku: 'MOP-GRN-WHT-GRN',
        groupId: 'group-1',
        name: 'Rotating Mop Set',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSV4aulz9sIes42kl4uCCUZl_2JAHsp5KLbB1I84Iwb45hHb7Y2yAJ0CVWcFYbDQARNQvIVC0NbDNGqs89BKRUA4g2HQdEw4g5ZEf-xEee8ySqhkXD8QQOSTzQmOsxPciGGCFChki1rZfqbMVKDMJKPkGOfIv4yNfPtkdd7vUAuXvDWo3-L6hnLSkAN9O2g-h7DnN7Lw2wPsYtubHu36G5BAFOdUJUucXcIEi5UNSFBgj_xlac_2ePsWt_nSF-jNDmrBtXOKmL71kI',
        detailImages: ['/images/mop-detail-1.jpg', '/images/mop-detail-2.jpg'],
        price: 89.00,
        colorCombination: {
          Handle: { name: 'Green', hex: '#7ED321' },
          'Mop Head': { name: 'White', hex: '#FFFFFF' },
          Cloth: { name: 'Green', hex: '#8BC34A' },
        },
        status: 'active',
      },
      {
        id: 'sku-3',
        sku: 'MOP-PNK-GRY-BLU',
        groupId: 'group-1',
        name: 'Rotating Mop Set',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSV4aulz9sIes42kl4uCCUZl_2JAHsp5KLbB1I84Iwb45hHb7Y2yAJ0CVWcFYbDQARNQvIVC0NbDNGqs89BKRUA4g2HQdEw4g5ZEf-xEee8ySqhkXD8QQOSTzQmOsxPciGGCFChki1rZfqbMVKDMJKPkGOfIv4yNfPtkdd7vUAuXvDWo3-L6hnLSkAN9O2g-h7DnN7Lw2wPsYtubHu36G5BAFOdUJUucXcIEi5UNSFBgj_xlac_2ePsWt_nSF-jNDmrBtXOKmL71kI',
        detailImages: ['/images/mop-detail-1.jpg', '/images/mop-detail-2.jpg'],
        price: 89.00,
        colorCombination: {
          Handle: { name: 'Pink', hex: '#FF6B9D' },
          'Mop Head': { name: 'Gray', hex: '#9B9B9B' },
          Cloth: { name: 'Blue', hex: '#5A9FD4' },
        },
        status: 'active',
      },
    ],
    sortOrder: 1,
    status: 'active',
  },
  {
    id: 'group-2',
    groupName: 'Multi-Function Broom',
    categoryId: 'cat-1',
    description: 'Lightweight and durable',
    baseComponents: ['Broom Handle', 'Broom Head'],
    availableColors: {
      'Broom Handle': [
        { id: 'broom-handle-red', name: 'Red', hex: '#E74C3C' },
        { id: 'broom-handle-yellow', name: 'Yellow', hex: '#F1C40F' },
      ],
      'Broom Head': [
        { id: 'broom-head-brown', name: 'Brown', hex: '#8B4513' },
        { id: 'broom-head-black', name: 'Black', hex: '#2C3E50' },
      ],
    },
    skus: [
      {
        id: 'sku-4',
        sku: 'BROOM-RED-BRN',
        groupId: 'group-2',
        name: 'Multi-Function Broom',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfi1K58Srl81ZITOYuNmNL-H9Pjd-C1kWaLRJPCoJZ-jYYqOFcGoYZQP69NgzaY-yqU5h-8Bp-kWdtJGVHveeKt7P2pBYIQvaCbEQ1xW0Sn4ryEboi7EftPzrRvQ1DddRFioFynEpqDDrQApQTeV78224hX1hyWju2WhrDBOtUY1XjABYDRnh3lbTGTnTbmxSplwI2MbWJNUVb2ivKnIDZlnbOgnP0-Fez2ei6nvbZHyBMM13PPY-PM1OW0jKaPGJL5JioexDR0MZJ',
        detailImages: ['/images/broom-detail-1.jpg'],
        price: 45.00,
        colorCombination: {
          'Broom Handle': { name: 'Red', hex: '#E74C3C' },
          'Broom Head': { name: 'Brown', hex: '#8B4513' },
        },
        status: 'active',
      },
      {
        id: 'sku-5',
        sku: 'BROOM-YEL-BLK',
        groupId: 'group-2',
        name: 'Multi-Function Broom',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfi1K58Srl81ZITOYuNmNL-H9Pjd-C1kWaLRJPCoJZ-jYYqOFcGoYZQP69NgzaY-yqU5h-8Bp-kWdtJGVHveeKt7P2pBYIQvaCbEQ1xW0Sn4ryEboi7EftPzrRvQ1DddRFioFynEpqDDrQApQTeV78224hX1hyWju2WhrDBOtUY1XjABYDRnh3lbTGTnTbmxSplwI2MbWJNUVb2ivKnIDZlnbOgnP0-Fez2ei6nvbZHyBMM13PPY-PM1OW0jKaPGJL5JioexDR0MZJ',
        detailImages: ['/images/broom-detail-1.jpg'],
        price: 45.00,
        colorCombination: {
          'Broom Handle': { name: 'Yellow', hex: '#F1C40F' },
          'Broom Head': { name: 'Black', hex: '#2C3E50' },
        },
        status: 'active',
      },
    ],
    sortOrder: 2,
    status: 'active',
  },
  {
    id: 'group-3',
    groupName: 'Kitchen Sponge Set',
    categoryId: 'cat-2',
    description: 'Strong cleaning power, safe for cookware',
    baseComponents: ['Sponge Body', 'Handle'],
    availableColors: {
      'Sponge Body': [
        { id: 'sponge-yellow', name: 'Yellow', hex: '#FFD700' },
        { id: 'sponge-pink', name: 'Pink', hex: '#FFB6C1' },
      ],
      Handle: [
        { id: 'handle-white', name: 'White', hex: '#FFFFFF' },
        { id: 'handle-blue', name: 'Blue', hex: '#4169E1' },
      ],
    },
    skus: [
      {
        id: 'sku-6',
        sku: 'SPNG-YEL-WHT',
        groupId: 'group-3',
        name: 'Kitchen Sponge Set',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwU9EPbCeWtPXd3LnWWxDR3m0NWwkvRXgwA6Ydjbwd_q39jNDNsSuLz7gTVDC9E3moGGwTQ8gDJ-qeenFCorzD6oeFBTXpqffoWd0usjGwznRbQkT8R8_cW-9EntOyzc2E2JlfiZj4q0Tc2VGaTL4ugwPQqFCSqa44CdgnV7dp7k41NenFhCRk1uQ6gr8MlDM8aifbSFgRvsDUHFTiQMyCyNHUlj6Q64AqfpSBsWtw0FHFGDOujY-kWQ-8fKO6NI11mJ9enoREtIPe',
        detailImages: ['/images/sponge-detail-1.jpg'],
        price: 25.00,
        colorCombination: {
          'Sponge Body': { name: 'Yellow', hex: '#FFD700' },
          Handle: { name: 'White', hex: '#FFFFFF' },
        },
        status: 'active',
      },
      {
        id: 'sku-7',
        sku: 'SPNG-PNK-BLU',
        groupId: 'group-3',
        name: 'Kitchen Sponge Set',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbiIeS_8I9cg8G2DxKoNSd2c4etQEF_eM1nrAXWr0fMOS5V9nIi-7waq9GJ1zVBS5CYwejTNYxnqdeDa6f7z6akHTU1fzmm-Q_XaSUWF7VQO5JuN63-WE_ThhDV89_hq72MKk950Cc_D8dtl4HYUhmfjPrRMzJsjFq_Ks1gB91gY6MMk8Eg-k2cmp5lX_lowkNXZ6iyx-ZtZrlq-9CriHkS0R0EN-sm3Yg_0lwz4K3nZIj9F-zDq3e9qRP6QOMxfY_827bfXZ4pJWt',
        detailImages: ['/images/sponge-detail-1.jpg'],
        price: 25.00,
        colorCombination: {
          'Sponge Body': { name: 'Pink', hex: '#FFB6C1' },
          Handle: { name: 'Blue', hex: '#4169E1' },
        },
        status: 'active',
      },
    ],
    sortOrder: 3,
    status: 'active',
  },
  {
    id: 'group-4',
    groupName: 'Deluxe Cleaning Bucket',
    categoryId: 'cat-1',
    description: 'Large capacity with handle',
    baseComponents: ['Bucket', 'Handle'],
    availableColors: {
      Bucket: [
        { id: 'bucket-blue', name: 'Blue', hex: '#3498DB' },
        { id: 'bucket-red', name: 'Red', hex: '#E74C3C' },
      ],
      Handle: [
        { id: 'handle-black', name: 'Black', hex: '#2C3E50' },
        { id: 'handle-gray', name: 'Gray', hex: '#95A5A6' },
      ],
    },
    skus: [
      {
        id: 'sku-8',
        sku: 'BCKT-BLU-BLK',
        groupId: 'group-4',
        name: 'Deluxe Cleaning Bucket',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA-xhSQMIXCEToPuBIcgJtoEhRyFOe3go7GPbACC5duLevFYOO0vNn-TtoCja7pky40tgPS9KzdFnJDakuDg-YIdwVUy8_xFG6eDySJUr_IkFkq7j6ect3gAHPg3ca0YeZBWsdUutEvOzU0bi0aPxAVI6K-igFBtHPb-hkRzKUsyijzulrD1EBRnUCg6OrNYig7_onhy7Cez4gb7FN6Life15OLW58Vk5sRoMDzLOO_3YStL7D5_tYGEkxN5n-JrNGIqFn3FyeiB1g',
        detailImages: ['/images/bucket-detail-1.jpg'],
        price: 35.00,
        colorCombination: {
          Bucket: { name: 'Blue', hex: '#3498DB' },
          Handle: { name: 'Black', hex: '#2C3E50' },
        },
        status: 'active',
      },
    ],
    sortOrder: 4,
    status: 'active',
  },
  {
    id: 'group-5',
    groupName: 'Microfiber Cloth Pack',
    categoryId: 'cat-1',
    description: 'Premium microfiber, pack of 6',
    baseComponents: ['Cloth'],
    availableColors: {
      Cloth: [
        { id: 'cloth-multi', name: 'Multicolor', hex: '#9B59B6' },
        { id: 'cloth-white', name: 'White', hex: '#FFFFFF' },
      ],
    },
    skus: [
      {
        id: 'sku-9',
        sku: 'CLTH-MLT',
        groupId: 'group-5',
        name: 'Microfiber Cloth Pack',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvR4ZS6iXxPFjf_owlhSPtxe5rlS3z6hvFKe58cv5BSORe-WqryNsuUX_Ne8neN4gnS5YUYF57Kpw4fgtLFvpdeMCyaQ7EShr8TANoGQDzKAWI1g5vXgFc8kSegkeQJKZ70F2cv_jf5loG3XNcmwWVgpGa4gneqxJW7baf_rbz21PvoQWOTf_JjdUV8u6OuSMgKZJoL4xWM9xjckJwXmc8kJgjKjXhJvooJrhFFhBXBC4GTBR5obA_oAOsSRNjWKAMpOOHO9HAwj_8',
        detailImages: ['/images/cloth-detail-1.jpg'],
        price: 19.99,
        colorCombination: {
          Cloth: { name: 'Multicolor', hex: '#9B59B6' },
        },
        status: 'active',
      },
    ],
    sortOrder: 5,
    status: 'active',
  },
  {
    id: 'group-6',
    groupName: 'Window Squeegee',
    categoryId: 'cat-1',
    description: 'Streak-free shine guaranteed',
    baseComponents: ['Handle', 'Blade'],
    availableColors: {
      Handle: [
        { id: 'handle-green', name: 'Green', hex: '#27AE60' },
        { id: 'handle-orange', name: 'Orange', hex: '#E67E22' },
      ],
      Blade: [
        { id: 'blade-black', name: 'Black', hex: '#34495E' },
      ],
    },
    skus: [
      {
        id: 'sku-10',
        sku: 'SQGE-GRN-BLK',
        groupId: 'group-6',
        name: 'Window Squeegee',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7HMh6_hD8cR25jo_qnZrPerFSibHYfq3qUFo3yuEBu2nypqaS3eZLsyXuJkHUojmccp2Rkio67iXcCjle1fHtIRUCyUTVZ9utbo0t6z9YsGGGskD_nTqe--S39RKW3GqQ7JgZ_6gzMCERuKagWAgvDHoXv71IDkekp1GVvMYqgtqnIKqXYVLo6GsUgzq_dY-dpZAELLoHjVmB-ikVgM0djfG9Vn6cReRTwGSrQiur71JTyMBLS0Q2cHE4H02vXUSq78lCX9vbHOvh',
        detailImages: ['/images/squeegee-detail-1.jpg'],
        price: 29.99,
        colorCombination: {
          Handle: { name: 'Green', hex: '#27AE60' },
          Blade: { name: 'Black', hex: '#34495E' },
        },
        status: 'active',
      },
    ],
    sortOrder: 6,
    status: 'active',
  },
  {
    id: 'group-7',
    groupName: 'Storage Basket',
    categoryId: 'cat-3',
    description: 'Organize your cleaning supplies',
    baseComponents: ['Basket'],
    availableColors: {
      Basket: [
        { id: 'basket-beige', name: 'Beige', hex: '#D4C5B9' },
        { id: 'basket-white', name: 'White', hex: '#F5F5F5' },
      ],
    },
    skus: [
      {
        id: 'sku-11',
        sku: 'BSKT-BGE',
        groupId: 'group-7',
        name: 'Storage Basket',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8iYKG9Q6fWrGYECfhPmGXcZc_hNXBMUyW0PJr6ZNVbTDKm7vbpkdyAJg3hQMIs_-GocOdbSFK239oKZQLt6vAHrwP7dS2ZHAxunoh40m3EtGoUsY_OStSXfnXWSd3e-hGA7PsOHj83GrMO2fLu6F0ydlSdBTalHC13f4hw-OgBsyB9gUsriWAO-J856P32M731sPLE1rsUO4LOrb1uEX3Tr6tMgfHcdPFVmmBO3AMkqFra11lvgOQdDwlvCoAykCI9UEtUg-yESwK',
        detailImages: ['/images/basket-detail-1.jpg'],
        price: 42.00,
        colorCombination: {
          Basket: { name: 'Beige', hex: '#D4C5B9' },
        },
        status: 'active',
      },
    ],
    sortOrder: 7,
    status: 'active',
  },
  {
    id: 'group-8',
    groupName: 'Dust Pan & Brush Set',
    categoryId: 'cat-1',
    description: 'Compact and efficient',
    baseComponents: ['Pan', 'Brush'],
    availableColors: {
      Pan: [
        { id: 'pan-gray', name: 'Gray', hex: '#7F8C8D' },
        { id: 'pan-green', name: 'Green', hex: '#16A085' },
      ],
      Brush: [
        { id: 'brush-black', name: 'Black', hex: '#2C3E50' },
      ],
    },
    skus: [
      {
        id: 'sku-12',
        sku: 'DPAN-GRY-BLK',
        groupId: 'group-8',
        name: 'Dust Pan & Brush Set',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLec0-ffJPhk8M2dQ7MUnHmW_Rp2Sk6hccVVPuyc72bDKZPcv9CHofV5PnP2JBg6oaaf3QWSy11zRjctoMcuc_WttLHRjP6T4O2E4iCLysEyYTv3mnzevnhvLSJ6wu8LF_hMf_DH32cZqBwxogFQkqj-jCcut3kCAgERfimgjh3IC9EX5OhgnseLJDz4b3OTZfb4rvTz756d4LZSMbXKTGNZUjzpV7YPU3mrMAy2LtsWNmtU5EXVK1WSWdB81mg0MwXUFJQESfVzhC',
        detailImages: ['/images/dustpan-detail-1.jpg'],
        price: 18.50,
        colorCombination: {
          Pan: { name: 'Gray', hex: '#7F8C8D' },
          Brush: { name: 'Black', hex: '#2C3E50' },
        },
        status: 'active',
      },
    ],
    sortOrder: 8,
    status: 'active',
  },
  {
    id: 'group-9',
    groupName: 'Floor Scrubber',
    categoryId: 'cat-1',
    description: 'Heavy-duty for tough stains',
    baseComponents: ['Handle', 'Brush Head'],
    availableColors: {
      Handle: [
        { id: 'handle-yellow', name: 'Yellow', hex: '#F39C12' },
        { id: 'handle-red', name: 'Red', hex: '#C0392B' },
      ],
      'Brush Head': [
        { id: 'brush-white', name: 'White', hex: '#ECF0F1' },
        { id: 'brush-gray', name: 'Gray', hex: '#BDC3C7' },
      ],
    },
    skus: [
      {
        id: 'sku-13',
        sku: 'SCRB-YEL-WHT',
        groupId: 'group-9',
        name: 'Floor Scrubber',
        mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAElHmxmAAKqpCz_QAUtI6vpZUmjHCwFt3PNNY2nHFc_GZVSzS4hWOfrcTHXlZSsgZThq5RkO-GGc2TaKin2KHJdBMiS4HedYoi_anO5X33xBpI95-WSPdeIlU0CyWQPp11cOAAJl5SyZ04TBykepwn-m8mkV0H5cPF_AsUAnyWEzKqF7YjqxTiPsH3v8-eHZf4tQCu5EGfSse3JWepKrgKQB0aeJtbDCMR7_gUnU5eGquWJp08jWIM6CUPJcdu5wea9IVtjQlmcStZ',
        detailImages: ['/images/scrubber-detail-1.jpg'],
        price: 65.00,
        colorCombination: {
          Handle: { name: 'Yellow', hex: '#F39C12' },
          'Brush Head': { name: 'White', hex: '#ECF0F1' },
        },
        status: 'active',
      },
    ],
    sortOrder: 9,
    status: 'active',
  },
]

export function findSKUByColors(
  group: ProductGroup,
  selectedColors: Record<string, string>
): ProductSKU | null {
  return group.skus.find((sku) => {
    return Object.entries(selectedColors).every(([component, colorName]) => {
      return sku.colorCombination[component]?.name === colorName
    })
  }) || null
}
