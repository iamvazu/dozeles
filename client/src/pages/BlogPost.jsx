import { useParams, Navigate, Link } from 'react-router-dom';
import Seo from '../seo.jsx';
import { PageBanner } from '../components/Pseo.jsx';
import { getBlogPost } from '../data/blog.js';
import Icon from '../components/Icon.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const post = getBlogPost(slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <Seo
        title={`${post.title} | Dozeles Cleaning`}
        description={post.excerpt}
        keywords={post.keywords}
        path={`/blog/${post.slug}`}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` }
        ]}
      />
      
      <div style={{ background: 'var(--surface)', padding: '60px 0 20px', borderBottom: '1px solid var(--line)' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', marginBottom: 24, fontSize: '0.9rem', fontWeight: 600 }}>
            <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} size={14} /> Back to Blog
          </Link>
          <div style={{ color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, fontSize: '0.9rem' }}>
            {post.tag} &bull; {post.date}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, marginBottom: 24, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--muted)', fontSize: '0.95rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
              <Icon name="smile" />
            </div>
            <div>Written by <strong>{post.author}</strong></div>
          </div>
        </div>
      </div>

      <div className="container split" style={{ maxWidth: 1100, margin: '60px auto', alignItems: 'start', gridTemplateColumns: '1fr 340px' }}>
        <article className="blog-content">
          <img src={post.img} alt={post.title} style={{ width: '100%', borderRadius: 16, marginBottom: 40, maxHeight: 500, objectFit: 'cover' }} />
          <div className="prose" style={{ fontSize: '1.1rem', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <aside style={{ position: 'sticky', top: 120 }}>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 20, padding: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Need Professional Cleaning?</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: '0.95rem' }}>
              Dozeles provides highly rated commercial and residential cleaning across the Bay Area.
            </p>
            <ul className="checklist" style={{ marginBottom: 24 }}>
              <li>Fully Licensed & Insured</li>
              <li>Eco-Friendly Products</li>
              <li>Vetted & Trained Crews</li>
            </ul>
            <Link to="/book" className="btn btn-blue" style={{ width: '100%', textAlign: 'center' }}>Get a Free Quote</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
