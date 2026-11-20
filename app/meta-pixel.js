export const META_PIXEL_ID = "1368316108208840";
export const META_PIXEL_LEAD_EVENT = "Lead";

export function trackMetaPixelLead(
  targetWindow = typeof window === "undefined" ? undefined : window,
) {
  if (typeof targetWindow?.fbq !== "function") return false;

  targetWindow.fbq("track", META_PIXEL_LEAD_EVENT);
  return true;
}

export function createMetaPixelNoscriptUrl() {
  return `https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`;
}

export function createMetaPixelScript() {
  const pixelId = JSON.stringify(META_PIXEL_ID);
  const leadEvent = JSON.stringify(META_PIXEL_LEAD_EVENT);

  return `
!function(w,d,s,u,id){
  if(w.__verbovideoMetaPixelInitialized)return;
  w.__verbovideoMetaPixelInitialized=true;

  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;
    n=f.fbq=function(){
      n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)
    };
    if(!f._fbq)f._fbq=n;
    n.push=n;
    n.loaded=true;
    n.version="2.0";
    n.queue=[];
    t=b.createElement(e);
    t.async=true;
    t.src=v;
    s=b.getElementsByTagName(e)[0];
    if(s&&s.parentNode){
      s.parentNode.insertBefore(t,s);
    }else if(b.head){
      b.head.appendChild(t);
    }
  }(w,d,s,u);

  w.fbq("init",id);
  w.fbq("track","PageView");

  d.addEventListener("click",function(event){
    if(event.defaultPrevented)return;
    var target=event.target;
    var link=target&&typeof target.closest==="function"
      ? target.closest("a[href]")
      : null;
    if(!link)return;

    try{
      var url=new URL(link.href,w.location.href);
      var hostname=url.hostname.toLowerCase();
      var isWhatsApp=
        url.protocol==="whatsapp:"||
        hostname==="wa.me"||
        hostname==="whatsapp.com"||
        hostname.endsWith(".whatsapp.com");

      if(isWhatsApp){
        w.fbq("track",${leadEvent});
      }
    }catch(_error){}
  });
}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js",${pixelId});
`;
}
