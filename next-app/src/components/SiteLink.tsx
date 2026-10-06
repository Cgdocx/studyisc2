import Link from 'next/link';
import type { ReactNode } from 'react';
import { PORTED_ROUTES, legacyHref } from '@/lib/site';

interface Props {
  file: string;
  className?: string;
  children: ReactNode;
}

export default function SiteLink({ file, className, children }: Props) {
  const ported = PORTED_ROUTES[file];
  if (ported) {
    return <Link href={ported.route} className={className}>{children}</Link>;
  }
  return <a href={legacyHref(file)} className={className}>{children}</a>;
}
