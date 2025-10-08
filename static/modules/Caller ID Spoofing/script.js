(function(){
  const input = document.getElementById('v-phone');
  const result = document.getElementById('v-result');

  // High-risk area codes commonly used by scammers
  const scammerAreaCodes = {
    // Caribbean/International Premium Rate Numbers
    '809': { risk: 9, location: 'Dominican Republic', reason: 'Premium rate scam calls' },
    '829': { risk: 9, location: 'Dominican Republic', reason: 'Premium rate scam calls' },
    '849': { risk: 9, location: 'Dominican Republic', reason: 'Premium rate scam calls' },
    '876': { risk: 10, location: 'Jamaica', reason: 'Lottery/prize scams, very high fraud rate' },
    '473': { risk: 8, location: 'Grenada', reason: 'Romance/lottery scams' },
    '649': { risk: 8, location: 'Turks and Caicos', reason: 'Prize/sweepstakes scams' },
    '284': { risk: 7, location: 'British Virgin Islands', reason: 'Investment scams' },
    '268': { risk: 7, location: 'Antigua', reason: 'Lottery scams' },
    '664': { risk: 7, location: 'Montserrat', reason: 'Prize scams' },
    
    // US High-Risk Area Codes
    '712': { risk: 8, location: 'Iowa', reason: 'Conference call scams, robocalls' },
    '605': { risk: 7, location: 'South Dakota', reason: 'Telemarketing scams' },
    '218': { risk: 6, location: 'Minnesota', reason: 'IRS/tax scams' },
    '701': { risk: 6, location: 'North Dakota', reason: 'Tech support scams' },
    '406': { risk: 6, location: 'Montana', reason: 'Utility scams' },
    '307': { risk: 6, location: 'Wyoming', reason: 'Medicare scams' },
    '775': { risk: 5, location: 'Nevada', reason: 'Debt collection scams' },
    '702': { risk: 5, location: 'Nevada', reason: 'Timeshare scams' },
    '786': { risk: 5, location: 'Florida', reason: 'Health insurance scams' },
    '305': { risk: 5, location: 'Florida', reason: 'Credit card scams' }
  };

  function extractAreaCode(phone) {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.length === 11 && digits.startsWith('1')) {
      return digits.substring(1, 4); // +1XXXXXXXXXX
    } else if (digits.length === 10) {
      return digits.substring(0, 3); // XXXXXXXXXX
    } else if (digits.length === 7) {
      return null; // No area code
    }
    return digits.substring(0, 3); // Try first 3 digits
  }

  function analyzeAreaCode(phone) {
    if (!phone.trim()) {
      result.innerHTML = '';
      return;
    }

    const areaCode = extractAreaCode(phone);
    
    if (!areaCode) {
      result.innerHTML = '<div class="status warn">Unable to identify area code. Please enter a complete phone number.</div>';
      return;
    }

    const scamData = scammerAreaCodes[areaCode];
    
    if (scamData) {
      const statusClass = scamData.risk >= 8 ? 'err' : scamData.risk >= 6 ? 'warn' : 'ok';
      const riskLevel = scamData.risk >= 8 ? 'HIGH RISK' : scamData.risk >= 6 ? 'MEDIUM RISK' : 'LOW RISK';
      
      result.innerHTML = `
        <div class="status ${statusClass}">
          <strong>Area Code Analysis: ${areaCode}</strong>
          <div class="mt-2"><strong>Location:</strong> ${scamData.location}</div>
          <div class="mt-2"><strong>Risk Level:</strong> ${riskLevel} (${scamData.risk}/10)</div>
          <div class="mt-2"><strong>Common Scam Type:</strong> ${scamData.reason}</div>
          <div class="mt-2">
            <strong>Recommendations:</strong>
            <ul class="list-dots">
              ${scamData.risk >= 8 ? 
                '<li>DO NOT answer calls from this area code</li><li>Block this number immediately</li><li>Report to FTC if they called you</li>' :
                scamData.risk >= 6 ?
                '<li>Be extremely cautious - likely a scam</li><li>Never give personal information</li><li>Hang up and verify through official channels</li>' :
                '<li>Exercise normal caution</li><li>Verify caller identity before sharing information</li>'
              }
            </ul>
          </div>
        </div>
      `;
    } else {
      // Check if it's a valid US area code format
      const isValidFormat = /^[2-9]\d{2}$/.test(areaCode);
      
      if (isValidFormat) {
        result.innerHTML = `
          <div class="status ok">
            <strong>Area Code Analysis: ${areaCode}</strong>
            <div class="mt-2"><strong>Risk Level:</strong> LOW RISK (2/10)</div>
            <div class="mt-2"><strong>Status:</strong> This area code is not commonly associated with scam operations</div>
            <div class="mt-2">
              <strong>Recommendations:</strong>
              <ul class="list-dots">
                <li>Exercise normal caution when answering</li>
                <li>Still verify caller identity for sensitive requests</li>
                <li>Be aware that scammers can spoof any number</li>
              </ul>
            </div>
          </div>
        `;
      } else {
        result.innerHTML = `
          <div class="status warn">
            <strong>Invalid Area Code: ${areaCode}</strong>
            <div class="mt-2"><strong>Risk Level:</strong> MEDIUM RISK (5/10)</div>
            <div class="mt-2"><strong>Issue:</strong> Invalid or non-standard area code format</div>
            <div class="mt-2">
              <strong>Recommendations:</strong>
              <ul class="list-dots">
                <li>Be suspicious of invalid area codes</li>
                <li>This could indicate caller ID spoofing</li>
                <li>Do not answer or provide any information</li>
              </ul>
            </div>
          </div>
        `;
      }
    }
  }

  // Area Code Analysis
  document.getElementById('btn-analyze').addEventListener('click', function(){
    analyzeAreaCode(input.value);
  });

  // Auto-analyze on input change (optional)
  input.addEventListener('input', function() {
    if (this.value.replace(/\D/g, '').length >= 10) {
      analyzeAreaCode(this.value);
    }
  });

})();