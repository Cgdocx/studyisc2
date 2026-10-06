import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { PORTED_ROUTES, legacyHref } from '@/lib/site';

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  file: string;
  children: ReactNode;
}

export default function SiteLink({ file, children, ...rest }: Props) {
  const q = file.indexOf('?');
  const base = q < 0 ? file : file.slice(0, q);
  const query = q < 0 ? '' : file.slice(q);
  const ported = PORTED_ROUTES[base];
  if (ported) {
    return <Link href={ported.route + query} {...rest}>{children}</Link>;
  }
  return <a href={legacyHref(file)} {...rest}>{children}</a>;
}
