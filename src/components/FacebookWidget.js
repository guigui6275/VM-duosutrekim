'use client';
import { useEffect } from 'react';

export default function FacebookWidget({ pageUrl, tabs = 'timeline', height = 300 }) {
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
        className="fb-page"
        data-href={pageUrl}
        data-tabs={tabs}
        data-width="500"
        data-height={height}
        data-small-header="true"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="false"
      />
    </div>
  );
}