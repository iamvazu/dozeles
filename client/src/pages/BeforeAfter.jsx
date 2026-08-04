import { useContent } from '../content.jsx';
import { PageBanner, Testimonials, CtaBand, QuoteForm } from '../components/Shared.jsx';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider.jsx';

export default function BeforeAfter() {
  const { beforeAfter } = useContent();

  return (
    <>
      <PageBanner title="Before & After" crumb="Before & After" />

      <section>
        <div className="container">
          <div className="center" style={{ marginBottom: 40 }}>
            <div className="eyebrow">Our Work</div>
            <h2 className="h2">See the Dozeles Professional Cleaning Difference</h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {beforeAfter.map((item) => (
              <BeforeAfterSlider 
                key={item.id}
                title={item.title}
                beforeImage={item.before}
                afterImage={item.after}
              />
            ))}
          </div>
        </div>
      </section>

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
