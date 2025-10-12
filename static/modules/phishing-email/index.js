// ...existing code...
(function(){
  const suspiciousKeywords = [
    // ===== English Keywords =====
    "urgent","immediate","verify","suspend","click here","act now","limited time",
    "congratulations","winner","free","prize","bank account","social security",
    "password","login","confirm","gift","credit card","update","security alert",
    "invoice","lottery","unusual activity","reset",

    // ===== Amharic Keywords =====
    "አሁኑኑ",          // Now / Immediately
    "አስቸኳይ",          // Urgent
    "እዚህ ጠቅ ያድርጉ",   // Click here
    "ያስረጉ",          // Verify
    "ያስተካክሉ",        // Update
    "ያረጋግጡ",         // Confirm
    "ማስታወቂያ",        // Alert
    "የባንክ አካውንት",     // Bank account
    "የድርሻ መለያ",      // Login/Account

    // ===== Afaan Oromo Keywords =====
    "amma",              // Now
    "balleessi",         // Suspend/Block
    "dhiheessi",         // Submit
    "mirkaneessi",       // Verify/Confirm
    "as tuqi",           // Click here
    "gatii tola",        // Free
    "gatii xiqqaa",      // Limited offer
    "lakkoofsa baankii", // Bank account
    "jecha darbii",      // Password
    "dorgommii mo'ataa"  // Winner
  ];

  // helper to safely build RegExp from arbitrary keyword
  function escapeRegExp(str){
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const emailAccount = document.getElementById('email-account');
  const emailContent = document.getElementById('email-content');
  const apiKeyInput = document.getElementById('api-key');
  const localResult = document.getElementById('local-result');
  const aiResult = document.getElementById('ai-result');
  const btnLocal = document.getElementById('btn-local');

  // ensure required DOM elements exist
  if (!btnLocal) {
    console.warn('phishing-email: btn-local not found — script initialization aborted.');
    return;
  }
  if (!emailContent || !localResult) {
    console.warn('phishing-email: required DOM elements missing (email-content or local-result).');
    // still attach a safe handler to avoid errors when clicked
    btnLocal.addEventListener('click', () => {
      localResult && (localResult.innerHTML = '<div class="panel warn">Missing required DOM elements.</div>');
    });
    return;
  }

  function renderLocal({ suspicious, keywords, score }){
    localResult.innerHTML = `
      <div class="panel ${suspicious ? 'warn' : 'ok'}">
        <div><strong>${suspicious ? 'Suspicious Email Detected!' : 'Email Appears Safe'}</strong></div>
        <div class="mt-2">Risk Score: ${score}/10</div>
        ${keywords.length ? `<div class="mt-2"><strong>Suspicious keywords:</strong> ${keywords.join(', ')}</div>` : ''}
      </div>
    `;
  }

  btnLocal.addEventListener('click', function(){
    const contentRaw = (emailContent.value || '');
    const contentLower = contentRaw.toLowerCase();

    // Match against both lowercase (for English) and raw text (for Amharic/Afaan Oromo)
    const found = suspiciousKeywords.filter(k => {
      try {
        const escaped = escapeRegExp(k);
        const regex = new RegExp(escaped, "i"); // safe, escaped
        return regex.test(contentRaw) || contentLower.includes(String(k).toLowerCase());
      } catch (e) {
        // fallback to simple substring check
        return contentLower.includes(String(k).toLowerCase());
      }
    });

    // unique matches
    const uniqueFound = Array.from(new Set(found));

    // debug: remove or keep as needed
    console.log("Matched keywords:", uniqueFound);

    const score = Math.min(uniqueFound.length, 10);
    const suspicious = score >= 1;
    renderLocal({ suspicious, keywords: uniqueFound, score });
  });

  
})();
 // ...existing code...