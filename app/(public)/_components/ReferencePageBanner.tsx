import Link from "next/link";

export function ReferencePageBanner({ title, image = "/arnav/images/about-banner.jpg" }: { title: string; image?: string }) {
  return (
    <section className="rs-page-banner" style={{ backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.62),rgba(0,0,0,.18)),url("${image}")` }}>
      <div className="rs-page-banner__inner">
        <p>REALSPACE</p>
        <h1>{title}</h1>
        <div className="rs-breadcrumb"><Link href="/">Home</Link><span>/</span><span>{title}</span></div>
      </div>
    </section>
  );
}

