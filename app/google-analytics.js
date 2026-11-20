export const GOOGLE_ANALYTICS_MEASUREMENT_ID = "G-W6ZQSCVBF1";
export const GOOGLE_ANALYTICS_LEAD_EVENT = "generate_lead";
export const GOOGLE_ANALYTICS_WHATSAPP_EVENT = "whatsapp_click";
export const GOOGLE_ANALYTICS_FORM_EVENT = "lead_form_submitted";

export function trackGoogleAnalyticsFormLead(
  { formName = "contact_form", selectedFormat = "" } = {},
  targetWindow = typeof window === "undefined" ? undefined : window,
) {
  if (typeof targetWindow?.gtag !== "function") return false;

  const details = {
    form_name: formName,
    lead_channel: "form_to_whatsapp",
    ...(selectedFormat ? { selected_format: selectedFormat } : {}),
    transport_type: "beacon",
  };

  targetWindow.gtag("event", GOOGLE_ANALYTICS_FORM_EVENT, details);
  targetWindow.gtag("event", GOOGLE_ANALYTICS_LEAD_EVENT, {
    method: "form_to_whatsapp",
    ...details,
  });
  return true;
}

export function createGoogleAnalyticsScript() {
  const measurementId = JSON.stringify(GOOGLE_ANALYTICS_MEASUREMENT_ID);
  const leadEvent = JSON.stringify(GOOGLE_ANALYTICS_LEAD_EVENT);
  const whatsappEvent = JSON.stringify(GOOGLE_ANALYTICS_WHATSAPP_EVENT);

  return `
!function(w,d,s,u,id){
  if(w.__verbovideoGa4Initialized)return;
  w.__verbovideoGa4Initialized=true;
  w.dataLayer=w.dataLayer||[];
  w.gtag=w.gtag||function(){w.dataLayer.push(arguments)};
  w.gtag("js",new Date());
  w.gtag("config",id);

  var js=d.createElement(s);
  js.async=true;
  js.id="google-analytics-gtag";
  js.src=u+"?id="+encodeURIComponent(id);
  var f=d.getElementsByTagName(s)[0];
  if(f&&f.parentNode){
    f.parentNode.insertBefore(js,f);
  }else if(d.head){
    d.head.appendChild(js);
  }

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
        var ariaLabel=typeof link.getAttribute==="function"
          ? link.getAttribute("aria-label")
          : "";
        var linkLabel=(ariaLabel||link.textContent||"")
          .replace(/\\s+/g," ")
          .trim()
          .slice(0,100);
        var pagePath=w.location.pathname||"/";
        var common={
          link_domain:hostname,
          link_label:linkLabel,
          page_path:pagePath,
          transport_type:"beacon"
        };

        w.gtag("event",${whatsappEvent},common);
        w.gtag("event",${leadEvent},{
          method:"whatsapp_link",
          lead_channel:"whatsapp",
          link_domain:common.link_domain,
          link_label:common.link_label,
          page_path:common.page_path,
          transport_type:common.transport_type
        });
      }
    }catch(_error){}
  });
}(window,document,"script","https://www.googletagmanager.com/gtag/js",${measurementId});
`;
}
