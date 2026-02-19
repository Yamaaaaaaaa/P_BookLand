export interface NavLink {
  label: string;
  href: string;
}

export const mainNavLinks: NavLink[] = [
  { label: 'header.home', href: '/shop/home' },
  // { label: 'Pages', href: '/shop/pages' },
  { label: 'header.shop', href: '/shop/books' },
  { label: 'header.articles', href: '/shop/articles' },
  { label: 'footer.company.about_us', href: '/shop/about' },
  // { label: 'Contact', href: '/shop/contact' }
];

export const footerLinks = {
  company: [
    { label: 'footer.company.about_us', href: '/shop/about' },
    { label: 'footer.company.careers', href: '/shop/careers' },
    { label: 'footer.company.affiliates', href: '/shop/affiliates' },
    { label: 'footer.company.blog', href: '/shop/blog' }
  ],
  help: [
    { label: 'footer.help.contact_us', href: '/shop/contact' },
    { label: 'footer.help.faqs', href: '/shop/faqs' },
    { label: 'footer.help.terms', href: '/shop/terms' },
    { label: 'footer.help.privacy', href: '/shop/privacy' }
  ],
  resources: [
    { label: 'footer.resources.gift_cards', href: '/shop/gift-cards' },
    { label: 'footer.resources.sitemap', href: '/shop/sitemap' },
    { label: 'footer.resources.stores', href: '/shop/stores' },
    { label: 'footer.resources.wishlist', href: '/shop/wishlist' }
  ]
};
