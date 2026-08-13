import { notFound } from 'next/navigation';
import { getModule } from '@/data/docs/registry';
import DocsLayout from '@/components/docs/DocsLayout';
import DocsHeader from '@/components/docs/DocsHeader';
import ComingSoon from '@/components/docs/ComingSoon';

export default async function ModuleDocsLayout({ children, params }) {
  const { module: moduleKey } = await params;
  const docModule = getModule(moduleKey);

  if (!docModule) {
    notFound();
  }

  if (!docModule.available) {
    return (
      <div className="min-h-screen bg-white">
        <DocsHeader showMenuButton={false} />
        <ComingSoon module={docModule} />
      </div>
    );
  }

  return (
    <DocsLayout moduleKey={docModule.key} nav={docModule.nav}>
      {children}
    </DocsLayout>
  );
}
