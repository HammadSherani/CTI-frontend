// src/app/[locale]/page.js - Server Component Wrapper
import Home from './Home';

export default async function HomePage({params}) {
  const {locale} = await params;
  
  return <Home locale={locale} />;
}