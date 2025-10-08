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
  });

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
    }catch(err){
      const errorMsg = language === 'amharic' ? 'ኢሜይሉን በ AI መተንተን ላይ ስህተት።' : 'Error analyzing email with AI.';
      renderAI({ risk_score: -1, reasoning: err.message || errorMsg, recommendations: []});
    }
  });

  document.getElementById('btn-back-home').addEventListener('click', function(){
    window.parent.location.href = '/';
  });
})();


