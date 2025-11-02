'use client';

import { useState } from 'react';
import {
  getPantoneColor,
  colorDescriptionToHex,
  getPantoneColorsByCategory,
  PANTONE_COLORS
} from '@/lib/pantoneColors';

export default function PantoneDemoPage() {
  const [inputColor, setInputColor] = useState('');
  const [result, setResult] = useState<any>(null);
  const categories = getPantoneColorsByCategory();

  const handleConvert = () => {
    // 尝试转换为HEX
    const hex = colorDescriptionToHex(inputColor);
    if (hex) {
      const pantone = getPantoneColor(inputColor);
      setResult({
        success: true,
        hex,
        pantone,
        input: inputColor
      });
    } else {
      setResult({
        success: false,
        input: inputColor
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">潘通色号转换工具</h1>
        <p className="text-gray-600 mb-8">Pantone Color Converter - 将潘通色号转换为 HEX/RGB 颜色值</p>

        {/* 转换工具 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">颜色转换</h2>

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={inputColor}
              onChange={(e) => setInputColor(e.target.value)}
              placeholder="输入颜色描述，如: 10C, 225C, 冷灰10, 玫红225"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleConvert}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              转换
            </button>
          </div>

          {/* 转换结果 */}
          {result && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              {result.success ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div
                      className="w-32 h-32 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: result.hex }}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">转换成功 ✓</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-semibold text-gray-600">输入:</span>
                          <span className="ml-2 text-gray-900 font-mono">{result.input}</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-600">HEX:</span>
                          <span className="ml-2 text-gray-900 font-mono text-lg">{result.hex}</span>
                        </div>
                        {result.pantone && (
                          <>
                            <div>
                              <span className="text-sm font-semibold text-gray-600">潘通色号:</span>
                              <span className="ml-2 text-gray-900">{result.pantone.code}</span>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-600">颜色名称:</span>
                              <span className="ml-2 text-gray-900">{result.pantone.name}</span>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-600">RGB:</span>
                              <span className="ml-2 text-gray-900 font-mono">
                                rgb({result.pantone.rgb.r}, {result.pantone.rgb.g}, {result.pantone.rgb.b})
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="font-semibold">转换失败 ✗</p>
                  <p className="text-sm mt-1">未找到匹配的颜色: {result.input}</p>
                </div>
              )}
            </div>
          )}

          {/* 使用示例 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">支持的输入格式:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 潘通色号: <code className="bg-white px-2 py-0.5 rounded">10C</code>, <code className="bg-white px-2 py-0.5 rounded">225C</code></li>
              <li>• 完整名称: <code className="bg-white px-2 py-0.5 rounded">Cool Gray 10 C</code></li>
              <li>• 中文描述: <code className="bg-white px-2 py-0.5 rounded">冷灰10</code>, <code className="bg-white px-2 py-0.5 rounded">玫红225</code></li>
              <li>• HEX格式: <code className="bg-white px-2 py-0.5 rounded">#FF0000</code></li>
              <li>• RGB格式: <code className="bg-white px-2 py-0.5 rounded">rgb(255, 0, 0)</code></li>
            </ul>
          </div>
        </div>

        {/* 颜色库展示 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">潘通颜色库</h2>

          {Object.entries(categories).map(([category, colors]) => (
            colors.length > 0 && (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {colors.map((color) => (
                    <div
                      key={color.code}
                      className="group cursor-pointer"
                      onClick={() => {
                        setInputColor(color.code);
                        setResult({
                          success: true,
                          hex: color.hex,
                          pantone: color,
                          input: color.code
                        });
                      }}
                    >
                      <div
                        className="w-full aspect-square rounded-lg border-2 border-gray-300 shadow-sm group-hover:scale-105 group-hover:shadow-lg transition-all mb-2"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{color.code}</div>
                        <div className="text-xs text-gray-500 font-mono">{color.hex}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        {/* API 使用文档 */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">开发者文档</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">导入工具函数</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`import {
  getPantoneColor,
  colorDescriptionToHex
} from '@/lib/pantoneColors';`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">基础使用</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`// 获取潘通色号信息
const color = getPantoneColor('10C');
console.log(color.hex);  // "#63666A"
console.log(color.rgb);  // { r: 99, g: 102, b: 106 }

// 转换颜色描述
const hex1 = colorDescriptionToHex('冷灰10');    // "#63666A"
const hex2 = colorDescriptionToHex('225C');      // "#FFB3D9"
const hex3 = colorDescriptionToHex('玫红225');   // "#FFB3D9"`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">在产品SKU中使用</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`// 客户提供: "10C冷灰"
const customerColor = "10C";
const hexColor = colorDescriptionToHex(customerColor);

// 保存到数据库
await db.sku.create({
  color: customerColor,        // "10C"
  colorHex: hexColor,          // "#63666A"
  // ...
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
