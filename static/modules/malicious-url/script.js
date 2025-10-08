(function(){
  const urlInput = document.getElementById('url-input');
  const result = document.getElementById('result');

  const phishingDomains = [
    "paypal-login.com","secure-update.net","apple-verify.com","ply.gg","bankofamerica-login.net",
    "login-microsoftsecure.com","facebook-securityalert.com","google-verifyaccount.com","amazon-updatebilling.com",
    "outlook-websecure.com","servio.net","chase-banklogin.com","icloud-securityverify.com","dropbox-loginsecure.com",
    "instagram-security-alert.com","linkedin-updateaccount.com","yahoo-mailverify.com","wellsfargo-securelogin.com",
    "microsoft-supportverify.com","citibank-onlineverify.com","camphish.io","hsbc-securebanking.com","netflix-accountverify.com",
    "steamcommunity-loginsecure.com","playit.gg","tiktok-verificationsecure.com","snapchat-loginverify.com"
  ];
  
  const trustedDomains = [
    "google.com","youtube.com","facebook.com","amazon.com","microsoft.com","apple.com","netflix.com",
    "paypal.com","ebay.com","twitter.com","instagram.com","linkedin.com","github.com","stackoverflow.com",
    "wikipedia.org","reddit.com","dropbox.com","zoom.us","adobe.com","salesforce.com","office.com",
    "gmail.com","outlook.com","yahoo.com","bing.com","whatsapp.com","telegram.org","discord.com",
    "spotify.com","twitch.tv","steam.com","cnn.com","bbc.com","nytimes.com","washingtonpost.com"
  ];
  const suspiciousKeywords = [
    "login","secure","verify","update","account","password","signin","webmail","auth","ply.gg",
    "authentication","billing","confirm","credentials","idcheck","validate","banking","support","unlock",
    "security","reset","verification","recover","access","renew"
  ];

  function renderStatus(score, reasoning, recommendations){
    let cls = 'ok';
    if (score === -1) cls = 'warn';
    else if (score >= 7) cls = 'err';
    else if (score >= 3) cls = 'warn';
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
    
    // Check protocol
    const isHttps = url.startsWith('https://');
    const isHttp = url.startsWith('http://');
    
    // Check for known phishing domains
    const matchedDomain = phishingDomains.find(d => url.includes(d));
    if (matchedDomain) { 
      score = 10; 
      reasons.push(`DANGEROUS: Known phishing domain detected (${matchedDomain})`); 
      renderStatus(score, reasons.join(' '), [
        'DO NOT VISIT THIS WEBSITE',
        'This is a confirmed phishing/malicious domain',
        'Block this URL immediately',
        'Report to security team'
      ]);
      return;
    }
    
    // Check for trusted domains with HTTPS
    const matchedTrusted = trustedDomains.find(d => url.includes(d));
    if (matchedTrusted && isHttps) {
      score = 0;
      reasons.push(`SAFE: Trusted domain with secure HTTPS connection (${matchedTrusted})`);
      renderStatus(score, reasons.join(' '), [
        'This website is safe to visit',
        'Verified trusted domain with secure connection'
      ]);
      return;
    }
    
    // Check protocol security
    if (isHttp) {
      score += 3;
      reasons.push('WARNING: Insecure HTTP connection (not encrypted)');
    } else if (isHttps) {
      score -= 1;
      reasons.push('Secure HTTPS connection detected');
    }
    
    // Check suspicious keywords
    const matched = suspiciousKeywords.filter(k => url.includes(k));
    if (matched.length){ score += matched.length * 1.5; reasons.push(`Contains suspicious keywords: ${matched.join(', ')}`); }
    
    if (score < 0) score = 0;
    if (score > 10) score = 10;
    
    renderStatus(score, reasons.length ? reasons.join(' ') : 'No obvious security indicators found.', score > 5 ? [
      'Exercise caution with this link','Verify the source before clicking','Consider using HTTPS version if available'
    ] : ['Appears relatively safe, but always verify the source']);
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

  // Extension modal functionality
  const modal = document.getElementById('extensionModal');
  const closeBtn = document.querySelector('.close');
  const addExtBtn = document.getElementById('btn-add-ext');
  
  if (addExtBtn && modal && closeBtn) {
    addExtBtn.addEventListener('click', function(){
      modal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', function(){
      modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event){
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Download function
  window.downloadExtension = function() {
    const link = document.createElement('a');
    link.href = '/download/extension';
    link.download = 'safe-browse-guard-extension.rar';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle back home if button exists
  const backBtn = document.getElementById('btn-back-home');
  if (backBtn) {
    backBtn.addEventListener('click', function(){
      window.parent.location.href = '/';
    });
  }
})();