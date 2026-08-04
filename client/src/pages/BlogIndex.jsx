import { Link } from 'react-router-dom';
import Seo from '../seo.jsx';
import { PageBanner } from '../components/Shared.jsx';
import Reveal from '../components/Reveal.jsx';
import { BLOG_POSTS } from '../data/blog.js';

export default function BlogIndex() {
  return (
    <>
      <Seo
        title="Commercial Cleaning & Janitorial Blog | Dozeles Professional Cleaning"
        description="Expert insights on commercial cleaning, janitorial services, eco-friendly practices, and property maintenance in the Bay Area."
        keywords={['cleaning blog', 'janitorial tips', 'commercial cleaning advice']}
        path="/blog"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' }
        ]}
      />
      <PageBanner title="Our Blog" crumb="Blog" />

      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <Reveal className="center" style={{ marginBottom: 48 }}>
            <div className="eyebrow">Cleaning Insights</div>
            <h2 className="h2">Latest Articles</h2>
            <p className="lead">Actionable advice on maintaining a spotless, healthy environment for your business or home.</p>
          </Reveal>

          <div className="grid grid-3">
            {BLOG_POSTS.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 110}>
                <Link to={`/blog/${post.slug}`} className="blog-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div className="img-wrap" style={{ overflow: 'hidden', borderRadius: '18px', marginBottom: '16px', height: '220px' }}>
                    <img 
                      src={post.img} 
                      alt={post.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} 
                    />
                  </div>
                  <div style={{ padding: '0 10px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                      {post.tag} &bull; {post.date}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', lineHeight: 1.3 }}>{post.title}</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>{post.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
