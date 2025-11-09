/**
 * 统一的页面标题组件 - 参考仪表板设计
 */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h1
            className="text-4xl font-light text-black tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h1>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      <div className="w-20 h-[2px] bg-gradient-to-r from-primary to-transparent mb-4"></div>
      {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
    </div>
  );
}
