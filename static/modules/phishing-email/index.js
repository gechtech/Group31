(function(){
  const suspiciousKeywords = [
    "urgent","immediate","verify","suspend","click here","act now","limited time","congratulations","winner","free","prize","bank account","social security","password","login","confirm"
  ];

  const emailAccount = document.getElementById('email-account');
  const emailContent = document.getElementById('email-content');
  const apiKeyInput = document.getElementById('api-key');
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
    const found = suspiciousKeywords.filter(k => content.includes(k.toLowerCase()));
    const score = found.length;
    const suspicious = score >= 2;
    renderLocal({ suspicious, keywords: found, score });
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
    const apiKey = (apiKeyInput.value || '').trim();
    if (!apiKey){
      renderAI({ risk_score: -1, reasoning: 'Missing Groq API key. Provide one to use AI analysis.', recommendations: [] });
      return;
    }
    aiResult.textContent = 'Analyzing...';
    try{
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: `You are an AI email security analyzer. Return ONLY valid JSON in the following format:\n{\n  "risk_score": number between 0 and 10,\n  "reasoning": "short explanation of why",\n  "recommendations": ["step 1", "step 2"]\n}` },
            { role: 'user', content: `Analyze this email for phishing and malicious intent:\nEmail Account: ${account}\nEmail Content: ${content}` }
          ],
          temperature: 0.2
        })
      });
      if (!res.ok){ throw new Error(`Groq API error ${res.status}: ${await res.text()}`); }
      const data = await res.json();
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      renderAI(parsed);
    }catch(err){
      renderAI({ risk_score: -1, reasoning: err.message || 'Error analyzing email with AI.', recommendations: []});
    }
  });
})();


