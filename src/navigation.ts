import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    // {
    //   text: 'About',
    //   href: getPermalink('/about'),
    // },
    {
      text: 'Services & Tools',
      href: getPermalink('tools', 'category'),
    },
    {
      text: 'News',
      href: getPermalink('news', 'category'),
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
    // {
    //   text: 'Bio',
    //   href: getPermalink('/bio'),
    // },
  ],
  // actions: [{ text: 'Download', href: 'https://github.com/arthelokyo/astrowind', target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: 'Quick Navigation',
      links: [
        // { text: 'About', href: getPermalink('/about') },
        { text: 'Services & Tools', href: getPermalink('tools', 'category') },
        { text: 'News', href: getPermalink('news', 'category') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
    {
      title: 'Company Info',
      htmlContent: `
      <p>PiQ Mind Single Member P.C.</p>
      <p>Komninon 80, GR55132, Kalamaria, Greece</p>
      <p>info@piqmind.com</p>`,
    },
  ],
  secondaryLinks: [{ text: 'Privacy Policy', href: getPermalink('/privacy') }],
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: '#' },
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: '#' },
  ],
  footNote: `
    Copyright © 2026 PiQ Mind. All rights reserved.
  `,
};
