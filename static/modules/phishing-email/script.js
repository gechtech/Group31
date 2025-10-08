(function(){
  const suspiciousKeywords = [
    "urgent","immediate","verify","suspend","click here","act now","limited time","congratulations","winner","free","prize","bank account","social security","password","login","confirm"
  ];
  
  const amharicKeywords = [
    "አስቸኳይ","ወዲያውኑ","ያረጋግጡ","ያቁሙ","እዚህ ይጫኑ","አሁን ይንቀሳቀሱ","የተወሰነ ጊዜ","እንኳን ደስ አላችሁ","አሸናፊ","ነፃ","ሽልማት","የባንክ ሂሳብ","ማህበራዊ ደህንነት","የይለፍ ቃል","መግቢያ","ያረጋግጡ"
  ];

  const emailAccount = document.getElementById('email-account');
  const emailContent = document.getElementById('email-content');
  const localResult = document.getElementById('local-result');
  const aiResult = document.getElementById('ai-result');

  function renderLocal({ suspicious, keywords, score }){
    localResult.innerHTML = `
      <div class="panel ${suspicious ? 'warn' : 'ok'}">
        <div><strong>${suspicious ? 'Suspicious Email Detected!' : 'Email Appears Safe'}</strong></div>
        <div class="mt-2">Risk Score: ${score}/10</div>
        ${keywords.length ? `<div class="mt-2"><strong>Suspicious keywords:</strong> ${keywords.join(', ')}</div>` : ''}
      </div>
    `;
  }

  document.getElementById('btn-local').addEventListener('click', function(){
    const content = (emailContent.value || '').toLowerCase();
    
    if (!content.trim()) {
      localResult.innerHTML = '<div class="panel warn"><strong>Please enter email content to analyze</strong></div>';
      return;
    }
    
    const englishFound = suspiciousKeywords.filter(k => content.includes(k));
    const amharicFound = amharicKeywords.filter(k => content.includes(k));
    const allFound = [...englishFound, ...amharicFound];
    const score = Math.min(allFound.length * 2, 10);
    const suspicious = allFound.length >= 2;
    renderLocal({ suspicious, keywords: allFound, score });
    
    // Check for URLs in email content
    checkUrlsInContent(content);
  });
  
  async function checkUrlsInContent(content) {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = content.match(urlRegex);
    const urlResult = document.getElementById('url-result');
    
    if (urls && urls.length > 0) {
      urlResult.innerHTML = '<div class="alert info"><div class="title">Analyzing URLs...</div></div>';
      
      let urlAnalysis = [];
      
      for (const url of urls) {
        try {
          const res = await fetch('/api/analyze-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
          });
          
          const data = await res.json();
          urlAnalysis.push({
            url: url,
            risk_score: data.risk_score,
            reasoning: data.reasoning
          });
        } catch (err) {
          urlAnalysis.push({
            url: url,
            risk_score: -1,
            reasoning: 'Analysis failed'
          });
        }
      }
      
      const highestRisk = Math.max(...urlAnalysis.map(u => u.risk_score));
      
      urlResult.innerHTML = `
        <div class="alert ${highestRisk >= 7 ? 'error' : highestRisk >= 4 ? 'warn' : 'info'}">
          <div class="title">URL Analysis Results</div>
          ${urlAnalysis.map(u => `
            <div class="mt-2" style="border-left:3px solid ${u.risk_score >= 7 ? '#ef4444' : u.risk_score >= 4 ? '#f59e0b' : '#22c55e'};padding-left:8px">
              <div><strong>URL:</strong> ${u.url}</div>
              <div><strong>Risk Score:</strong> ${u.risk_score}/10</div>
              <div><strong>Analysis:</strong> ${u.reasoning}</div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Track phishing URLs for admin
      urlAnalysis.forEach(u => {
        if (u.risk_score >= 7) {
          trackPhishingUrl(u.url, u.risk_score, u.reasoning);
        }
      });
    } else {
      urlResult.innerHTML = '';
    }
  }

  function renderAI({ risk_score, reasoning, recommendations }){
    aiResult.innerHTML = `
      <div class="panel ${risk_score >= 7 ? 'err' : 'ok'}">
        <div><strong>${risk_score === -1 ? 'AI Analysis Failed' : `AI Phishing Risk Score: ${risk_score}/10`}</strong></div>
        <div class="mt-2"><strong>Reasoning:</strong> ${reasoning}</div>
        ${recommendations?.length ? `<div class="mt-2"><strong>Recommendations:</strong><ul class="list-dots">${recommendations.map(r=>`<li>${r}</li>`).join('')}</ul></div>` : ''}
      </div>
    `;
  }

  document.getElementById('btn-ai').addEventListener('click', async function(){
    const account = (emailAccount.value || '').trim();
    const content = (emailContent.value || '').trim();
    if (!account && !content) return;
    
    const language = LanguageUtils.getCurrentLanguage();
    const analyzingText = language === 'amharic' ? 'በ AI በመተንተን ላይ...' : 'Analyzing with AI...';
    aiResult.textContent = analyzingText;
    
    // Also analyze file if uploaded and URLs in content
    analyzeFileIfUploaded();
    checkUrlsInContent(content);
    
    try{
      const res = await fetch('/api/analyze-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_account: account,
          email_content: content,
          language: language
        })
      });
      
      if (!res.ok){ 
        throw new Error(`Server error ${res.status}: ${await res.text()}`); 
      }
      
      const data = await res.json();
      renderAI(data);
      
      // Track phishing emails for admin
      if (data.risk_score >= 7) {
        trackPhishingEmail(account, content, data.risk_score);
      }
    }catch(err){
      const errorMsg = language === 'amharic' ? 'ኢሜይሉን በ AI መተንተን ላይ ስህተት።' : 'Error analyzing email with AI.';
      renderAI({ risk_score: -1, reasoning: err.message || errorMsg, recommendations: []});
    }
  });

  // File Analysis
  const fileInput = document.getElementById('file-input');
  const fileResult = document.getElementById('file-result');
  
  async function analyzeFileIfUploaded() {
    const file = fileInput.files[0];
    if (!file) {
      fileResult.innerHTML = '';
      return;
    }
    
    fileResult.innerHTML = '<div class="alert info"><div class="title">Analyzing file...</div></div>';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try{
      const res = await fetch('/api/analyze-file', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      fileResult.innerHTML = `
        <div class="alert ${data.risk_score >= 7 ? 'error' : data.risk_score >= 4 ? 'warn' : 'success'}">
          <div class="title">File Analysis Results</div>
          <div class="mt-2"><strong>File:</strong> ${file.name}</div>
          <div><strong>Risk Score:</strong> ${data.risk_score}/10</div>
          <div><strong>Analysis:</strong> ${data.reasoning}</div>
          ${data.recommendations?.length ? `<div class="mt-2"><strong>Recommendations:</strong><ul class="list-dots">${data.recommendations.map(r=>`<li>${r}</li>`).join('')}</ul></div>` : ''}
        </div>
      `;
    }catch(err){
      fileResult.innerHTML = `<div class="alert error"><div class="title">File Analysis Error</div><div class="mt-2">${err.message}</div></div>`;
    }
  }
  
  async function trackPhishingEmail(email, content, riskScore) {
    try {
      await fetch('/api/track-phishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          content: content.substring(0, 200),
          risk_score: riskScore
        })
      });
    } catch (err) {
      console.log('Failed to track phishing email:', err);
    }
  }
  
  async function trackPhishingUrl(url, riskScore, reasoning) {
    try {
      await fetch('/api/track-phishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'URL: ' + url,
          content: reasoning,
          risk_score: riskScore
        })
      });
    } catch (err) {
      console.log('Failed to track phishing URL:', err);
    }
  }
  
  // Auto-load phishing emails when email account changes
  emailAccount.addEventListener('input', debounce(async function() {
    const account = (emailAccount.value || '').trim();
    if (!account) {
      document.getElementById('email-list').innerHTML = '';
      return;
    }
    
    try {
      const res = await fetch('/api/get-phishing-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account })
      });
      const data = await res.json();
      
      if (data.phishing_emails && data.phishing_emails.length > 0) {
        document.getElementById('email-list').innerHTML = `
          <div class="alert info">
            <div class="title">Found ${data.phishing_emails.length} phishing record(s) for this email</div>
            ${data.phishing_emails.map(e => `
              <div class="mt-2" style="border-left:3px solid #ef4444;padding-left:8px">
                <div><strong>Risk Score:</strong> ${e.risk_score}/10</div>
                <div><strong>Detected:</strong> ${new Date(e.detected_at).toLocaleString()}</div>
                <div><strong>Content:</strong> ${e.content}</div>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        document.getElementById('email-list').innerHTML = '';
      }
    } catch (err) {
      document.getElementById('email-list').innerHTML = '';
    }
  }, 500));
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
})();


