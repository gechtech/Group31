// Language detection utility for modules
window.LanguageUtils = {
    // Detect current language based on translation state
    getCurrentLanguage: function() {
        // Check if simple translator exists and is translated
        if (window.parent && window.parent.simpleTranslator) {
            return window.parent.simpleTranslator.isTranslated ? 'amharic' : 'english';
        }
        
        // Fallback: check for Amharic text in the page
        const bodyText = document.body.textContent || '';
        const amharicPattern = /[\u1200-\u137F]/;
        return amharicPattern.test(bodyText) ? 'amharic' : 'english';
    },
    
    // Enhanced fetch function that automatically includes language
    fetchWithLanguage: function(url, options = {}) {
        const language = this.getCurrentLanguage();
        
        // If it's a POST request with JSON body, add language
        if (options.method === 'POST' && options.headers && 
            options.headers['Content-Type'] === 'application/json') {
            try {
                const body = JSON.parse(options.body);
                body.language = language;
                options.body = JSON.stringify(body);
            } catch (e) {
                console.warn('Could not parse JSON body for language injection');
            }
        }
        
        // If it's a FormData POST, add language field
        if (options.method === 'POST' && options.body instanceof FormData) {
            options.body.append('language', language);
        }
        
        return fetch(url, options);
    },
    
    // Get localized error messages
    getErrorMessage: function(key) {
        const language = this.getCurrentLanguage();
        const messages = {
            english: {
                'network_error': 'Network error occurred',
                'invalid_input': 'Invalid input provided',
                'analysis_failed': 'Analysis failed',
                'try_again': 'Please try again later'
            },
            amharic: {
                'network_error': 'የኔትወርክ ስህተት ተከስቷል',
                'invalid_input': 'ልክ ያልሆነ ግቤት ተሰጥቷል',
                'analysis_failed': 'ትንተና አልተሳካም',
                'try_again': 'እባክዎ በኋላ እንደገና ይሞክሩ'
            }
        };
        
        return messages[language][key] || messages.english[key] || key;
    },
    
    // Get localized UI text
    getUIText: function(key) {
        const language = this.getCurrentLanguage();
        const texts = {
            english: {
                'analyze': 'Analyze',
                'analyzing': 'Analyzing...',
                'result': 'Result',
                'risk_score': 'Risk Score',
                'recommendations': 'Recommendations',
                'reasoning': 'Reasoning'
            },
            amharic: {
                'analyze': 'ተንትን',
                'analyzing': 'በመተንተን ላይ...',
                'result': 'ውጤት',
                'risk_score': 'የአደጋ ደረጃ',
                'recommendations': 'ምክሮች',
                'reasoning': 'ምክንያት'
            }
        };
        
        return texts[language][key] || texts.english[key] || key;
    }
};

// Make it available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.LanguageUtils;
}