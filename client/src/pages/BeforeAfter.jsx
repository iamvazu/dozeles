import { useContent } from '../content.jsx';
import Seo from '../seo.jsx';
import { PageBanner, Testimonials, CtaBand, QuoteForm } from '../components/Shared.jsx';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider.jsx';

export default function BeforeAfter() {
  const { beforeAfter } = useContent();

  return (
    <>
      <Seo
        title="Before & After Cleaning Gallery | Dozeles Professional Cleaning"
        description="See real before and after cleaning results by Dozeles Professional Cleaning. Deep cleaning, carpet cleaning, tile scrubbing, and commercial office cleaning transformations."
        keywords={[
          'cleaning before and after',
          'commercial cleaning results',
          'janitorial transformation photos',
          'deep cleaning gallery',
          'bay area cleaning proof'
        ]}
        path="/before-after"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Before & After', path: '/before-after' }
        ]}
      />
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
