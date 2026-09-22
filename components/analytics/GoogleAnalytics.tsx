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
          // First page_view with the landing URL from <head>, not the URL when
          // gtag.js gets around to processing it. On a slow connection a quick
          // tap on a nav link could change the URL first, and the session would
          // lose its UTM tags (reported as Direct). Set per event, not in
          // config: a config page_location sticks to every later event.
          // Enhanced measurement still sends the in-site history page_views.
          gtag('config', '${GA_ID}', { send_page_view: false });
          gtag('event', 'page_view', { page_location: window.__landingHref || location.href });
        `}
      </Script>
    </>
  );
}
