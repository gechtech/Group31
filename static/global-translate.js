// Global Translation System - One Button for Everything
class GlobalTranslator {
  constructor() {
    this.isTranslated = localStorage.getItem('amharic-mode') === 'true';
    this.translations = {
      // Main Dashboard
      'Security Awareness': 'የደህንነት ግንዛቤ',
      'Training Platform': 'የስልጠና መድረክ',
      'Phishing Email': 'የፊሺንግ ኢሜል',
      'Detect suspicious email content': 'የተጠራጣሪ ኢሜል ይዘት ይወቁ',
      'Malicious URL': 'የተጠራጣሪ አድራሻ',
      'Test link validity and safety': 'የአድራሻ ትክክለኛነት እና ደህንነት ይፈትሹ',
      'Baiting (File)': 'የፋይል መሳሪያ',
      'Check file extensions for threats': 'የፋይል አስተዳደር መስተጋብር ይፈትሹ',
      'Pretexting': 'የመረጃ መስጠት',
      'ID verification simulation': 'የመታወቂያ ካርድ መመሳከር',
      'Tailgating': 'የመደበር መከተል',
      'Security gate access simulation': 'የደህንነት አስመሳ መመሳከር',
      'Caller ID Spoofing': 'የጥሪ መታወቂያ ማስመሰል',
      'Phone number spoofing detection': 'የስልክ ቁጥር ማስመሰል መወቅ',
      'Quid Pro Quo': 'የመለዋወጥ መስጠት',
      'Security assessment quiz': 'የደህንነት መመዘን ጥያቄ',
      'Profile': 'መረጃ',
      
      // Module Content - Email Analysis
      'Email Analysis Tool': 'የኢሜል ትንተና መሳሪያ',
      'Scans for phishing keywords and AI analysis': 'የፊሺንግ ቃላት እና AI ትንተና ይፈልጋል',
      'Email Account': 'የኢሜል መለያ',
      'Email Content': 'የኢሜል ይዘት',
      'Paste the email content here...': 'የኢሜል ይዘቱን እዚህ ይለጥፉ...',
      'e.g. user@example.com': 'ምሳሌ user@example.com',
      'Paste the email content here...': 'የኢሜል ይዘቱን እዚህ ይለጥፉ...',
      'Keyword Analysis': 'የቃል ትንተና',
      'AI Analysis': 'AI ትንተና',
      
      // URL Analysis
      'URL Analysis Tool': 'የURL ትንተና መሳሪያ',
      'Enter URL to analyze': 'ለመተንተን URL ያስገቡ',
      'Analyze URL': 'URL ተንትን',
      'Check URL': 'URL ይፈትሹ',
      'Enter a URL to check': 'ለመፈተሽ URL ያስገቡ',
      
      // File Analysis
      'File Analysis Tool': 'የፋይል ትንተና መሳሪያ',
      'Upload File': 'ፋይል ይስቀሉ',
      'Analyze File': 'ፋይል ተንትን',
      'Choose File': 'ፋይል ይምረጡ',
      'Select a file to analyze': 'ለመተንተን ፋይል ይምረጡ',
      
      // Phone Analysis
      'Phone Analysis Tool': 'የስልክ ትንተና መሳሪያ',
      'Phone Number': 'የስልክ ቁጥር',
      'Enter phone number': 'የስልክ ቁጥር ያስገቡ',
      'Analyze Phone': 'ስልክ ተንትን',
      'Enter phone number to analyze': 'ለመተንተን የስልክ ቁጥር ያስገቡ',
      
      // Quid Pro Quo Questions and Content
      'Security Assessment Quiz': 'የደህንነት መመዘን ጥያቄ',
      'Test your security knowledge': 'የደህንነት እውቀትዎን ይፈትሹ',
      'Question': 'ጥያቄ',
      'Answer': 'መልስ',
      'True': 'እውነት',
      'False': 'ሀሰት',
      'Yes': 'አዎ',
      'No': 'አይ',
      'Correct': 'ትክክል',
      'Incorrect': 'ስህተት',
      'Score': 'ነጥብ',
      'Results': 'ውጤቶች',
      'Try Again': 'እንደገና ሞክር',
      'Start Quiz': 'ጥያቄ ጀምር',
      'Finish Quiz': 'ጥያቄ ጨርስ',
      'Your Score': 'የእርስዎ ነጥብ',
      'out of': 'ከ',
      'Excellent': 'በጣም ጥሩ',
      'Good': 'ጥሩ',
      'Fair': 'መካከለኛ',
      'Poor': 'ደካማ',
      
      // Common UI Elements
      'Submit': 'ላክ',
      'Reset': 'እንደገና አስጀምር',
      'Clear': 'አጽዳ',
      'Back': 'ተመለስ',
      'Next': 'ቀጣይ',
      'Previous': 'ቀደም',
      'Save': 'አስቀምጥ',
      'Cancel': 'ሰርዝ',
      'Close': 'ዝጋ',
      'Continue': 'ቀጥል',
      'Finish': 'ጨርስ',
      'Start': 'ጀምር',
      'Stop': 'አቁም',
      'Pause': 'ቆም',
      'Resume': 'ቀጥል',
      'Loading...': 'በመጫን ላይ...',
      'Please wait...': 'እባክዎ ይጠብቁ...',
      'Processing...': 'በማስኬድ ላይ...',
      
      // Analysis Results
      'Analysis Results': 'የትንተና ውጤቶች',
      'Risk Score': 'የአደጋ ነጥብ',
      'Risk Level': 'የአደጋ ደረጃ',
      'Recommendations': 'ምክሮች',
      'Details': 'ዝርዝሮች',
      'Summary': 'ማጠቃለያ',
      'Low Risk': 'ዝቅተኛ አደጋ',
      'Medium Risk': 'መካከለኛ አደጋ',
      'High Risk': 'ከፍተኛ አደጋ',
      'Critical Risk': 'ወሳኝ አደጋ',
      'Safe': 'ደህንነቱ የተጠበቀ',
      'Suspicious': 'ተጠራጣሪ',
      'Dangerous': 'አደገኛ',
      'Malicious': 'ተጠራጣሪ',
      
      // Educational Content Headers
      'Understanding': 'መረዳት',
      'What is': 'ምንድን ነው',
      'How to prevent': 'እንዴት መከላከል',
      'Common Tactics': 'የተለመዱ ዘዴዎች',
      'Prevention Strategies': 'የመከላከያ ስትራቴጂዎች',
      'Best Practices': 'ምርጥ ልምዶች',
      'Security Tips': 'የደህንነት ምክሮች',
      'Warning Signs': 'የማስጠንቀቂያ ምልክቶች',
      'Red Flags': 'የአደጋ ምልክቶች',
      'Key Points': 'ዋና ነጥቦች',
      'Important': 'አስፈላጊ',
      'Note': 'ማስታወሻ',
      'Tip': 'ምክር',
      'Remember': 'ያስታውሱ',
      
      // Specific Module Content
      'Phishing Email Detection': 'የፊሺንግ ኢሜል ማወቂያ',
      'What is Phishing Email?': 'የፊሺንግ ኢሜል ምንድን ነው?',
      'Phishing is a social engineering attack': 'ፊሺንግ የማህበራዊ ምህንድስና ጥቃት ነው',
      'Malicious URL Detection': 'የተጠራጣሪ URL ማወቂያ',
      'URL Security Check': 'የURL ደህንነት ፍተሻ',
      'File Security Analysis': 'የፋይል ደህንነት ትንተና',
      'Suspicious File Detection': 'የተጠራጣሪ ፋይል ማወቂያ',
      
      // Advice and Recommendations
      'Always verify sender identity': 'ሁልጊዜ የላኪውን ማንነት ያረጋግጡ',
      'Never click suspicious links': 'ተጠራጣሪ አገናኞችን በጭራሽ አይጫኑ',
      'Check URL carefully': 'URL በጥንቃቄ ይመልከቱ',
      'Verify file source': 'የፋይል ምንጭ ያረጋግጡ',
      'Use strong passwords': 'ጠንካራ የይለፍ ቃል ይጠቀሙ',
      'Enable two-factor authentication': 'ባለሁለት ደረጃ ማረጋገጫን ያንቁ',
      'Keep software updated': 'ሶፍትዌሩን ወቅታዊ ያድርጉ',
      'Be cautious with attachments': 'በተያያዥ ፋይሎች ላይ ጥንቃቄ ያድርጉ',
      'Report suspicious activity': 'ተጠራጣሪ እንቅስቃሴን ያሳውቁ',
      'Trust your instincts': 'በደመ ነፍስዎ ይመርኩ',
      
      // Error Messages
      'Error': 'ስህተት',
      'Invalid input': 'ልክ ያልሆነ ግቤት',
      'Please try again': 'እባክዎ እንደገና ይሞክሩ',
      'Connection failed': 'ግንኙነት አልተሳካም',
      'File too large': 'ፋይሉ በጣም ትልቅ ነው',
      'Unsupported format': 'ያልተደገፈ ቅርጸት',
      'Required field': 'የሚያስፈልግ መስክ',
      
      // Success Messages
      'Success': 'ተሳክቷል',
      'Analysis complete': 'ትንተና ተጠናቋል',
      'File uploaded successfully': 'ፋይል በተሳካ ሁኔታ ተስቀሏል',
      'Quiz completed': 'ጥያቄ ተጠናቋል',
      'Well done': 'በጣም ጥሩ',
      'Congratulations': 'እንኳን ደስ አለዎት',
      
      // Time and Progress
      'Time remaining': 'የቀረ ጊዜ',
      'Progress': 'እድገት',
      'Completed': 'ተጠናቋል',
      'In progress': 'በሂደት ላይ',
      'Not started': 'አልተጀመረም',
      'minutes': 'ደቂቃዎች',
      'seconds': 'ሰከንዶች',
      'hours': 'ሰዓቶች',
      
      // Navigation
      'Home': 'መነሻ',
      'Dashboard': 'ዳሽቦርድ',
      'Menu': 'ዝርዝር',
      'Settings': 'ቅንብሮች',
      'Help': 'እርዳታ',
      'About': 'ስለ',
      'Contact': 'ግንኙነት',
      'Logout': 'ውጣ',
      'Login': 'ግባ'
    };
    
    this.init();
  }
  
  init() {
    this.createGlobalButton();
    this.attachEventListeners();
    
    // Apply saved translation state
    if (this.isTranslated) {
      setTimeout(() => this.translateAll(), 100);
    }
  }
  
  createGlobalButton() {
    if (document.getElementById('globalTranslateBtn')) return;
    
    const button = document.createElement('button');
    button.id = 'globalTranslateBtn';
    button.innerHTML = `
      <i class="fas fa-language"></i>
      <span>${this.isTranslated ? 'English' : 'አማርኛ'}</span>
    `;
    button.title = this.isTranslated ? 'Switch to English' : 'Translate to Amharic';
    
    if (this.isTranslated) {
      button.classList.add('translating');
    }
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #globalTranslateBtn {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #16a34a;
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 9999;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      #globalTranslateBtn:hover {
        background: #15803d;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }
      
      #globalTranslateBtn.translating {
        background: #dc2626;
      }
      
      #globalTranslateBtn.translating:hover {
        background: #b91c1c;
      }
      
      @media (max-width: 768px) {
        #globalTranslateBtn {
          top: 10px;
          right: 10px;
          padding: 10px 14px;
          font-size: 12px;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(button);
  }
  
  attachEventListeners() {
    const button = document.getElementById('globalTranslateBtn');
    
    if (button) {
      button.addEventListener('click', () => {
        this.toggleTranslation();
      });
    }
  }
  
  toggleTranslation() {
    const button = document.getElementById('globalTranslateBtn');
    const span = button.querySelector('span');
    
    if (this.isTranslated) {
      this.restoreAll();
      button.classList.remove('translating');
      span.textContent = 'አማርኛ';
      button.title = 'Translate to Amharic';
      this.isTranslated = false;
      localStorage.setItem('amharic-mode', 'false');
    } else {
      this.translateAll();
      button.classList.add('translating');
      span.textContent = 'English';
      button.title = 'Switch to English';
      this.isTranslated = true;
      localStorage.setItem('amharic-mode', 'true');
    }
  }
  
  translateAll() {
    // Translate main page
    this.translateElements(document, 'h1, h2, h3, h4, h5, h6, p, span, div, label, button, a, li, td, th, .text-lg, .text-sm, .font-medium, .text-xs');
    this.translatePlaceholders(document, 'input, textarea, select');
    this.translateAttributes(document);
    
    // Translate module content in iframe
    this.translateModuleContent();
  }
  
  translateModuleContent() {
    const iframe = document.querySelector('#module-content iframe');
    if (iframe) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          this.translateElements(iframeDoc, 'h1, h2, h3, h4, h5, h6, p, span, div, label, button, a, li, td, th, option');
          this.translatePlaceholders(iframeDoc, 'input, textarea, select');
          this.translateAttributes(iframeDoc);
        }
      } catch (e) {
        // Cross-origin iframe, inject script instead
        this.injectTranslationScript(iframe);
      }
    }
  }
  
  injectTranslationScript(iframe) {
    try {
      const script = iframe.contentDocument.createElement('script');
      script.textContent = `
        const translations = ${JSON.stringify(this.translations)};
        
        function translateElement(el) {
          if (el.id === 'globalTranslateBtn' || el.closest('#globalTranslateBtn')) return;
          
          const text = el.textContent.trim();
          if (text && translations[text] && !el.getAttribute('data-original')) {
            el.setAttribute('data-original', text);
            el.textContent = translations[text];
          }
        }
        
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, label, button, a, li, td, th, option').forEach(translateElement);
        
        document.querySelectorAll('input, textarea, select').forEach(el => {
          const placeholder = el.placeholder;
          if (placeholder && translations[placeholder] && !el.getAttribute('data-original-placeholder')) {
            el.setAttribute('data-original-placeholder', placeholder);
            el.placeholder = translations[placeholder];
          }
        });
        
        document.querySelectorAll('[title]').forEach(el => {
          const title = el.title;
          if (title && translations[title] && !el.getAttribute('data-original-title')) {
            el.setAttribute('data-original-title', title);
            el.title = translations[title];
          }
        });
      `;
      iframe.contentDocument.head.appendChild(script);
    } catch (e) {
      console.log('Cannot inject translation script into iframe');
    }
  }
  
  translateElements(doc, selector) {
    doc.querySelectorAll(selector).forEach(el => {
      if (el.id === 'globalTranslateBtn' || el.closest('#globalTranslateBtn')) return;
      
      const text = el.textContent.trim();
      if (text && this.translations[text] && !el.getAttribute('data-original')) {
        el.setAttribute('data-original', text);
        el.textContent = this.translations[text];
      }
    });
  }
  
  translatePlaceholders(doc, selector) {
    doc.querySelectorAll(selector).forEach(el => {
      const placeholder = el.placeholder;
      if (placeholder && this.translations[placeholder] && !el.getAttribute('data-original-placeholder')) {
        el.setAttribute('data-original-placeholder', placeholder);
        el.placeholder = this.translations[placeholder];
      }
    });
  }
  
  translateAttributes(doc) {
    doc.querySelectorAll('[title]').forEach(el => {
      const title = el.title;
      if (title && this.translations[title] && !el.getAttribute('data-original-title')) {
        el.setAttribute('data-original-title', title);
        el.title = this.translations[title];
      }
    });
    
    doc.querySelectorAll('[alt]').forEach(el => {
      const alt = el.alt;
      if (alt && this.translations[alt] && !el.getAttribute('data-original-alt')) {
        el.setAttribute('data-original-alt', alt);
        el.alt = this.translations[alt];
      }
    });
  }
  
  restoreAll() {
    // Restore main page
    this.restoreElements(document);
    
    // Restore module content
    const iframe = document.querySelector('#module-content iframe');
    if (iframe) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          this.restoreElements(iframeDoc);
        }
      } catch (e) {
        // Cross-origin iframe, inject restore script
        this.injectRestoreScript(iframe);
      }
    }
  }
  
  restoreElements(doc) {
    doc.querySelectorAll('[data-original]').forEach(el => {
      el.textContent = el.getAttribute('data-original');
      el.removeAttribute('data-original');
    });
    
    doc.querySelectorAll('[data-original-placeholder]').forEach(el => {
      el.placeholder = el.getAttribute('data-original-placeholder');
      el.removeAttribute('data-original-placeholder');
    });
    
    doc.querySelectorAll('[data-original-title]').forEach(el => {
      el.title = el.getAttribute('data-original-title');
      el.removeAttribute('data-original-title');
    });
    
    doc.querySelectorAll('[data-original-alt]').forEach(el => {
      el.alt = el.getAttribute('data-original-alt');
      el.removeAttribute('data-original-alt');
    });
  }
  
  injectRestoreScript(iframe) {
    try {
      const script = iframe.contentDocument.createElement('script');
      script.textContent = `
        document.querySelectorAll('[data-original]').forEach(el => {
          el.textContent = el.getAttribute('data-original');
          el.removeAttribute('data-original');
        });
        
        document.querySelectorAll('[data-original-placeholder]').forEach(el => {
          el.placeholder = el.getAttribute('data-original-placeholder');
          el.removeAttribute('data-original-placeholder');
        });
        
        document.querySelectorAll('[data-original-title]').forEach(el => {
          el.title = el.getAttribute('data-original-title');
          el.removeAttribute('data-original-title');
        });
        
        document.querySelectorAll('[data-original-alt]').forEach(el => {
          el.alt = el.getAttribute('data-original-alt');
          el.removeAttribute('data-original-alt');
        });
      `;
      iframe.contentDocument.head.appendChild(script);
    } catch (e) {
      console.log('Cannot inject restore script into iframe');
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.globalTranslator = new GlobalTranslator();
});

// Also initialize on window load for iframes
window.addEventListener('load', () => {
  if (!window.globalTranslator) {
    window.globalTranslator = new GlobalTranslator();
  }
});