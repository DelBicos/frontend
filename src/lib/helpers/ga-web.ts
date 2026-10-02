export function initGAWeb(idGA: string) {
  if (typeof window === 'undefined') return;
  if (document.getElementById('ga4-script')) return;

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${idGA}`;
  script1.id = 'ga4-script';

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${idGA}');
  `;

  document.head.appendChild(script1);
  document.head.appendChild(script2);
}
