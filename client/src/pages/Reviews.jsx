import { useContent } from '../content.jsx';
import Seo from '../seo.jsx';
import { PageBanner, Testimonials, CtaBand } from '../components/Shared.jsx';

export default function Reviews() {
  const { faqs, gallery } = useContent();
  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <>
      <Seo
        title="Client Reviews & Testimonials | Dozeles Professional Cleaning"
        description="Read real client reviews and ratings for Dozeles Professional Cleaning. Top-rated commercial janitorial and residential house cleaning across the Bay Area."
        keywords={[
          'dozeles cleaning reviews',
          'cleaning company testimonials',
          'bay area cleaning ratings',
          'reliable janitorial reviews',
          'customer feedback commercial cleaning'
        ]}
        path="/reviews"
        faqs={faqs}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Reviews', path: '/reviews' }
        ]}
      />
      <PageBanner title="Reviews" crumb="Reviews" />
      <Testimonials heading="What People Say About Us" />

      <section>
        <div className="container">
          <div className="center" style={{ marginBottom: 40 }}>
            <div className="eyebrow">FAQ</div>
            <h2 className="h2">Frequently Asked Questions</h2>
          </div>
          <div className="grid grid-2" style={{ alignItems: 'start' }}>
            {categories.map((cat) => (
              <div key={cat}>
                <h3 style={{ marginBottom: 16 }}>{cat}</h3>
                {faqs.filter((f) => f.category === cat).map((f) => (
                  <details className="faq-item" key={f.q}>
                    <summary>{f.q}</summary>
                    <div>{f.a}</div>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="gallery" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {gallery.map((g) => <img key={g} src={g} alt="Dozeles Professional Cleaning at work" loading="lazy" />)}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
