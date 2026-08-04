import { useState } from 'react';
import { useContent } from '../content.jsx';
import { PageBanner, Testimonials, CtaBand, QuoteForm } from '../components/Shared.jsx';

export default function BeforeAfter() {
  const { beforeAfter } = useContent();
  const [lightbox, setLightbox] = useState(null);

  return (
    <>
      <PageBanner title="Before & After" crumb="Before & After" />

      <section>
        <div className="container">
          <div className="center" style={{ marginBottom: 40 }}>
            <div className="eyebrow">Our Work</div>
            <h2 className="h2">See the Dozeles Professional Cleaning Difference</h2>
          </div>
          <div className="gallery">
            {beforeAfter.map((img) => (
              <img
                key={img}
                src={img}
                alt="Before and after cleaning"
                loading="lazy"
                style={{ cursor: 'zoom-in' }}
                onClick={() => setLightbox(img)}
              />
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(6,20,28,0.88)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 24,
          }}
        >
          <img src={lightbox} alt="Enlarged" style={{ maxHeight: '90vh', maxWidth: '100%', borderRadius: 12 }} />
        </div>
      )}

      <Testimonials heading="What People Say" />

      <section>
        <div className="container split">
          <div>
            <div className="eyebrow">Get a Quote</div>
            <h2 className="h2">Fast, easy, and commitment-free</h2>
            <p className="lead">
              Contact us today for a personalized cleaning quote tailored to your specific needs.
            </p>
          </div>
          <QuoteForm />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
