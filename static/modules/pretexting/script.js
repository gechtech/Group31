(function() {
  // Get all input elements
  const inputs = document.querySelectorAll('input[type="text"]');
  const aiBtn = document.getElementById('btn-ai');
  const aiResult = document.getElementById('ai-result');

  // AI Analysis functionality
  aiBtn.addEventListener('click', async function() {
    const formData = {};
    inputs.forEach(input => {
      const label = input.previousElementSibling.textContent;
      formData[label] = input.value;
    });
    
    // Check if any fields are filled
    const filledFields = Object.values(formData).filter(value => value.trim() !== '').length;
    
    if (filledFields === 0) {
      alert('Please fill in some information to analyze.');
      return;
    }
    
    aiResult.innerHTML = '<div class="status">Analyzing with AI...</div>';
    
    try {
      const res = await fetch('/api/analyze-pretexting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          request_data: formData,
          filled_fields_count: filledFields
        })
      });
      
      if (!res.ok) {
        throw new Error(`Server error ${res.status}: ${await res.text()}`);
      }
      
      const data = await res.json();
      renderAIAnalysis(data);
    } catch (err) {
      aiResult.innerHTML = `<div class="status err">Error: ${err.message}</div>`;
    }
  });

  function renderAIAnalysis(data) {
    const { risk_score, reasoning, recommendations } = data;
    const statusClass = risk_score >= 7 ? 'err' : risk_score >= 4 ? 'warn' : 'ok';
    
    aiResult.innerHTML = `
      <div class="status ${statusClass}">
        <strong>AI Pretexting Analysis Result</strong>
        <div class="mt-2"><strong>Risk Score:</strong> ${risk_score}/10</div>
        <div class="mt-2"><strong>Analysis:</strong> ${reasoning}</div>
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
