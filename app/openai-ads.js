export const OPENAI_ADS_PIXEL_ID = "WXbg9YKU1XMGg1YsKMgPc5";
export const OPENAI_ADS_LEAD_EVENT = "lead_created";

export function trackOpenAiAdsLead(
  targetWindow = typeof window === "undefined" ? undefined : window,
) {
  if (typeof targetWindow?.oaiq !== "function") return false;

  targetWindow.oaiq("measure", OPENAI_ADS_LEAD_EVENT, {
    type: "customer_action",
  });
  return true;
}

export function createOpenAiAdsPixelScript() {
  const pixelId = JSON.stringify(OPENAI_ADS_PIXEL_ID);
  const leadEvent = JSON.stringify(OPENAI_ADS_LEAD_EVENT);

  return `
!function(w,d,s,u){
  if(w.oaiq)return;
  var q=function(){q.q.push(arguments)};
  q.q=[];
  w.oaiq=q;
  var js=d.createElement(s);
  js.async=true;
  js.src=u;
  var f=d.getElementsByTagName(s)[0];
  f.parentNode.insertBefore(js,f);
}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");

window.oaiq("init",{pixelId:${pixelId}});

document.addEventListener("click",function(event){
  if(event.defaultPrevented)return;
  var target=event.target;
  var link=target&&typeof target.closest==="function"
    ? target.closest("a[href]")
    : null;
  if(!link)return;

  try{
    var url=new URL(link.href,window.location.href);
    var hostname=url.hostname.toLowerCase();
    var isWhatsApp=
      url.protocol==="whatsapp:"||
      hostname==="wa.me"||
      hostname==="whatsapp.com"||
      hostname.endsWith(".whatsapp.com");

    if(isWhatsApp){
      window.oaiq("measure",${leadEvent},{type:"customer_action"});
    }
  }catch(_error){}
});
`;
}
