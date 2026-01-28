export interface NavLink {
  label: string;
  href: string;
}

export const mainNavLinks: NavLink[] = [
  { label: 'Home', href: '/shop/home' },
  { label: 'About', href: '/shop/about' },
  { label: 'Pages', href: '/shop/pages' },
  { label: 'Shop', href: '/shop/books' },
  { label: 'Articles', href: '/shop/articles' },
  { label: 'Contact', href: '/shop/contact' }
];

export const footerLinks = {
  company: [
    { label: 'About Us', href: '/shop/about' },
    { label: 'Careers', href: '/shop/careers' },
    { label: 'Affiliates', href: '/shop/affiliates' },
    { label: 'Blog', href: '/shop/blog' }
  ],
  help: [
    { label: 'Contact Us', href: '/shop/contact' },
    { label: 'FAQs', href: '/shop/faqs' },
    { label: 'Terms & Conditions', href: '/shop/terms' },
    { label: 'Privacy Policy', href: '/shop/privacy' }
  ],
  resources: [
    { label: 'Gift Cards', href: '/shop/gift-cards' },
    { label: 'Sitemap', href: '/shop/sitemap' },
    { label: 'Store Locator', href: '/shop/stores' },
    { label: 'Wishlist', href: '/shop/wishlist' }
  ]
};
