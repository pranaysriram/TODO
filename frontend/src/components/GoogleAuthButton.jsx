import React, { useEffect, useRef, useState } from 'react';

export default function GoogleAuthButton({ onLogin }) {
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    const handleCredentialResponse = async (response) => {
      if (!response || !response.credential) return;
      setLoading(true);
      try {
        // Exchange id_token with backend for app JWT
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: response.credential })
        });
        if (!res.ok) throw new Error('Auth exchange failed');
        const data = await res.json();
        // Store access token and user
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onLogin) onLogin(data.access_token, data.user);
      } catch (e) {
        console.error('Google auth exchange error', e);
      } finally {
        setLoading(false);
      }
    };

    if (window.google && window.google.accounts && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        // render the Google button into our ref
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'medium'
          });
        }
      } catch (e) {
        console.warn('Google accounts init failed', e);
      }
    }
  }, [onLogin]);

  return (
    <div className="flex items-center gap-2">
      <div ref={buttonRef} />
      {loading && <div className="text-sm text-muted-foreground">Signing in...</div>}
    </div>
  );
}
