import Image from "next/image";
import Link from "next/link";

export const StoreButton = ({ img, title, subtitle, href }) => (
  <Link href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-900 text-white p-2 rounded-lg">
    <Image src={`/assets/logo/${img}`} alt={title} width={24} height={24} />
    <div>
      <p className="text-xs">{subtitle}</p>
      <p className="text-sm font-semibold">{title}</p>
    </div>
  </Link>
);
