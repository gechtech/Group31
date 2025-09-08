(function () {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const analysisEl = document.getElementById('analysis');

  const dangerousExtensions = {
    critical: [".exe", ".bat", ".cmd", ".com", ".pif", ".scr", ".vbs", ".js", ".jar"],
    high: [".msi", ".deb", ".rpm", ".dmg", ".pkg", ".app", ".run"],
    medium: [".zip", ".rar", ".7z", ".tar", ".gz", ".iso", ".img"],
    low: [".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".pdf"],
  };

  function getRiskLevel(extension) {
    const ext = (extension || '').toLowerCase();
    if (dangerousExtensions.critical.includes(ext)) return 'critical';
    if (dangerousExtensions.high.includes(ext)) return 'high';
    if (dangerousExtensions.medium.includes(ext)) return 'medium';
    if (dangerousExtensions.low.includes(ext)) return 'low';
    return 'low';
  }

  function getWarnings(extension, riskLevel) {
    const warnings = [];
    const ext = (extension || '').toLowerCase();
    if (riskLevel === 'critical') {
      warnings.push('CRITICAL: This file type can execute code and install malware');
      if ([".exe", ".bat", ".cmd"].includes(ext)) {
        warnings.push('Never run executable files from unknown sources');
      }
      if ([".vbs", ".js"].includes(ext)) {
        warnings.push('Script files can perform malicious actions automatically');
      }
    } else if (riskLevel === 'high') {
      warnings.push('HIGH RISK: Installation packages can modify your system');
      warnings.push('Only install software from trusted sources');
    } else if (riskLevel === 'medium') {
      warnings.push('MEDIUM RISK: Archive files may contain hidden malware');
      warnings.push('Scan contents before extracting');
    } else if (riskLevel === 'low') {
      warnings.push('LOW RISK: Document files can contain macros or embedded content');
      warnings.push('Disable macros unless from trusted source');
    }
    return warnings;
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function analyzeFile(file) {
    const fileName = file.name;
    const extension = '.' + (fileName.split('.').pop() || '').toLowerCase();
    const size = formatFileSize(file.size);
    const riskLevel = getRiskLevel(extension);
    const warnings = getWarnings(extension, riskLevel);

    renderAnalysis({ fileName, extension, size, riskLevel, warnings });
  }

  function renderAnalysis(data) {
    const { fileName, extension, size, riskLevel, warnings } = data;
    analysisEl.classList.remove('hidden');
    analysisEl.innerHTML = `
      <div class="alert ${riskLevel}">
        <div class="title">Risk Level: ${riskLevel.toUpperCase()}</div>
        <div class="grid two">
          <div><strong>File:</strong> ${fileName}</div>
          <div><strong>Extension:</strong> ${extension}</div>
          <div><strong>Size:</strong> ${size}</div>
        </div>
      </div>
      ${warnings.length ? `
        <div class="card">
          <div class="card-header"><div class="card-title small">Security Warnings</div></div>
          <div class="card-content">
            <ul class="list-dots">
              ${warnings.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
        </div>
      ` : ''}
    `;
  }

  dropzone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', function (e) {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  });
  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) analyzeFile(file);
  });

  fileInput.addEventListener('change', function (e) {
    const file = e.target.files && e.target.files[0];
    const fileNameEl = document.getElementById('file-name');
    
    if (file) {
      fileNameEl.textContent = file.name;
      analyzeFile(file);
    } else {
      fileNameEl.textContent = 'No file chosen';
    }
  });

  // AI Analysis functionality
  document.getElementById('btn-keyword').addEventListener('click', function() {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      alert('Please select a file first');
      return;
    }
    analyzeFile(file);
  });

  document.getElementById('btn-ai').addEventListener('click', async function() {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      alert('Please select a file first');
      return;
    }
    
    analysisEl.innerHTML = '<div class="alert">Analyzing with AI...</div>';
    analysisEl.classList.remove('hidden');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/analyze-file', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        throw new Error(`Server error ${res.status}: ${await res.text()}`);
      }
      
      const data = await res.json();
      renderAIAnalysis(data);
    } catch (err) {
      analysisEl.innerHTML = `<div class="alert critical">Error: ${err.message}</div>`;
    }
  });

  function renderAIAnalysis(data) {
    const { risk_score, reasoning, recommendations, file_info } = data;
    analysisEl.innerHTML = `
      <div class="alert ${risk_score >= 7 ? 'critical' : risk_score >= 4 ? 'high' : 'low'}">
        <div class="title">AI Analysis Result</div>
        <div class="grid two">
          <div><strong>File:</strong> ${file_info.fileName}</div>
          <div><strong>Extension:</strong> ${file_info.extension}</div>
          <div><strong>Size:</strong> ${file_info.size}</div>
          <div><strong>Risk Score:</strong> ${risk_score}/10</div>
        </div>
        <div class="mt-2"><strong>AI Reasoning:</strong> ${reasoning}</div>
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


