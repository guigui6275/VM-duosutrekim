'use client';
import { useEffect } from 'react';

export default function FacebookLikeButton({ pageUrl }) {
  useEffect(() => {
    if (window.FB) {
      window.FB.XFBML.parse();
    } else {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v18.0';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }
  }, [pageUrl]);

  return (
    <div>
      <div id="fb-root"></div>
      <div
        className="fb-like"
        data-href={pageUrl}
        data-width=""
        data-layout="button_count"
        data-action="like"
        data-size="large"
        data-share="true"
      />
    </div>
  );
}