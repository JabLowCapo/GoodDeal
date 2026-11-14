'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const roots = ['autotraders.ae','carswitch.com','dubicars.com','dubizzle.com','opensooq.com','yallamotor.com'];
  const safeUrl = (value, listing) => {
    try { const u = new URL(value); if(u.protocol !== 'https:' || u.username || u.password || u.hash || u.port || !u.hostname.includes('.') || /^\d+(\.\d+){3}$/.test(u.hostname) || u.hostname.endsWith('.local')) return null;
      if(u.search && (listing || u.hostname!=='dbz-images.dubizzle.com' || !/^\?impolicy=[A-Za-z0-9_-]{1,64}$/.test(u.search)))return null;
      if(listing && !roots.some(h => u.hostname === h || u.hostname.endsWith('.'+h))) return null; return u.href;
    } catch { return null; }
  };
  const state = value => value === 'Qualified' ? 'yes' : value === 'NotQualified' ? 'no' : 'unknown';
  const urgency = row => row.urgencyAnalysisState === 'Analyzed' ? row.urgencyIndicator === true ? 'yes' : row.urgencyIndicator === false ? 'no' : 'unknown' : 'unknown';
  const signals = row => [state(row.l2Status),state(row.l3Status),state(row.ageToMileageStatus),urgency(row),state(row.priceDropStatus)];
  const number = value => Number.isFinite(value) ? new Intl.NumberFormat('en-AE',{maximumFractionDigits:0}).format(value) : '—';
  const node = (tag, cls, text) => { const el=document.createElement(tag); if(cls)el.className=cls; if(text!==undefined)el.textContent=text; return el; };
  const date = value => { const d=new Date(value); if(!value || !Number.isFinite(d.getTime()))return null; return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dubai',day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}).format(d)+' UAE (UTC+4)'; };
  let rows=[], visible=[], shown=0, loaded=false, hasAnalysis=false;
  const pageSize=40;
  function card(row) {
    const a=node('a','card'); a.href=safeUrl(row.originalUrl,true); a.target='_blank';a.rel='noopener noreferrer';
    a.setAttribute('aria-label',`${row.modelYear} ${row.make} ${row.model}, ${number(row.currentPrice)} ${row.currency}. Open original listing`);
    const fallback=()=>node('div','photo placeholder'); const url=safeUrl(row.primaryImageUrl,false);
    if(url){const img=node('img','photo');img.src=url;img.alt=`${row.make} ${row.model}`;img.loading='lazy';img.referrerPolicy='no-referrer';img.width=172;img.height=126;img.addEventListener('error',()=>img.replaceWith(fallback()),{once:true});a.append(img);}else a.append(fallback());
    const body=node('div','vehicle');body.append(node('div','source',`${row.marketplace} · ${row.modelYear}`),node('h3','vehicle-title',[row.make,row.model,row.trim].filter(Boolean).join(' ')),node('div','price',`${row.currency} ${number(row.currentPrice)}`));
    if(row.firstObservedPrice != null)body.append(node('div','first-price',`First seen at ${row.currency} ${number(row.firstObservedPrice)}`));
    if(Number.isFinite(row.priceDropAmount) && row.priceDropAmount>0)body.append(node('div','price-change',`Down ${row.currency} ${number(row.priceDropAmount)}${Number.isFinite(row.priceDropPercent)?' · '+row.priceDropPercent.toFixed(1)+'%':''}`));
    body.append(node('div','usage',`${row.mileageKm == null ? 'Mileage unavailable' : number(row.mileageKm)+' km'} · ${number(row.daysListed)} days listed`));
    if(row.averageAnnualMileage!=null)body.append(node('div','usage',`${number(row.averageAnnualMileage)} km/year on average`));
    const end=node('div','card-end'), indicators=node('div','indicators');
    signals(row).forEach((s,i)=>{const label=['L2','L3','Age/Mileage','Urgency','Price Drop'][i];const group=node('div','signal'); const icon=node('span','icon '+s,s==='yes'?'✓':s==='no'?'×':'−');icon.setAttribute('role','img');icon.setAttribute('aria-label',label+': '+(s==='yes'?'Qualified':s==='no'?'Not qualified':'Unknown'));group.append(node('span','',label),icon);indicators.append(group);});
    end.append(indicators,node('span','open','View original listing ↗'));a.append(body,end);return a;
  }
  function append(){const fragment=document.createDocumentFragment();visible.slice(shown,shown+pageSize).forEach(r=>fragment.append(card(r)));$('listings').append(fragment);shown=Math.min(shown+pageSize,visible.length);$('more').hidden=shown>=visible.length;}
  function render(){if(!loaded)return;const query=$('search').value.trim().toLocaleLowerCase(), marketplace=$('marketplace').value;
    visible=rows.filter(r=>(!marketplace || r.marketplace===marketplace) && [r.make,r.model,r.trim].join(' ').toLocaleLowerCase().includes(query));
    const sorts={'price-low':(a,b)=>a.currentPrice-b.currentPrice,'price-high':(a,b)=>b.currentPrice-a.currentPrice,'year-new':(a,b)=>b.modelYear-a.modelYear,'year-old':(a,b)=>a.modelYear-b.modelYear,'drop':(a,b)=>(b.priceDropPercent??-1)-(a.priceDropPercent??-1),'signals':(a,b)=>signals(b).filter(s=>s==='yes').length-signals(a).filter(s=>s==='yes').length,'recent':(a,b)=>new Date(b.firstSeenAt)-new Date(a.firstSeenAt)};
    visible.sort((a,b)=>(sorts[$('sort').value]||sorts.recent)(a,b)||a.marketplaceListingId-b.marketplaceListingId);
    $('listings').replaceChildren();shown=0;$('count').textContent=`${visible.length} of ${rows.length} listings`;
    $('message').hidden=visible.length>0;$('message').textContent=rows.length ? 'No listings match your filters.' : hasAnalysis ? 'No qualifying Good Deals are currently available.' : 'The shortlist is ready. Listings will appear after the first successful Good Deal analysis.';append();
  }
  async function load(){try{const response=await fetch('data/good-deals.json',{cache:'no-store'});if(!response.ok)throw new Error('unavailable'); const data=await response.json();
      if(data.schemaVersion!==1 || !Array.isArray(data.listings) || data.totalListings!==data.listings.length || !Number.isSafeInteger(data.snapshotId) || data.snapshotId<0 || (data.snapshotId>0 && !date(data.lastGoodDealRunUtc)))throw new Error('invalid snapshot');
      if(data.listings.some(r=>!safeUrl(r.originalUrl,true)||!Number.isFinite(r.currentPrice)||typeof r.make!=='string'||typeof r.model!=='string'))throw new Error('invalid listing');
      rows=data.listings;loaded=true;hasAnalysis=data.snapshotId>0;$('updated').textContent='Last Good Deal Update: '+(date(data.lastGoodDealRunUtc)||'awaiting the first successful analysis');$('total').textContent=`Total Good Deals: ${rows.length}`;
      [...new Set(rows.map(r=>r.marketplace))].sort().forEach(m=>{const option=node('option','',m);option.value=m;$('marketplace').append(option);});render();
      if(data.snapshotId===0 && rows.length===0)$('message').textContent='The shortlist is ready. Listings will appear after the first successful Good Deal analysis.';
    }catch{$('message').hidden=false;$('message').textContent='The latest shortlist could not be loaded. Please refresh to try again.';$('updated').textContent='Last Good Deal Update: unavailable';$('total').textContent='Total Good Deals: unavailable';}}
  $('search').addEventListener('input',render);$('marketplace').addEventListener('change',render);$('sort').addEventListener('change',render);$('more').addEventListener('click',append);load();
})();
