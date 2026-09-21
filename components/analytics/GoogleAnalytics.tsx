import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      {/* ga-disable-<ID> is GA's official opt-out flag, and gtag.js checks it on
          every hit. As a getter it switches off on /admin paths even after the
          tag has loaded: HideOnAdmin stops GA loading when /admin is the first
          page, but a public page followed by Back into /admin keeps the loaded
          tag, and its history page_views would record /admin/staff/<uuid>. */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          try {
            Object.defineProperty(window, 'ga-disable-${GA_ID}', {
              configurable: true,
              get: function () { return /^\\/admin(\\/|$)/.test(location.pathname); }
            });
          } catch (e) {}
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
