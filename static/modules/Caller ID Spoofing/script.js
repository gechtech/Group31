(function(){
  const input = document.getElementById('v-phone');
  const analyzeBtn = document.getElementById('btn-analyze');
  const result = document.getElementById('v-result');

  function analyzeNumber(value){
    const phone = (value || '').replace(/\s+/g,'');
    if(!phone){ result.innerHTML = ''; return; }

    const looksLikeUS = /^(\+1)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}$/.test(phone);
    const repeated = /(\d)\1{5,}/.test(phone);
    const sequential = /(0123|1234|2345|3456|4567|5678|6789)/.test(phone);
    const hasShortCode = /^\d{3,6}$/.test(phone);

    let flags = [];
    if(!looksLikeUS) flags.push('Non‑standard format');
    if(repeated) flags.push('Repeated digits');
    if(sequential) flags.push('Sequential digits');
    if(hasShortCode) flags.push('Suspicious short code');

    if(flags.length === 0){
      result.innerHTML = '<div class="status ok">No obvious spoofing patterns found. Stay cautious and verify caller identity.</div>';
    } else {
      result.innerHTML = '<div class="status warn"><strong>Potential indicators:</strong> ' + flags.join(', ') + '</div>';
    }
  }

  // Keyword Analysis
  document.getElementById('btn-keyword').addEventListener('click', function(){
    analyzeNumber(input.value);
  });

  // AI Analysis
  document.getElementById('btn-ai').addEventListener('click', async function(){
    const phone = input.value.trim();
    if (!phone) {
      alert('Please enter a phone number first');
      return;
    }
    
    result.innerHTML = '<div class="status">Analyzing with AI...</div>';
    
    try {
      const res = await fetch('/api/analyze-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone })
      });
      
      if (!res.ok) {
        throw new Error(`Server error ${res.status}: ${await res.text()}`);
      }
      
      const data = await res.json();
      renderAIAnalysis(data);
    } catch (err) {
      result.innerHTML = `<div class="status err">Error: ${err.message}</div>`;
    }
  });

  function renderAIAnalysis(data) {
    const { risk_score, reasoning, recommendations } = data;
    const statusClass = risk_score >= 7 ? 'err' : risk_score >= 4 ? 'warn' : 'ok';
    
    result.innerHTML = `
      <div class="status ${statusClass}">
        <strong>AI Analysis Result</strong>
        <div class="mt-2"><strong>Risk Score:</strong> ${risk_score}/10</div>
        <div class="mt-2"><strong>Reasoning:</strong> ${reasoning}</div>
        ${recommendations && recommendations.length ? `
          <div class="mt-2">
            <strong>Recommendations:</strong>
            <ul class="list-dots">
              ${recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  document.getElementById('btn-back-home').addEventListener('click', function(){
    window.parent.location.href = '/';
  });
})();

