import Link from "next/link";
import { Search } from "lucide-react";
import { defaultWebsiteEditorContent, type WebsiteEditorContent } from "@/lib/cms/website-editor-defaults";
import { footerGroups, marketingNav } from "@/lib/marketing";
import { BrandLockup } from "./brand";
import { Button } from "./ui";
import { MarketingMobileMenu } from "./marketing-mobile-menu";
import { ThemeToggle } from "./theme-toggle";

export function MarketingShellView({
  children,
  loggedIn = false,
  website
}: {
  children: React.ReactNode;
  loggedIn?: boolean;
  website?: WebsiteEditorContent;
}) {
  const site = website || defaultWebsiteEditorContent;
  const brand = site.branding;
  const headerMenu = site.navigation.headerMenu.filter(item => item.visible !== false);
  const footerMenu = site.navigation.footerMenu.filter(item => item.visible !== false);
  const navItems = headerMenu.length ? headerMenu : marketingNav;

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f7f8fb_42%,#eef4ff_100%)] text-slate-950 dark:bg-[linear-gradient(180deg,#050816_0%,#09111f_52%,#0b1220_100%)] dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/78 backdrop-blur-xl transition dark:border-white/10 dark:bg-slate-950/72">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3 font-semibold text-slate-950 dark:text-white">
            <BrandLockup name={brand.companyName} shortName={brand.shortName} logoUrl={brand.logoUrl} />
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-slate-600 lg:flex dark:text-slate-300">
            {navItems.slice(0, 8).map(item => (
              <Link key={`${item.href}-${item.label}`} href={item.href} className="rounded-full px-2 py-1 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/docs" className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-500 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              <Search size={15} />
              Search
            </Link>
            <ThemeToggle />
            <Link href={loggedIn ? "/dashboard" : "/login"}>
              <Button variant="secondary">{loggedIn ? "Dashboard" : "Login"}</Button>
            </Link>
            <Link href={site.navigation.ctaHref || "/signup"}>
              <Button>{site.navigation.ctaLabel || "Start Free Trial"}</Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <MarketingMobileMenu loggedIn={loggedIn} navItems={navItems} ctaLabel={site.navigation.ctaLabel} ctaHref={site.navigation.ctaHref} />
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <BrandLockup name={brand.companyName} shortName={brand.shortName} logoUrl={brand.logoUrl} />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
              {brand.tagline || "Lead intelligence and manual outreach drafting for teams that want qualified community leads without spam automation."}
            </p>
            <form className="mt-5 flex max-w-sm gap-2">
              <input
                type="email"
                aria-label="Newsletter email"
                placeholder="Work email"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 dark:border-white/10 dark:bg-white/10"
              />
              <Button type="submit">Subscribe</Button>
            </form>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{site.footer.newsletterText}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerMenu.length ? (
              <div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Website</h3>
                <div className="mt-3 grid gap-2">
                  {footerMenu.map(item => (
                    <Link key={`${item.href}-${item.label}`} href={item.href} className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {footerGroups.slice(0, footerMenu.length ? 3 : 4).map(group => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{group.title}</h3>
                <div className="mt-3 grid gap-2">
                  {group.links.map(([label, href]) => (
                    <Link key={href} href={href} className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-slate-200/80 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:text-slate-400">
          <span>© {new Date().getFullYear()} {site.footer.copyright || `${brand.companyName}. All rights reserved.`}</span>
          <span>Manual outreach only. No auto-send, no stealth automation.</span>
        </div>
      </footer>
    </div>
  );
}
