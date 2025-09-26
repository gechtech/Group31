(function(){
  const urlInput = document.getElementById('url-input');
  const result = document.getElementById('result');

  const phishingDomains = [
    "paypal-login.com","secure-update.net","apple-verify.com","ply.gg","bankofamerica-login.net",
    "login-microsoftsecure.com","facebook-securityalert.com","google-verifyaccount.com","amazon-updatebilling.com",
    "outlook-websecure.com","chase-banklogin.com","icloud-securityverify.com","dropbox-loginsecure.com",
    "instagram-security-alert.com","linkedin-updateaccount.com","yahoo-mailverify.com","wellsfargo-securelogin.com",
    "microsoft-supportverify.com","citibank-onlineverify.com","hsbc-securebanking.com","netflix-accountverify.com",
    "steamcommunity-loginsecure.com","tiktok-verificationsecure.com","snapchat-loginverify.com"
  ];
  const suspiciousKeywords = [
    "login","secure","verify","update","account","password","signin","webmail","auth","ply.gg",
    "authentication","billing","confirm","credentials","idcheck","validate","banking","support","unlock",
    "security","reset","verification","recover","access","renew"
  ];

  function renderStatus(score, reasoning, recommendations){
    let cls = 'ok';
    if (score === -1) cls = 'warn';
    else if (score >= 5) cls = 'err';
    result.innerHTML = `
      <div class="status ${cls}">
        <strong>${score === -1 ? 'Analysis Failed' : `Risk Score: ${score}/10`}</strong>
        <div class="mt-2"><strong>Reasoning:</strong> ${reasoning}</div>
        ${recommendations && recommendations.length ? `<div class="mt-2"><strong>Recommendations:</strong><ul class="list-dots">${recommendations.map(r=>`<li>${r}</li>`).join('')}</ul></div>`: ''}
      </div>
    `;
  }

  document.getElementById('btn-keyword').addEventListener('click', function(){
    const url = (urlInput.value || '').trim().toLowerCase();
    if (!url) return;
    let score = 0; const reasons = [];
    if (phishingDomains.some(d => url.includes(d))) { score += 8; reasons.push('Matches known phishing domain.'); }
    const matched = suspiciousKeywords.filter(k => url.includes(k));
    if (matched.length){ score += matched.length * 1.5; reasons.push(`Contains suspicious keywords: ${matched.join(', ')}`); }
    if (score > 10) score = 10;
    renderStatus(score, reasons.length ? reasons.join(' ') : 'No phishing indicators found.', score > 5 ? [
      'Do not click this link.','Report to your IT/security team.','Use a URL scanning service.'
    ] : ['Seems safe, but always verify the source.']);
  });

  document.getElementById('btn-ai').addEventListener('click', async function(){
    const url = (urlInput.value || '').trim();
    if (!url) return;
    
    result.textContent = 'Analyzing with AI...';
    try{
      const res = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });
      
      if (!res.ok){ 
        throw new Error(`Server error ${res.status}: ${await res.text()}`); 
      }
      
      const data = await res.json();
      renderStatus(data.risk_score ?? -1, data.reasoning || 'No reasoning provided', data.recommendations || []);
    }catch(err){
      renderStatus(-1, err.message || 'Error analyzing URL with AI.', []);
    }
  });

  document.getElementById('btn-add-ext').addEventListener('click', function(){
    alert('To add the extension:\n\n1. Open Chrome → Extensions (chrome://extensions/)\n2. Enable Developer Mode\n3. Click "Load unpacked"\n4. Select folder: Group31\\safe-browse-guard-extension');
  });

  document.getElementById('btn-back-home').addEventListener('click', function(){
    window.parent.location.href = '/';
  });
})();