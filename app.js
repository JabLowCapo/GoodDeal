'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const brandFilter = $('exclude-chinese-brands');
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
  const numberFormat = new Intl.NumberFormat('en-AE',{maximumFractionDigits:0});
  const number = value => Number.isFinite(value) ? numberFormat.format(value) : '—';
  const node = (tag, cls, text) => { const el=document.createElement(tag); if(cls)el.className=cls; if(text!==undefined)el.textContent=text; return el; };
  const dateFormat = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dubai',day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true});
  const date = value => { const d=new Date(value); return value && Number.isFinite(d.getTime()) ? dateFormat.format(d)+' UAE (UTC+4)' : null; };
  const levels = {Supported:3, Limited:2, Review:1};
  const reasons = {ExportOnly:'Advertised for export only',ConflictingYear:'Title and model year disagree',UnknownMileage:'Mileage unavailable',
    ZeroMileage:'Listing reports zero mileage',RegionUnavailable:'No specific region for comparison',SmallRegionalSample:'Too few same-region listings',
    WideAskingRange:'Comparable prices vary widely',MedianBelowThreshold:'Regional asking prices do not support the qualifying discount',OlderSighting:'Sighting outside the recent verification window',
    PossibleCrossPost:'Another marketplace has the same price and precise odometer reading',MileageEvidenceLimited:'Too few comparable listings with similar mileage',MileagePricesDisagree:'Similar-mileage asking prices do not support the qualifying discount'};
  const evidenceLevel = row => Object.hasOwn(levels,row.priceEvidence?.level) ? row.priceEvidence.level : 'Unassessed';
  const byRecent = (a,b) => Date.parse(b.firstSeenAt)-Date.parse(a.firstSeenAt);
  const evidenceRank = (a,b) => (levels[evidenceLevel(b)] ?? 0)-(levels[evidenceLevel(a)] ?? 0) || byRecent(a,b);
  function makeKey(make) {
    return (make ?? '').normalize('NFKC').toLowerCase().replace(/[أإآ]/g, 'ا')
      .replace(/[\s._'’\p{Pd}\u0640\u064B-\u0652\u200E\u200F]/gu, '');
  }
  // Exact make labels, including spellings used by UAE marketplaces.
  const excludedMakes = new Set([
    'BYD', 'Build Your Dreams', 'بي واي دي',
    'Changan', 'Changan Auto', 'Changan Automobile', 'شانجان', 'تشنجان',
    'JAC', 'JAC Motor', 'JAC Motors', 'جاك', 'جاك موتورز',
    'Jetour', 'جيتور',
    'MG', 'MG Motor', 'MG Motors', 'Morris Garages', 'ام جي',
    'Geely', 'Geely Auto', 'جيلي',
    'GAC', 'GAC Motor', 'GAC Motors', 'جي إي سي', 'جي إيه سي',
    'Haval', 'GWM Haval', 'Great Wall Haval', 'هافال',
    'Chery', 'Chery Automobile', 'شيري',
    'Exeed', 'Chery Exeed', 'إكسيد',
    'Hongqi', 'FAW Hongqi', 'هونشي', 'هونغشي',
    'XPeng', 'XPeng Motors', 'اكس بنغ', 'إكس بينج',
    'Zeekr', 'زيكر',
  ].map(makeKey));
  let rows=[], visible=[], shown=0, loaded=false, hasAnalysis=false;
  const pageSize=40;
  function card(row) {
    const a=node('a','card'); a.href=safeUrl(row.originalUrl,true); a.target='_blank';a.rel='noopener noreferrer';
    const vehicleName=[row.make?.trim(),row.model].filter(Boolean).join(' ');
    a.setAttribute('aria-label',`${row.modelYear} ${vehicleName}, ${number(row.currentPrice)} ${row.currency}. Open original listing`);
    const fallback=()=>node('div','photo placeholder'); const url=safeUrl(row.primaryImageUrl,false);
    if(url){const img=node('img','photo');img.src=url;img.alt=vehicleName;img.loading='lazy';img.referrerPolicy='no-referrer';img.width=172;img.height=126;img.addEventListener('error',()=>img.replaceWith(fallback()),{once:true});a.append(img);}else a.append(fallback());
    const body=node('div','vehicle');body.append(node('div','source',`${row.marketplace} · ${row.modelYear}`),node('h3','vehicle-title',[vehicleName,row.trim].filter(Boolean).join(' ')),node('div','price',`${row.currency} ${number(row.currentPrice)}`));
    if(row.firstObservedPrice != null)body.append(node('div','first-price',`First seen at ${row.currency} ${number(row.firstObservedPrice)}`));
    if(Number.isFinite(row.priceDropAmount) && row.priceDropAmount>0)body.append(node('div','price-change',`Down ${row.currency} ${number(row.priceDropAmount)}${Number.isFinite(row.priceDropPercent)?' · '+row.priceDropPercent.toFixed(1)+'%':''}`));
    body.append(node('div','usage',`${row.mileageKm == null ? 'Mileage unavailable' : number(row.mileageKm)+' km'} · ${number(row.daysListed)} days listed`));
    if(row.averageAnnualMileage!=null)body.append(node('div','usage',`${number(row.averageAnnualMileage)} km/year on average`));
    const evidence = row.priceEvidence;
    if(evidenceLevel(row)!=='Unassessed'){
      body.append(node('div','evidence-level',`Price evidence · ${evidence.level}`));
      if(evidence.region)body.append(node('div','usage',`Regional specification · ${evidence.region}`));
      if(Number.isFinite(evidence.medianAskingPrice) && evidence.medianAskingPrice>0)
        body.append(node('div','usage',`Same-region median asking price · ${row.currency} ${number(evidence.medianAskingPrice)}`));
      const notes=Array.isArray(evidence.reasons) ? evidence.reasons.filter(reason=>Object.hasOwn(reasons,reason)).map(reason=>reasons[reason]) : [];
      if(notes.length)body.append(node('div','evidence-note',notes.join(' · ')));
    }
    if(date(row.lastSeenAt))body.append(node('div','usage',`Last seen · ${date(row.lastSeenAt)}`));
    const end=node('div','card-end'), indicators=node('div','indicators');
    signals(row).forEach((s,i)=>{const label=['L2','L3','Age/Mileage','Urgency','Price Drop'][i];const group=node('div','signal'); const icon=node('span','icon '+s,s==='yes'?'✓':s==='no'?'×':'−');icon.setAttribute('role','img');icon.setAttribute('aria-label',label+': '+(s==='yes'?'Qualified':s==='no'?'Not qualified':'Unknown'));group.append(node('span','',label),icon);indicators.append(group);});
    end.append(indicators,node('span','open','View original listing ↗'));a.append(body,end);return a;
  }
  function append(){const fragment=document.createDocumentFragment();visible.slice(shown,shown+pageSize).forEach(r=>fragment.append(card(r)));$('listings').append(fragment);shown=Math.min(shown+pageSize,visible.length);$('more').hidden=shown>=visible.length;}
  function render(){if(!loaded)return;const query=$('search').value.trim().toLocaleLowerCase(), marketplace=$('marketplace').value;
    const evidence=$('evidence').value, region=$('region').value;
    const excludeChineseBrands=brandFilter?.checked;
    visible=rows.filter(r=>(!excludeChineseBrands || !excludedMakes.has(makeKey(r.make))) &&
      (!marketplace || r.marketplace===marketplace) && (!evidence || evidenceLevel(r)===evidence) &&
      (!region || r.priceEvidence?.region===region) && [r.make,r.model,r.trim].join(' ').toLocaleLowerCase().includes(query));
    const sorts={'price-low':(a,b)=>a.currentPrice-b.currentPrice,'price-high':(a,b)=>b.currentPrice-a.currentPrice,'year-new':(a,b)=>b.modelYear-a.modelYear,'year-old':(a,b)=>a.modelYear-b.modelYear,'drop':(a,b)=>(b.priceDropPercent??-1)-(a.priceDropPercent??-1),'signals':(a,b)=>signals(b).filter(s=>s==='yes').length-signals(a).filter(s=>s==='yes').length,'recent':(a,b)=>new Date(b.firstSeenAt)-new Date(a.firstSeenAt)};
    sorts.evidence=evidenceRank;
    visible.sort((a,b)=>(sorts[$('sort').value]||evidenceRank)(a,b)||a.marketplaceListingId-b.marketplaceListingId);
    $('listings').replaceChildren();shown=0;$('count').textContent=`${visible.length} of ${rows.length} listings`;
    $('message').hidden=visible.length>0;$('message').textContent=rows.length ? 'No listings match your filters.' : hasAnalysis ? 'No qualifying Good Deals are currently available.' : 'The shortlist is ready. Listings will appear after the first successful Good Deal analysis.';append();
  }
  async function load(){try{const response=await fetch('data/good-deals.json',{cache:'no-store'});if(!response.ok)throw new Error('unavailable'); const data=await response.json();
      if(data.schemaVersion!==1 || !Array.isArray(data.listings) || data.totalListings!==data.listings.length || !Number.isSafeInteger(data.snapshotId) || data.snapshotId<0 || (data.snapshotId>0 && !date(data.lastGoodDealRunUtc)))throw new Error('invalid snapshot');
      const ids=new Set();
      if(data.snapshotId===0 && data.listings.length>0)throw new Error('invalid initial snapshot');
      for(const row of data.listings){
        if(!row || !Number.isSafeInteger(row.marketplaceListingId) || row.marketplaceListingId<=0 || ids.has(row.marketplaceListingId) ||
          !safeUrl(row.originalUrl,true) || !Number.isFinite(row.currentPrice) || row.currentPrice<=0 ||
          (row.make!=null && typeof row.make!=='string') || typeof row.model!=='string' || !row.model.trim())throw new Error('invalid listing');
        ids.add(row.marketplaceListingId);
      }
      rows=data.listings;loaded=true;hasAnalysis=data.snapshotId>0;$('updated').textContent='Last Good Deal Update: '+(date(data.lastGoodDealRunUtc)||'awaiting the first successful analysis');$('total').textContent=`Total Good Deals: ${rows.length}`;
      for(const [control,values] of [['marketplace',rows.map(r=>r.marketplace)],['region',rows.map(r=>r.priceEvidence?.region)]]){
        [...new Set(values.filter(Boolean))].sort().forEach(value=>{const option=node('option','',value);option.value=value;$(control).append(option);});
      }
      $('stale').hidden=!hasAnalysis || Date.now()-Date.parse(data.lastGoodDealRunUtc)<=48*60*60*1000;
      render();
      if(data.snapshotId===0 && rows.length===0)$('message').textContent='The shortlist is ready. Listings will appear after the first successful Good Deal analysis.';
    }catch{$('message').hidden=false;$('message').textContent='The latest shortlist could not be loaded. Please refresh to try again.';$('updated').textContent='Last Good Deal Update: unavailable';$('total').textContent='Total Good Deals: unavailable';}}
  $('search').addEventListener('input',render);
  for(const id of ['marketplace','region','evidence','sort'])$(id).addEventListener('change',render);
  brandFilter?.addEventListener('change',render);
  $('more').addEventListener('click',append);load();
})();
