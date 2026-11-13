export type WebsiteSectionDefault = {
  sectionKey: string;
  heading: string;
  body: string;
  buttonLabel: string;
  buttonUrl: string;
  imageUrl: string;
  imageAlt: string;
  isEnabled: boolean;
};

export const websitePageDefaults: Record<string, { title: string; description: string; sections: WebsiteSectionDefault[] }> = {
  home: {
    title: "Home",
    description: "REALSPACE property services and listings.",
    sections: [
      { sectionKey: "hero", heading: "Find Your Place with REALSPACE", body: "Property guidance shaped around your next move.", buttonLabel: "Explore Properties", buttonUrl: "/properties", imageUrl: "/arnav/images/slider/slide1.jpg", imageAlt: "Homes and properties", isEnabled: true },
      ...[1, 2, 3].map((n) => ({ sectionKey: `slide${n}`, heading: ["A Place to Call Home", "Buying · Selling · Renting", "Explore Your Property Options"][n - 1], body: "Explore property options with REALSPACE.", buttonLabel: "View Properties", buttonUrl: "/properties", imageUrl: `/arnav/images/slider/slide${n}.jpg`, imageAlt: `REALSPACE property slide ${n}`, isEnabled: true })),
      { sectionKey: "welcome", heading: "Property choices, made clearer.", body: "REALSPACE helps people navigate property decisions with clear communication and support from the first conversation to the next step.", buttonLabel: "About Us", buttonUrl: "/about", imageUrl: "/arnav/images/welcome/welcome-bg.jpg", imageAlt: "Residential property", isEnabled: true },
      { sectionKey: "services", heading: "Our Services", body: "Property support for buyers, sellers, owners and tenants.", buttonLabel: "View Services", buttonUrl: "/services", imageUrl: "", imageAlt: "", isEnabled: true },
      { sectionKey: "properties", heading: "Properties for Sale / Rent", body: "Browse available property listings.", buttonLabel: "Browse Properties", buttonUrl: "/properties", imageUrl: "", imageAlt: "", isEnabled: true },
      { sectionKey: "gallery", heading: "Property Gallery", body: "Explore images from our gallery.", buttonLabel: "View Gallery", buttonUrl: "/gallery", imageUrl: "", imageAlt: "", isEnabled: true },
      { sectionKey: "testimonials", heading: "Client Stories", body: "", buttonLabel: "", buttonUrl: "", imageUrl: "", imageAlt: "", isEnabled: true },
      { sectionKey: "faqs", heading: "Frequently Asked Questions", body: "", buttonLabel: "", buttonUrl: "", imageUrl: "", imageAlt: "", isEnabled: true },
      { sectionKey: "contact", heading: "How Can We Help?", body: "Talk with the REALSPACE team about your property requirements.", buttonLabel: "Contact Us", buttonUrl: "/contact", imageUrl: "", imageAlt: "", isEnabled: true },
      { sectionKey: "callback", heading: "Request a Callback", body: "", buttonLabel: "Request a Callback", buttonUrl: "/quote", imageUrl: "", imageAlt: "", isEnabled: true },
    ],
  },
  about: {
    title: "About Us",
    description: "Learn more about REALSPACE and our approach to property services.",
    sections: [
      { sectionKey: "hero", heading: "About Us", body: "", buttonLabel: "", buttonUrl: "", imageUrl: "/arnav/images/about-banner.jpg", imageAlt: "REALSPACE property banner", isEnabled: true },
      { sectionKey: "intro", heading: "A better way to find your place", body: "REALSPACE helps people make property decisions with clear information and local guidance. From exploring homes to taking the next step, our team is here to make the process easier to understand and navigate.", buttonLabel: "Get in Touch", buttonUrl: "/contact", imageUrl: "/arnav/images/welcome/welcome-bg.jpg", imageAlt: "Residential property", isEnabled: true },
      { sectionKey: "details", heading: "Property guidance centred around you", body: "We start by understanding what matters to you, explore available options, and support you as you move forward.", buttonLabel: "", buttonUrl: "", imageUrl: "", imageAlt: "", isEnabled: true },
      { sectionKey: "cta", heading: "Talk with REALSPACE", body: "", buttonLabel: "Contact Us", buttonUrl: "/contact", imageUrl: "", imageAlt: "", isEnabled: true },
    ],
  },
};
