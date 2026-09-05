import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default function CaptchaChallenge({ onVerify, error }) {
  const [num1, setNum1] = useState(3);
  const [num2, setNum2] = useState(4);
  const [userAnswer, setUserAnswer] = useState('');
  const [loadTime] = useState(() => Date.now());

  const generateChallenge = () => {
    const a = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const b = Math.floor(Math.random() * 7) + 1; // 1 to 7
    setNum1(a);
    setNum2(b);
    setUserAnswer('');
    if (onVerify) {
      onVerify({
        answer: '',
        expected: a + b,
        token: btoa(JSON.stringify({ a, b, sum: a + b, t: loadTime })),
        hp_website: ''
      });
    }
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  const handleChange = (e) => {
    const val = e.target.value.trim();
    setUserAnswer(val);
    if (onVerify) {
      onVerify({
        answer: val,
        expected: num1 + num2,
        token: btoa(JSON.stringify({ a: num1, b: num2, sum: num1 + num2, t: loadTime })),
        hp_website: ''
      });
    }
  };

  return (
    <div className="captcha-challenge-container" style={{
      background: 'rgba(241, 245, 249, 0.75)',
      border: error ? '1px solid #ef4444' : '1px solid #cbd5e1',
      borderRadius: '10px',
      padding: '12px 14px',
      marginTop: '12px',
      marginBottom: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontSize: '0.86rem'
    }}>
      {/* Invisible Honeypot Trap for Spam Bots */}
      <input
        type="text"
        name="hp_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: 'none', position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        onChange={(e) => onVerify && onVerify(prev => ({ ...prev, hp_website: e.target.value }))}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#1e293b', fontWeight: 600 }}>
          <ShieldCheck size={16} color="#0e5fd8" />
          <span>Security Verification</span>
        </div>
        <button
          type="button"
          onClick={generateChallenge}
          title="Get a new question"
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem'
          }}
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ color: '#334155', fontWeight: 500, fontSize: '0.85rem' }}>
          What is <strong style={{ color: '#0e5fd8', fontSize: '0.95rem' }}>{num1} + {num2}</strong> ?
        </label>
        <input
          type="number"
          required
          placeholder="Answer"
          value={userAnswer}
          onChange={handleChange}
          style={{
            width: '85px',
            padding: '6px 10px',
            borderRadius: '6px',
            border: error ? '1.5px solid #ef4444' : '1px solid #94a3b8',
            fontSize: '0.9rem',
            textAlign: 'center',
            fontWeight: 700,
            outline: 'none',
            background: '#fff',
            color: '#0f172a'
          }}
        />
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          (Protects against automated spam)
        </span>
      </div>

      {error && (
        <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}
