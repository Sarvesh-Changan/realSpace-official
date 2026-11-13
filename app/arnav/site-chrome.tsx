import Link from "next/link";

type ContactSettings = { brokerName: string; phone: string | null; altPhone: string | null; email: string | null; address: string | null };
const links = [
  ["Home", "/arnav/"], ["About Us", "/arnav/about.html"],
  ["Selling Services", "/arnav/selling.html"], ["Buying Services", "/arnav/buying.html"],
  ["Renting Services", "/arnav/renting.html"], ["Properties", "/arnav/properties.html"],
  ["Contact", "/arnav/contact-us.html"],
];

export function ArnavHeader({ settings }: { settings: ContactSettings | null }) {
  const phone = settings?.phone || "+91 98336 36699";
  const altPhone = settings?.altPhone || "+91 98929 36599";
  const email = settings?.email || "sales@arnavproperties.com";
  return <header className="header-section header-position container-fluid no-padding">
    <div className="top-header container-fluid no-padding"><div className="container"><div className="row">
      <div className="logo-block col-md-3"><Link href="/arnav/"><img src="/arnav/images/logo.png" alt="Arnav Properties" /></Link></div>
      <div className="col-md-9 contact-detail">
        <div className="phone"><img src="/arnav/images/phone-ic.png" alt=""/><h6>contact us</h6><a href={`tel:${phone.replace(/\s/g, "")}`}>{phone},</a> <a href={`tel:${altPhone.replace(/\s/g, "")}`}>{altPhone}</a></div>
        <div className="address"><img src="/arnav/images/mail.png" alt=""/><h6>our mail</h6><a href={`mailto:${email}`}>{email}</a></div>
      </div>
    </div></div></div>
    <div className="menu-block"><div className="container"><div className="row"><div className="col-md-12">
      <nav className="navbar navbar-default ow-navigation"><div className="navbar-header"><Link href="/arnav/" className="navbar-brand"><img src="/arnav/images/logo2.png" alt="Arnav Properties"/></Link></div>
        <ul className="nav navbar-nav">{links.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
      </nav>
    </div></div></div></div>
  </header>;
}

export function ArnavFooter({ settings }: { settings: ContactSettings | null }) {
  const email = settings?.email || "sales@arnavproperties.com";
  return <footer className="footer-main container-fluid no-padding">
    <div className="container"><div className="row">
      <div className="col-md-4"><Link href="/arnav/"><img src="/arnav/images/logo2.png" alt="Arnav Properties"/></Link><p>Helping you find the property of your dreams.</p></div>
      <div className="col-md-4"><h3>Quick Links</h3>{links.map(([label, href]) => <p key={href}><Link href={href}>{label}</Link></p>)}</div>
      <div className="col-md-4"><h3>Contact Us</h3><p>{settings?.address || "Thane, Maharashtra"}</p><p><a href={`mailto:${email}`}>{email}</a></p><p>{settings?.phone || "+91 98336 36699"}</p></div>
    </div><div className="copyright"><p>Copyright © {new Date().getFullYear()} Arnav Properties. All rights reserved.</p></div></div>
  </footer>;
}
