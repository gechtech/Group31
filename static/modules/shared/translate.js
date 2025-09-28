// Universal Translation Component for Security Training Modules
class AmharicTranslator {
  constructor() {
    this.isTranslated = false;
    this.translations = {
      // Common UI elements
      'Email Analysis Tool': 'የኢሜል ትንተና መሳሪያ',
      'Scans for phishing keywords and AI analysis': 'የፊሺንግ ቃላት እና AI ትንተና ይፈልጋል',
      'Email Account': 'የኢሜል መለያ',
      'Email Content': 'የኢሜል ይዘት',
      'Paste the email content here...': 'የኢሜል ይዘቱን እዚህ ይለጥፉ...',
      'Keyword Analysis': 'የቃል ትንተና',
      'AI Analysis': 'AI ትንተና',
      
      // URL Analysis
      'URL Analysis Tool': 'የURL ትንተና መሳሪያ',
      'Enter URL to analyze': 'ለመተንተን URL ያስገቡ',
      'Analyze URL': 'URL ተንትን',
      'Check URL': 'URL ይፈትሹ',
      
      // File Analysis
      'File Analysis Tool': 'የፋይል ትንተና መሳሪያ',
      'Upload File': 'ፋይል ይስቀሉ',
      'Analyze File': 'ፋይል ተንትን',
      'Choose File': 'ፋይል ይምረጡ',
      
      // Phone Analysis
      'Phone Analysis Tool': 'የስልክ ትንተና መሳሪያ',
      'Phone Number': 'የስልክ ቁጥር',
      'Enter phone number': 'የስልክ ቁጥር ያስገቡ',
      'Analyze Phone': 'ስልክ ተንትን',
      
      // Common buttons and actions
      'Submit': 'ላክ',
      'Reset': 'እንደገና አስጀምር',
      'Clear': 'አጽዳ',
      'Back': 'ተመለስ',
      'Next': 'ቀጣይ',
      'Previous': 'ቀደም',
      'Save': 'አስቀምጥ',
      'Cancel': 'ሰርዝ',
      'Close': 'ዝጋ',
      'Loading...': 'በመጫን ላይ...',
      'Please wait...': 'እባክዎ ይጠብቁ...',
      
      // Risk levels
      'Low Risk': 'ዝቅተኛ አደጋ',
      'Medium Risk': 'መካከለኛ አደጋ',
      'High Risk': 'ከፍተኛ አደጋ',
      'Safe': 'ደህንነቱ የተጠበቀ',
      'Suspicious': 'ተጠራጣሪ',
      'Dangerous': 'አደገኛ',
      
      // Common phrases
      'Understanding': 'መረዳት',
      'What is': 'ምንድን ነው',
      'How to prevent': 'እንዴት መከላከል',
      'Common Tactics': 'የተለመዱ ዘዴዎች',
      'Prevention Strategies': 'የመከላከያ ስትራቴጂዎች',
      'Best Practices': 'ምርጥ ልምዶች',
      'Security Tips': 'የደህንነት ምክሮች',
      
      // Phishing specific
      'Phishing Email Detection': 'የፊሺንግ ኢሜል ማወቂያ',
      'What is Phishing Email?': 'የፊሺንግ ኢሜል ምንድን ነው?',
      'Phishing is a social engineering attack': 'ፊሺንግ የማህበራዊ ምህንድስና ጥቃት ነው',
      
      // URL specific
      'Malicious URL Detection': 'የተጠራጣሪ URL ማወቂያ',
      'URL Security Check': 'የURL ደህንነት ፍተሻ',
      
      // File specific
      'File Security Analysis': 'የፋይል ደህንነት ትንተና',
      'Suspicious File Detection': 'የተጠራጣሪ ፋይል ማወቂያ',
      
      // Results
      'Analysis Results': 'የትንተና ውጤቶች',
      'Risk Score': 'የአደጋ ነጥብ',
      'Recommendations': 'ምክሮች',
      'Details': 'ዝርዝሮች'
    };
    
    this.init();
  }
  
  init() {
    this.createTranslateButton();
    this.attachEventListeners();
  }
  
  createTranslateButton() {
    // Check if button already exists
    if (document.getElementById('moduleTranslateBtn')) return;
    
    const button = document.createElement('button');
    button.id = 'moduleTranslateBtn';
    button.className = 'translate-btn-module';
    button.innerHTML = `
      <i class="fas fa-language"></i>
      <span id="moduleTranslateText">አማርኛ</span>
    `;
    button.title = 'Translate to Amharic';
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .translate-btn-module {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #16a34a;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      
      .translate-btn-module:hover {
        background: #15803d;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      
      .translate-btn-module.translating {
        background: #dc2626;
      }
      
      .translate-btn-module.translating:hover {
        background: #b91c1c;
      }
      
      @media (max-width: 768px) {
        .translate-btn-module {
          top: 10px;
          right: 10px;
          padding: 8px 12px;
          font-size: 12px;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(button);
  }
  
  attachEventListeners() {
    const button = document.getElementById('moduleTranslateBtn');
    const textSpan = document.getElementById('moduleTranslateText');
    
    if (button) {
      button.addEventListener('click', () => {
        if (this.isTranslated) {
          this.restoreOriginal();
          button.classList.remove('translating');
          textSpan.textContent = 'አማርኛ';
          this.isTranslated = false;
        } else {
          this.translateToAmharic();
          button.classList.add('translating');
          textSpan.textContent = 'English';
          this.isTranslated = true;
        }
      });
    }
  }
  
  translateToAmharic() {
    // Translate all text content
    this.translateElements('h1, h2, h3, h4, h5, h6, p, span, div, label, button, a, li, td, th');
    
    // Translate placeholders
    this.translatePlaceholders('input, textarea');
    
    // Translate titles and alt text
    this.translateAttributes();
  }
  
  translateElements(selector) {
    document.querySelectorAll(selector).forEach(el => {
      // Skip if already translated or is the translate button
      if (el.getAttribute('data-original') || el.id === 'moduleTranslateBtn' || el.closest('#moduleTranslateBtn')) {
        return;
      }
      
      const text = el.textContent.trim();
      if (text && this.translations[text]) {
        el.setAttribute('data-original', text);
        el.textContent = this.translations[text];
      }
    });
  }
  
  translatePlaceholders(selector) {
    document.querySelectorAll(selector).forEach(el => {
      const placeholder = el.placeholder;
      if (placeholder && this.translations[placeholder] && !el.getAttribute('data-original-placeholder')) {
        el.setAttribute('data-original-placeholder', placeholder);
        el.placeholder = this.translations[placeholder];
      }
    });
  }
  
  translateAttributes() {
    document.querySelectorAll('[title]').forEach(el => {
      const title = el.title;
      if (title && this.translations[title] && !el.getAttribute('data-original-title')) {
        el.setAttribute('data-original-title', title);
        el.title = this.translations[title];
      }
    });
  }
  
  restoreOriginal() {
    // Restore text content
    document.querySelectorAll('[data-original]').forEach(el => {
      el.textContent = el.getAttribute('data-original');
      el.removeAttribute('data-original');
    });
    
    // Restore placeholders
    document.querySelectorAll('[data-original-placeholder]').forEach(el => {
      el.placeholder = el.getAttribute('data-original-placeholder');
      el.removeAttribute('data-original-placeholder');
    });
    
    // Restore titles
    document.querySelectorAll('[data-original-title]').forEach(el => {
      el.title = el.getAttribute('data-original-title');
      el.removeAttribute('data-original-title');
    });
  }
  
  // Method to add custom translations
  addTranslations(newTranslations) {
    Object.assign(this.translations, newTranslations);
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure all content is loaded
  setTimeout(() => {
    window.amharicTranslator = new AmharicTranslator();
  }, 500);
});

// Export for manual initialization if needed
window.AmharicTranslator = AmharicTranslator;