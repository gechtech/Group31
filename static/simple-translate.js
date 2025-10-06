// Simple translator - translates display text only, keeps input fields original
class SimpleTranslator {
  constructor() {
    this.isTranslated = localStorage.getItem('amharic-mode') === 'true'; // Persist language state
    this.translations = {
      // Dashboard
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
      
      // Phishing Email Module
      'Phishing Email Detection': 'የፊሺንግ ኢሜል ማወቂያ',
      'Paste an email address and its content to analyze it with AI and keyword detection.': 'የኢሜል አድራሻ እና ይዘቱን በAI እና በቃል ማወቂያ ለመተንተን ይለጥፉ።',
      'Email Analysis Tool': 'የኢሜል ትንተና መሳሪያ',
      'Scans for phishing keywords and AI analysis': 'የፊሺንግ ቃላት እና AI ትንተና ይፈልጋል',
      'Email Account': 'የኢሜል መለያ',
      'Email Content': 'የኢሜል ይዘት',
      'Keyword Analysis': 'የቃል ትንተና',
      'AI Analysis': 'AI ትንተና',
      'Understanding Phishing Email Attacks': 'የፊሺንግ ኢሜል ጥቃቶችን መረዳት',
      'Learn about this common cyber threat and how to prevent it': 'ስለዚህ የተለመደ የሳይበር ስጋት እና እንዴት መከላከል እንደሚቻል ይወቁ',
      'What is Phishing Email?': 'የፊሺንግ ኢሜል ምንድን ነው?',
      'Phishing is a social engineering attack often used to steal user data. Attackers disguise as a trustworthy entity to dupe victims into opening emails, messages, or links.': 'ፊሺንግ የተጠቃሚ መረጃን ለመስረቅ የሚያገለግል የማህበራዊ ምህንድስና ጥቃት ነው። ጥቃተኞች እንደ አስተማማኝ አካል በመምሰል ተጎጂዎችን ኢሜሎችን፣ መልዕክቶችን ወይም አገናኞችን እንዲከፍቱ ያታልላሉ።',
      'Common Tactics:': 'የተለመዱ ዘዴዎች፡',
      'Urgent/threatening language': 'አስቸኳይ/አስፈሪ ቋንቋ',
      'Links to fake login pages': 'ወደ ሐሰተኛ የመግቢያ ገጾች አገናኞች',
      'Generic greetings': 'አጠቃላይ ሰላምታዎች',
      'Malicious attachments': 'ተጠራጣሪ ተያያዥ ፋይሎች',
      'Spoofed sender addresses': 'የተጭበረበሩ የላኪ አድራሻዎች',
      'Prevention Strategies:': 'የመከላከያ ስትራቴጂዎች፡',
      'Verify sender address': 'የላኪውን አድራሻ ያረጋግጡ',
      'Hover on links before clicking': 'ከመጫን በፊት አገናኞችን ይመልከቱ',
      'Be suspicious of urgency': 'በአስቸኳይነት ላይ ጥርጣሬ ያድርጉ',
      'Never provide credentials by email': 'በኢሜል የመግቢያ ማረጋገጫዎችን በጭራሽ አይስጡ',
      'Use multi-factor authentication': 'ባለብዙ ደረጃ ማረጋገጫን ይጠቀሙ',
      
      // Malicious URL Module - Complete Translation
      'Malicious URL Detection': 'የተጠራጣሪ URL ማወቂያ',
      'Paste a URL and check if it\'s potentially dangerous using keyword or AI analysis.': 'URL ይለጥፉ እና በቃል ወይም AI ትንተና አደገኛ ማሆኑ እንደሚሆን ይፈትሹ።',
      
      'URL Analysis Tool': 'የURL ትንተና መሳሪያ',
      'Scan URLs for malicious or phishing behavior': 'URLዎችን ለተጠራጣሪ ወይም ፊሺንግ ባህሪ ይቃኙ',
      'URL': 'URL',
      'Understanding Malicious URL Attacks': 'የተጠራጣሪ URL ጥቃቶችን መረዳት',
      'Learn about dangerous links and how to identify them': 'ስለ አደገኛ አገናኞች እና እንዴት መለየት እንደሚቻል ይወቁ',
      'What is a Malicious URL?': 'ተጠራጣሪ URL ምንድን ነው?',
      'A malicious URL is a link designed to lead users to websites that host malware, phishing scams, or other harmful content. These URLs are often disguised to look legitimate.': 'ተጠራጣሪ URL ተጠቃሚዎችን ወደ ማልዌር፣ ፊሺንግ አስመሳይ ወይም ለላ ጎዳዊ ይዘት የሚአዛኙ ድረ-ገጾች የሚመረት አገናኝ ነው። እነዚህ URLዎች በቀላሉ ሐጋዊ እንዲታዩ ይደበቁላቸዋል።',
      'Common Tactics:': 'የተለመዱ ዘዴዎች፡',
      'Typo-squatting (e.g., gooogle.com)': 'የፊደል ስህተት (ምሳለ gooogle.com)',
      'Extra subdomains (bank.com.malicious.link)': 'አክል የተከተል ዶሜይኖች (bank.com.malicious.link)',
      'URL shorteners hide destination': 'የURL አጭሮች የመጣ አድራሻ ይደብቁላቸዋል',
      'Credentials in URL (http://user:pass@example.com)': 'በURL ውስጥ የመግቢያ ማረጋገጫ (http://user:pass@example.com)',
      'Unexpected redirects': 'ያልተጠበቁ አዞር',
      'Prevention Strategies:': 'የመከላከያ ስትራቴጂዎች፡',
      'Hover to preview full URL': 'ሙሉን URL ለማየት አስተዋውቁ',
      'Beware of unexpected links': 'ካልተጠበቁ አገናኞች ይጠበቁ',
      'Use a URL scanner/extension': 'የURL ማሰስ/አድካዊ ይጠቀሙ',
      'Keep browser/AV updated': 'የድር ገጽ/ጸረ-ቫይረስ ወቅታዊ ያድርጉ',
      'Only download from trusted sources': 'ከአስተማማኝ ምንጮች ብቻ ያውርዱ',
      
      // Baiting (File) Module
      'File Baiting Detection': 'የፋይል መሳሪያ ማወቂያ',
      'Upload files to check for dangerous extensions and potential security threats commonly used in baiting attacks.': 'በመሳሪያ ጥቃቶች ውስጥ በተለመዱ የመጠቀሙ አደገኛ ቅጥያዎች እና ሊሆኑ የደህንነት ስጋቶች ለመፈትሽ ፋይሎች ይስቀሉ።',
      'File Security Scanner': 'የፋይል ደህንነት ማሰስ',
      'Analyze files for dangerous extensions and security risks': 'ፋይሎችን ለአደገኛ ቅጥያዎች እና የደህንነት ስጋቶች ተንትን',
      'Drop a file here or click to browse': 'ፋይል እዚህ ያድርጉ ወይም ለማሰሳ ይጫኑ',
      'Any file type accepted for analysis': 'ለትንተና ማንኛውም የፋይል ዓይነት ይቀበላል',
      'Choose File': 'ፋይል ይምረጡ',
      'No file chosen': 'ምንም ፋይል አልተመረጠም',
      'File Baiting Attack Prevention': 'የፋይል መሳሪያ ጥቃት መከላከያ',
      'Dangerous File Types:': 'አደገኛ የፋይል ዓይነቶች፡',
      'Critical:': 'ከፍተኛ፡',
      'High:': 'ከፍተኛ፡',
      'Medium:': 'መካከለኛ፡',
      'Safety Tips:': 'የደህንነት ምክሮች፡',
      'Never run files from unknown sources': 'ከያልተወቁ ምንጮች ፋይሎችን በጭራሽ አይስራጡ',
      'Use antivirus software to scan files': 'ፋይሎችን ለማሰስ ጸረ-ቫይረስ ሶፍትዌር ይጠቀሙ',
      'Be suspicious of unexpected attachments': 'ያልተጠበቁ ተያያዥ ፋይሎች ጥርጣሬ ያድርጉ',
      'Verify sender before opening files': 'ፋይሎችን ከመክፈት በፊት ላክን ያረጋግጡ',
      'Keep software updated': 'ሶፍትዌርን ወቅታዊ ያድርጉ',
      
      // Pretexting Module - Complete Translation
      'Pretexting ID Verification': 'የመረጃ መስጠት የማንነት ማረጋገጫ',
      'Learn to recognize fake ID verification requests used in pretexting attacks where criminals impersonate authority figures.': 'ተጠራጣሪዎች የባለስልጣን ሰዎችን በማስመሰል በመረጃ መስጠት ጥቃቶች ውስጥ የሚጠቀሙ ሐሰተኛ የማንነት ማረጋገጫ ጥያቄዎችን መለየት ይወቁ።',
      'Suspicious Request Example': 'ተጠራጣሪ ጥያቄ ምሳለ',
      'Would you share these details?': 'እነዚህን ዝርዝሮች ያጋራሉ ነበር?',
      'Full Name': 'ሙሉ ስም',
      'Social Security Number': 'የማህበራዊ ደህንነት ቁጥር',
      'Date of Birth': 'የተወለድ ቀን',
      'Mother\'s Maiden Name': 'የእናት የመጀመሪያ ስም',
      'AI Analysis': 'AI ትንተና',
      'Pretexting Attack Prevention': 'የመረጃ መስጠት ጥቃት መከላከያ',
      'Learn to recognize and defend against pretexting social engineering attacks.': 'የመረጃ መስጠት የማህበራዊ ምህንድስና ጥቃቶችን መለየት እና መከላከል ይወቁ።',
      'Red Flags in Verification Requests:': 'በማረጋገጫ ጥያቄዎች ውስጥ የአደጋ መጠቀሲያዎች፡',
      'Urgent language and time pressure': 'አስቸኳይ ቋንቋ እና የጊዜ ጥንቅ',
      'Requests for sensitive information via email/phone': 'በኢሜል/ስልክ መስመር ሲስጥራዊ መረጃ ጥያቄዎች',
      'Threats of account suspension or legal action': 'የመለያ ማስተንትቅ ወይም የሕግ እርምጃ አስፈሪዎች',
      'Impersonation of authority figures or IT staff': 'የባለስልጣን ሰዎች ወይም የIT ሰራተኞች ማስመሰል',
      'Requests for passwords or security codes': 'የመለፍ ቃላት ወይም የደህንነት ኮዶች ጥያቄዎች',
      'How to Protect Yourself:': 'ያትንዎን እንዴት መጠበቅ፡',
      'Verify the requester through official channels': 'ተጠያቂውን በኦፊሻዊ መንገዶች ያረጋግጡ',
      'Never provide sensitive info via email or phone': 'ሲስጥራዊ መረጃ በኢሜል ወይም ስልክ በጭራሽ አይስጡ',
      'Take time to think - don\'t rush decisions': 'ለማሰብ ጊዜ ይወስዱ - ቀጣፍ ነ ቀጣፍ አይስዱ',
      'Contact the organization directly using known numbers': 'የተወቁት ቁጥሮች በመጠቀም ድርጅቱን በቀጣፍ ያነጋግጡ',
      'Trust your instincts if something feels wrong': 'አንደ ነገር ስህተት ቲታይ በደመ ነፍስዎ ያምኑ',
      
      // Tailgating Module - Complete Translation
      'Tailgating Security Simulation': 'የመደበር ደህንነት መመሳከር',
      'Practice identifying and preventing tailgating attacks where unauthorized individuals follow authorized personnel through secure areas.': 'ያልተፈቀዱላቸው ግልሰቦች የተፈቀዱላቸውን ሰራተኞች በደህንነት አካባቢዎች አብሮ በመከተል የመደበር ጥቃቶችን መለየት እና መከላከል ይመርጡ።',
      'Choose a Tailgating Scenario': 'የመደበር ሁኔታ ይምረጡ',
      'Select a scenario to practice your response to potential tailgating attempts': 'ሊሆኑ የመደበር ምስይሮች መመልስዎን ለመመርን ሁኔታ ይምረጡ',
      'Office Building Entry': 'የትርድ ብንይን መግቢያ',
      'You\'re entering your office building with your access card': 'የመድረሻ ካርድዎ ጋር የትርድ ብንይን ይግባሉ',
      'Start Scenario': 'ሁኔታ ይጀምሩ',
      'Server Room Access': 'የሰርቬር ክፍል መድረሻ',
      'You\'re accessing the secure server room for maintenance': 'ለእንድስታ የደህንነት ሰርቬር ክፍል ይድረሱ',
      'Delivery Access': 'የአቀራበት መድረሻ',
      'A delivery person needs access to your secure facility': 'አንድ አቀራበት የደህንነት ተስሳትዎ መድረሻ ያስፍልጋል',
      'Understanding Tailgating Attacks': 'የመደበር ጥቃቶችን መረዳት',
      'Learn about this common physical security threat and how to prevent it': 'ስለዚህ የተለመደ የአካላዊ ደህንነት ስጋት እና እንዴት መከላከል እንደሚቻል ይወቁ',
      'What is Tailgating?': 'መደበር ምንድን ነው?',
      'Tailgating (or "piggybacking") is when an unauthorized person follows an authorized person into a restricted area without proper authentication.': 'መደበር (ወይም "ፒግባኪንግ") ያልተፈቀደ ሰው የተፈቀደን ሰው ተጋቢ ማረጋገጫ ሳይኖር ወደ የተገደበ አካባቢ በመከተል ነው።',
      'Common Tactics:': 'የተለመዱ ዘዴዎች፡',
      'Carrying items to appear busy/legitimate': 'የስራ እንዲታዩ/ሐጋዊ እንዲታዩ ዓይነቶች መሽኘት',
      'Wearing uniforms or business attire': 'የአስተዳደር ልብስ ወይም የብዝንስ ልብስ ማልበስ',
      'Creating urgency or time pressure': 'አስቸኳይነት ወይም የጊዜ ጥንቅ መፍጠር',
      'Claiming to be new employees or contractors': 'አዲስ ሰራተኞች ወይም ከንትራክተሮች መሆን መዳዓት',
      'Prevention Strategies:': 'የመከላከያ ስትራቴጂዎች፡',
      'Always require proper authentication': 'ሁልጊዜ ተጋቢ ማረጋገጫ ይጠይቁ',
      'Don\'t hold doors open for strangers': 'ለያልተወቁ ሰዎች አድሮች አይክፍቱ',
      'Verify identity through official channels': 'ማንነት በኦፊሻዊ መንገዶች ያረጋግጡ',
      'Report suspicious behavior to security': 'ተጠራጣሪ ባህሪ ለደህንነት ያሳውቁ',
      'Follow company security policies': 'የኩባንያ ደህንነት ፖሊሲዎችን ይከተሉ',
      'Trust your instincts if something feels wrong': 'አንደ ነገር ስህተት ቲታይ በደመ ነፍስዎ ያምኑ',
      
      // Caller ID Spoofing Module - Complete Translation
      'Caller ID Spoofing': 'የጥሪ መታወቂያ ማስመሰል',
      'Analyze phone numbers for spoofing indicators': 'የስልክ ቁጥሮችን ለማስመሰል አመላካቾች ተንትን',
      'Phone Number Spoofing Detector': 'የስልክ ቁጥር ማስመሰል ማወቂያ',
      'Enter a phone number to check for common spoofing patterns': 'የተለመዱ ማስመሰል መስመሮችን ለመፈትሽ የስልክ ቁጥር ይገቡ',
      'Phone Number': 'የስልክ ቁጥር',
      'Spoofing Attack Scenarios': 'የማስመሰል ጥቃት ሁኔታዎች',
      'Practice identifying and responding to common spoofing attacks': 'የተለመዱ ማስመሰል ጥቃቶችን መለየት እና መመልስ ይመርጡ',
      'Caller ID Display:': 'የደዋይ መታወቂያ መጠቀሲያ፡',
      'First National Bank': 'የመጀመሪያ ብሄራዊ ባንክ',
      'Actual Number:': 'እውነተኛ ቁጥር፡',
      'IRS Tax Department': 'የIRS ገቢር ከፍል',
      'Microsoft Support': 'የማይክሮሶፍት ድጋፍ',
      'spoofing Attack Prevention': 'የማስመሰል ጥቃት መከላከያ',
      'Learn to recognize and defend against voice phishing attacks': 'የስምት ፊሺንግ ጥቃቶችን መለየት እና መከላከል ይወቁ',
      'Common spoofing Tactics:': 'የተለመዱ ማስመሰል ዘዴዎች፡',
      'Caller ID spoofing to appear legitimate': 'ሐጋዊ እንዲታዩ የደዋይ መታወቂያ ማስመሰል',
      'Creating urgency or fear (account locked, overdue arrest)': 'አስቸኳይነት ወይም ፍርሃት መፍጠር (መለያ የተዘገ, የተዘገተ መሳር)',
      'Requesting sensitive information for "verification"': 'ለ"ማረጋገጫ" ሲስጥራዊ መረጃ መጠየቅ',
      'Impersonating trusted organizations or government': 'የተወቁ ድርጅቶችን ወይም መንግስትን ማስመሰል',
      'Requests for gift cards or wire transfers': 'የስቅመት ካርዶች ወይም የውይር ትራንስፌሮች ጥያቄዎች',
      'Protection Strategies:': 'የመጠበቂያ ስትራቴጂዎች፡',
      'Never give personal info to unsolicited callers': 'ለያልተጠየቁ ደዋዮች የግል መረጃ በጭራሽ አይስጡ',
      'Hang up and call back using official numbers': 'ስልኩን ይዘጉ እና የኦፊሻዊ ቁጥሮችን በመጠቀም ተመልሱ',
      'Verify urgent requests through other channels': 'አስቸኳይ ጥያቄዎችን በለላ መንገዶች ያረጋግጡ',
      'Let unknown callers go to voicemail': 'ያልተወቁ ደዋዮች ወደ ስምት ሜል ይህዱ',
      'Report suspicious calls to authorities': 'ተጠራጣሪ ጥሪዎችን ለባለስልጣኖች ያሳውቁ',
      
      // Quid Pro Quo Module - Complete Translation
      'Quid Pro Quo Security Quiz': 'የመለዋወጥ ደህንነት ጥያቄ',
      'Test your knowledge about information exchange security and learn to identify quid pro quo attacks.': 'ስለ መረጃ ልውውጥ ደህንነት እውቀትዎን ይፈትሹ እና የመለዋወጥ ጥቃቶችን መለየት ይወቁ።',
      'Quid Pro Quo Security Awareness Quiz': 'የመለዋወጥ ደህንነት ግንዛቤ ጥያቄ',
      'Test your ability to identify suspicious information exchange requests and make secure decisions': 'ተጠራጣሪ የመረጃ ልውውጥ ጥያቄዎችን መለየት እና የደህንነት ቀጣፍ መሰጣት ችለታዎን ይፈትሹ',
      'Quiz Overview': 'የጥያቄ አጠቃላይ መረያ',
      '10 real-world scenarios': '10 የእውነተኛ ዓለም ሁኔታዎች',
      'Immediate feedback on each answer': 'በእያንዳንዱ መልስ በቀጣፍ መረጃ መመልስ',
      'Detailed explanations': 'ዝርዝር ማስረዳዎች',
      'Final score with pass/fail result': 'የተሳተፍ/የተጠጠገ ውጤት ጋር የመጨረሻ ነጥብ',
      'How it works:': 'እንዴት ይሰራል፡',
      'You\'ll be presented with various quid pro quo scenarios where someone offers something in exchange for information. Choose the most secure response based on cybersecurity best practices.': 'አንድ ሰው ለመረጃ በምልሽ አንደ ነገር የሚዓረብ የተናንን የመለዋወጥ ሁኔታዎች ይጠቀሱላቸዋል። በሳይበር ደህንነት ጥሩ መስርቶች ላይ በመመርክር የተጠጠገ የደህንነት መልስ ይምረጡ።',
      'Start Quiz': 'ጥያቄ ይጀምሩ',
      'Question will appear here': 'ጥያቄ እዚህ ይታያል',
      'Next Question': 'የሚከተለው ጥያቄ',
      'Finish Quiz': 'ጥያቄ አሳቅብ',
      'Quiz Complete!': 'ጥያቄ ተጠናቅቧል!',
      'Your cybersecurity knowledge assessment': 'የሳይበር ደህንነት እውቀት ማመዘን',
      'Score': 'ነጥብ',
      'Correct Answers:': 'ትክክለኛ መልሶች፡',
      'Accuracy:': 'ትክክለኛነት፡',
      'Status:': 'ሁኔታ፡',
      'Retake Quiz': 'ጥያቄ እንደገና ይወስዱ',
      'View Detailed Answers': 'ዝርዝር መልሶችን ይመልከቱ',
      'Understanding Quid Pro Quo Attacks': 'የመለዋወጥ ጥቃቶችን መረዳት',
      'Learn about information exchange attacks and how to protect yourself': 'ስለ መረጃ ልውውጥ ጥቃቶች እና ያትንዎን እንዴት መጠበቅ እንደሚቻል ይወቁ',
      'What is Quid Pro Quo?': 'መለዋወጥ ምንድን ነው?',
      'Quid pro quo attacks involve offering something of value in exchange for sensitive information or access. Attackers exploit human psychology by making the exchange seem fair and beneficial.': 'የመለዋወጥ ጥቃቶች ለሲስጥራዊ መረጃ ወይም መድረሻ በምልሽ የእጤት አንደ ነገር ማስረብን ያካትታል። ጥቃተኞች ልውውጡን አድላ እና ጠቅማዊ እንዲታዩ በማድረግ የሰው ስንፍስና ይጠቀማሉ።',
      'Common Tactics:': 'የተለመዱ ዘዴዎች፡',
      'Free WiFi in exchange for personal details': 'ለግል ዝርዝሮች በምልሽ ነጣ WiFi',
      'Gift cards for account information': 'ለመለያ መረጃ የስቅመት ካርዶች',
      'Software downloads for credentials': 'ለመግቢያ ማረጋገጫዎች የሶፍትዌር አውርዶች',
      'Prize notifications requiring verification': 'ማረጋገጫ የሚጠይቁ የስቅመት ማንቂያዎች',
      'Job offers requiring background checks': 'የበስተ መረጃ መፈትሽ የሚጠይቁ የስራ አቅርቦቶች',
      'Prevention Strategies:': 'የመከላከያ ስትራቴጂዎች፡',
      'Be skeptical of "free" offers': 'በ"ነጣ" አቅርቦቶች ጥርጣሬ ያድርጉ',
      'Never trade information for rewards': 'መረጃን ለስቅመቶች በጭራሽ አይጠያዩ',
      'Verify offers through official channels': 'አቅርቦቶችን በኦፊሻዊ መንገዶች ያረጋግጡ',
      'Use official apps and websites only': 'ኦፊሻዊ መተግበሪያዎችን እና ድረ-ገጾችን ብቻ ይጠቀሙ',
      'Trust your instincts if something feels wrong': 'አንደ ነገር ስህተት ቲታይ በደመ ነፍስዎ ያምኑ',
      
      // Quid Pro Quo Quiz Questions - Complete Translation
      'A coffee shop offers free WiFi but requires your email and phone number. What should you do?': 'አንድ የቡና ቤት ነጻ WiFi ይሰጣል ግን የእርስዎን ኢሜል እና የስልክ ቁጥር ይፈልጋል። ምን ማድረግ አለብዎት?',
      'You\'re working remotely and need internet access. The sign says \'Free WiFi - Just provide email and phone for security\'.': 'በርቀት እየሰሩ ነው እና የኢንተርኔት መዳረሻ ያስፈልግዎታል። ምልክቱ \'ነጻ WiFi - ለደህንነት ኢሜል እና ስልክ ብቻ ያቅርቡ\' ይላል።',
      'Provide the information to get free WiFi': 'ነጻ WiFi ለማግኘት መረጃውን ያቅርቡ',
      'Use your mobile data instead': 'በምትኩ የሞባይል ዳታዎን ይጠቀሙ',
      'Use a fake email and phone number': 'የውሸት ኢሜል እና የስልክ ቁጥር ይጠቀሙ',
      'Ask if there\'s a guest network': 'የእንግዳ ኔትወርክ አለ እንደሆን ይጠይቁ',
      '❌ Never trade personal information for free services. This is a common data harvesting tactic.': '❌ ለነጻ አገልግሎቶች የግል መረጃ በጭራሽ አይለዋወጡ። ይህ የተለመደ የመረጃ መሰብሰቢያ ዘዴ ነው።',
      '✅ Use your mobile hotspot or data plan. Your personal information is more valuable than free WiFi.': '✅ የሞባይል ሆትስፖት ወይም የዳታ እቅድዎን ይጠቀሙ። የግል መረጃዎ ከነጻ WiFi የበለጠ ዋጋ አለው።',
      '❌ Even fake information can be used for tracking. Avoid the service entirely.': '❌ የውሸት መረጃም ለመከታተል ሊጠቅም ይችላል። አገልግሎቱን ሙሉ በሙሉ ያስወግዱ።',
      '✅ Ask for a guest network that doesn\'t require personal information.': '✅ የግል መረጃ የማይፈልግ የእንግዳ ኔትወርክ ይጠይቁ።',
      
      'You receive a text offering a $50 gift card in exchange for completing a \'quick security survey\'. How do you respond?': 'የ$50 የስጦታ ካርድ \'ፈጣን የደህንነት ጥናት\' በማጠናቀቅ በምላሽ የሚሰጥ ጽሁፍ ደርሶዎታል። እንዴት ይመልሳሉ?',
      'The text includes a link and claims to be from a major retailer you shop at regularly.': 'ጽሁፉ አገናኝ ያካትታል እና በመደበኛነት የሚገዙበት ከዋና ቸርቻሪ እንደሆነ ይናገራል።',
      'Click the link and complete the survey': 'አገናኙን ይጫኑ እና ጥናቱን ያጠናቅቁ',
      'Ignore the message completely': 'መልእክቱን ሙሉ በሙሉ ይተዉት',
      'Reply asking for more details': 'ተጨማሪ ዝርዝሮችን እየጠየቁ ይመልሱ',
      'Forward to the retailer\'s official support': 'ወደ ቸርቻሪው ኦፊሻዊ ድጋፍ ያስተላልፉ',
      '❌ This is a classic quid pro quo scam. Legitimate companies don\'t offer gift cards via text surveys.': '❌ ይህ ክላሲክ የመለዋወጥ ማጭበርበር ነው። ህጋዊ ኩባንያዎች በጽሁፍ ጥናቶች የስጦታ ካርዶችን አይሰጡም።',
      '✅ Delete and ignore. Legitimate offers come through official channels, not random texts.': '✅ ይሰርዙ እና ይተዉት። ህጋዊ አቅርቦቶች በኦፊሻዊ መንገዶች ይመጣሉ፣ በዘፈቀደ ጽሁፎች አይደለም።',
      '❌ Don\'t engage with suspicious messages. This confirms your number is active.': '❌ ከተጠራጣሪ መልእክቶች ጋር አይሳተፉ። ይህ ቁጥርዎ ንቁ መሆኑን ያረጋግጣል።',
      '✅ Report phishing attempts to the legitimate company through their official channels.': '✅ የፊሺንግ ሙከራዎችን ለህጋዊ ኩባንያ በኦፊሻዊ መንገዶቻቸው ያሳውቁ።',
      
      'A job recruiter offers you a high-paying position but needs your social security number for \'background verification\'. What\'s your response?': 'የስራ ቅጣሪ ከፍተኛ ደመወዝ ያለው ስራ ይሰጥዎታል ግን ለ\'የበስተ ኋላ ማረጋገጫ\' የማህበራዊ ደህንነት ቁጥርዎን ይፈልጋል። ምላሽዎ ምንድን ነው?',
      'The recruiter contacted you via LinkedIn and the job seems legitimate with a well-known company name.': 'ቅጣሪው በLinkedIn አማካኝነት አነጋግሮዎታል እና ስራው ከታወቀ ኩባንያ ስም ጋር ህጋዊ ይመስላል።',
      'Provide your SSN since it\'s for a job': 'ለስራ ስለሆነ የSSN ዎን ያቅርቡ',
      'Ask to meet in person first': 'መጀመሪያ በአካል መገናኘትን ይጠይቁ',
      'Provide partial SSN (last 4 digits)': 'ከፊል SSN ያቅርቡ (የመጨረሻዎቹ 4 አሃዞች)',
      'Verify the company and recruiter independently': 'ኩባንያውን እና ቅጣሪውን በነጻነት ያረጋግጡ',
      '❌ Never provide SSN via email or phone. Legitimate employers handle this through secure, official processes.': '❌ SSN በኢሜል ወይም ስልክ በጭራሽ አይስጡ። ህጋዊ አሰሪዎች ይህንን በደህንነት፣ በኦፊሻዊ ሂደቶች ያስተናግዳሉ።',
      '✅ Insist on meeting in person and verify the recruiter\'s identity before sharing any sensitive information.': '✅ በአካል መገናኘትን ያጥብቁ እና ማንኛውንም ሚስጥራዊ መረጃ ከማጋራትዎ በፊት የቅጣሪውን ማንነት ያረጋግጡ।',
      '❌ Even partial SSN can be used for identity theft. Don\'t share any part of it.': '❌ ከፊል SSN እንኳን ለማንነት ስርቆት ሊጠቅም ይችላል። ምንም ክፍሉን አይጋሩ።',
      '✅ Research the company and recruiter through official channels before proceeding.': '✅ ከመቀጠልዎ በፊት ኩባንያውን እና ቅጣሪውን በኦፊሻዊ መንገዶች ይመርምሩ።',
      
      'A software download site offers a \'premium version\' if you provide your work email and company name. What should you do?': 'የሶፍትዌር ማውረጃ ድረ-ገጽ የስራ ኢሜልዎን እና የኩባንያ ስም ካቀረቡ \'ፕሪሚየም ስሪት\' ይሰጣል። ምን ማድረግ አለብዎት?',
      'You need software for a work project and the site looks professional with good reviews.': 'ለስራ ፕሮጀክት ሶፍትዌር ያስፈልግዎታል እና ድረ-ገጹ ጥሩ ግምገማዎች ያሉት ሙያዊ ይመስላል።',
      'Provide the information for the premium version': 'ለፕሪሚየም ስሪት መረጃውን ያቅርቡ',
      'Download from the official software website': 'ከኦፊሻዊ ሶፍትዌር ድረ-ገጽ ያውርዱ',
      'Use a personal email instead': 'በምትኩ የግል ኢሜል ይጠቀሙ',
      'Ask your IT department for approved software': 'ለተፈቀደ ሶፍትዌር የIT ክፍልዎን ይጠይቁ',
      '❌ This is a data harvesting technique. Legitimate software doesn\'t require work details for free versions.': '❌ ይህ የመረጃ መሰብሰቢያ ዘዴ ነው። ህጋዊ ሶፍትዌር ለነጻ ስሪቶች የስራ ዝርዝሮችን አይፈልግም።',
      '✅ Always download software from official sources. Avoid third-party sites that ask for personal information.': '✅ ሶፍትዌርን ሁልጊዜ ከኦፊሻዊ ምንጮች ያውርዱ። የግል መረጃ የሚጠይቁ የሶስተኛ ወገን ድረ-ገጾችን ያስወግዱ።',
      '❌ Don\'t provide any personal information to suspicious sites. Find the official source.': '❌ ለተጠራጣሪ ድረ-ገጾች ምንም የግል መረጃ አይስጡ። ኦፊሻዊውን ምንጭ ያግኙ።',
      '✅ Check with IT for approved software sources and licensing requirements.': '✅ ለተፈቀዱ የሶፍትዌር ምንጮች እና የፍቃድ መስፈርቶች ከIT ጋር ያረጋግጡ።',
      
      'A survey company offers $100 for completing a \'market research\' survey that asks for your bank account details. How do you respond?': 'የጥናት ኩባንያ የባንክ መለያ ዝርዝሮችዎን የሚጠይቅ \'የገበያ ምርምር\' ጥናት በማጠናቀቅ $100 ይሰጣል። እንዴት ይመልሳሉ?',
      'The email looks professional and claims to be from a legitimate market research company.': 'ኢሜሉ ሙያዊ ይመስላል እና ከህጋዊ የገበያ ምርምር ኩባንያ እንደሆነ ይናገራል።',
      'Complete the survey for the money': 'ለገንዘቡ ጥናቱን ያጠናቅቁ',
      'Delete the email immediately': 'ኢሜሉን ወዲያውኑ ይሰርዙ',
      'Reply asking for more information': 'ተጨማሪ መረጃ እየጠየቁ ይመልሱ',
      'Report to your bank\'s fraud department': 'ወደ ባንክዎ የማጭበርበር ክፍል ያሳውቁ',
      '❌ Legitimate surveys never ask for bank account details. This is a financial scam.': '❌ ህጋዊ ጥናቶች የባንክ መለያ ዝርዝሮችን በጭራሽ አይጠይቁም። ይህ የገንዘብ ማጭበርበር ነው።',
      '✅ Delete immediately. No legitimate survey requires bank account information.': '✅ ወዲያውኑ ይሰርዙ። ምንም ህጋዊ ጥናት የባንክ መለያ መረጃ አይፈልግም።',
      '❌ Don\'t engage with suspicious emails. This confirms your email is active.': '❌ ከተጠራጣሪ ኢሜሎች ጋር አይሳተፉ። ይህ ኢሜልዎ ንቁ መሆኑን ያረጋግጣል።',
      '✅ Report phishing attempts to your bank and relevant authorities.': '✅ የፊሺንግ ሙከራዎችን ለባንክዎ እና ለሚመለከታቸው ባለስልጣናት ያሳውቁ።',
      
      'A mobile app offers free premium features if you \'verify your identity\' with a photo of your driver\'s license. What\'s your response?': 'የሞባይል መተግበሪያ የመንጃ ፍቃድዎ ፎቶ ጋር \'ማንነትዎን ካረጋገጡ\' ነጻ ፕሪሚየም ባህሪያትን ይሰጣል። ምላሽዎ ምንድን ነው?',
      'The app has good ratings and claims the verification is for \'age verification\' purposes.': 'መተግበሪያው ጥሩ ደረጃዎች አሉት እና ማረጋገጫው ለ\'የእድሜ ማረጋገጫ\' ዓላማዎች እንደሆነ ይናገራል።',
      'Upload the photo for free features': 'ለነጻ ባህሪያት ፎቶውን ይስቀሉ',
      'Use the free version without verification': 'ያለማረጋገጫ ነጻ ስሪቱን ይጠቀሙ',
      'Blur out sensitive information first': 'መጀመሪያ ሚስጥራዊ መረጃን ያደብዙ',
      'Research the app\'s privacy policy first': 'መጀመሪያ የመተግበሪያውን የግላዊነት ፖሊሲ ይመርምሩ',
      '❌ Never share government ID photos with apps. This is identity theft waiting to happen.': '❌ የመንግስት መታወቂያ ፎቶዎችን ከመተግበሪያዎች ጋር በጭራሽ አይጋሩ። ይህ የማንነት ስርቆት ሊሆን የሚጠብቅ ነው።',
      '✅ Use the free version or find an alternative app that doesn\'t require ID verification.': '✅ ነጻ ስሪቱን ይጠቀሙ ወይም የመታወቂያ ማረጋገጫ የማይፈልግ አማራጭ መተግበሪያ ያግኙ።',
      '❌ Even partially visible ID information can be used for identity theft.': '❌ በከፊል የሚታይ የመታወቂያ መረጃ እንኳን ለማንነት ስርቆት ሊጠቅም ይችላል።',
      '✅ Check the app\'s privacy policy and reviews before providing any personal information.': '✅ ማንኛውንም የግል መረጃ ከመስጠትዎ በፊት የመተግበሪያውን የግላዊነት ፖሊሲ እና ግምገማዎች ያረጋግጡ።',
      
      'A website offers free access to premium content if you provide your work computer\'s IP address. What should you do?': 'ድረ-ገጽ የስራ ኮምፒውተርዎን IP አድራሻ ካቀረቡ ወደ ፕሪሚየም ይዘት ነጻ መዳረሻ ይሰጣል። ምን ማድረግ አለብዎት?',
      'The site claims to need your IP for \'security verification\' to prevent unauthorized access.': 'ድረ-ገጹ ያልተፈቀደ መዳረሻን ለመከላከል ለ\'የደህንነት ማረጋገጫ\' የእርስዎን IP እንደሚፈልግ ይናገራል።',
      'Provide the IP address for access': 'ለመዳረሻ የIP አድራሻውን ያቅርቡ',
      'Use a VPN and provide that IP instead': 'VPN ይጠቀሙ እና በምትኩ ያንን IP ያቅርቡ',
      'Find alternative content sources': 'አማራጭ የይዘት ምንጮችን ያግኙ',
      'Ask your IT department about the request': 'ስለ ጥያቄው የIT ክፍልዎን ይጠይቁ',
      '❌ Never share your work IP address. This could be used for network attacks.': '❌ የስራ IP አድራሻዎን በጭራሽ አይጋሩ። ይህ ለኔትወርክ ጥቃቶች ሊጠቅም ይችላል።',
      '❌ Don\'t provide any IP address. Legitimate sites don\'t require this information.': '❌ ምንም IP አድራሻ አይስጡ። ህጋዊ ድረ-ገጾች ይህንን መረጃ አይፈልጉም።',
      '✅ Look for legitimate sources that don\'t require personal network information.': '✅ የግል ኔትወርክ መረጃ የማይፈልጉ ህጋዊ ምንጮችን ይፈልጉ።',
      '✅ Consult IT before sharing any network information with external sites.': '✅ ከውጫዊ ድረ-ገጾች ጋር ማንኛውንም የኔትወርክ መረጃ ከማጋራትዎ በፊት ITን ያማክሩ።',
      
      'A social media contest offers a prize if you provide your home address and phone number for \'delivery purposes\'. How do you respond?': 'የማህበራዊ ሚዲያ ውድድር ለ\'የማድረሻ ዓላማዎች\' የቤት አድራሻዎን እና የስልክ ቁጥርዎን ካቀረቡ ሽልማት ይሰጣል። እንዴት ይመልሳሉ?',
      'The contest is from a brand you follow and the prize is something you really want.': 'ውድድሩ ከሚከተሉት ብራንድ ነው እና ሽልማቱ በእውነት የሚፈልጉት ነገር ነው።',
      'Provide the information to win the prize': 'ሽልማቱን ለማሸነፍ መረጃውን ያቅርቡ',
      'Use a P.O. Box address instead': 'በምትኩ የP.O. Box አድራሻ ይጠቀሙ',
      'Check if the contest is legitimate first': 'መጀመሪያ ውድድሩ ህጋዊ እንደሆን ያረጋግጡ',
      'Ignore the contest completely': 'ውድድሩን ሙሉ በሙሉ ይተዉት',
      '❌ Legitimate contests don\'t require home addresses upfront. This is likely a data harvesting scam.': '❌ ህጋዊ ውድድሮች የቤት አድራሻዎችን ቀድመው አይፈልጉም። ይህ የመረጃ መሰብሰቢያ ማጭበርበር ሊሆን ይችላል።',
      '❌ Even P.O. Box addresses can be used for tracking and profiling.': '❌ የP.O. Box አድራሻዎች እንኳን ለመከታተል እና ለመገለጽ ሊጠቅሙ ይችላሉ።',
      '✅ Verify the contest through the company\'s official website and social media.': '✅ ውድድሩን በኩባንያው ኦፊሻዊ ድረ-ገጽ እና ማህበራዊ ሚዲያ ያረጋግጡ።',
      '✅ When in doubt, avoid. Your personal information is more valuable than any prize.': '✅ በጥርጣሬ ውስጥ ሲሆኑ ያስወግዱ። የግል መረጃዎ ከማንኛውም ሽልማት የበለጠ ዋጋ አለው።',
      
      'A tech support call offers to \'fix your computer for free\' if you provide remote access and your password. What\'s your response?': 'የቴክ ድጋፍ ጥሪ የርቀት መዳረሻ እና የይለፍ ቃልዎን ካቀረቡ \'ኮምፒውተርዎን በነጻ ለማስተካከል\' ይሰጣል። ምላሽዎ ምንድን ነው?',
      'The caller claims to be from Microsoft and says your computer has been sending error reports.': 'ደዋዩ ከማይክሮሶፍት እንደሆነ ይናገራል እና ኮምፒውተርዎ የስህተት ሪፖርቶችን እየላከ እንደሆነ ይናገራል።',
      'Provide access since it\'s free help': 'ነጻ እርዳታ ስለሆነ መዳረሻ ያቅርቡ',
      'Hang up immediately': 'ወዲያውኑ ስልኩን ይዘጉ',
      'Ask for their employee ID number': 'የሰራተኛ መታወቂያ ቁጥራቸውን ይጠይቁ',
      'Call Microsoft directly to verify': 'ለማረጋገጥ ማይክሮሶፍትን በቀጥታ ይደውሉ',
      '❌ This is a classic tech support scam. Microsoft never calls users unsolicited.': '❌ ይህ ክላሲክ የቴክ ድጋፍ ማጭበርበር ነው። ማይክሮሶፍት ተጠቃሚዎችን ሳይጠየቅ በጭራሽ አይደውልም።',
      '✅ Hang up immediately. Legitimate tech support never calls you first.': '✅ ወዲያውኑ ስልኩን ይዘጉ። ህጋዊ የቴክ ድጋፍ መጀመሪያ አይደውልዎትም።',
      '❌ Don\'t engage with scammers. Hang up and report the call.': '❌ ከማጭበርበሮች ጋር አይሳተፉ። ስልኩን ይዘጉ እና ጥሪውን ያሳውቁ።',
      '✅ If concerned, contact Microsoft directly through their official support channels.': '✅ ከተጨነቁ ማይክሮሶፍትን በኦፊሻዊ ድጋፍ መንገዶቻቸው በቀጥታ ያነጋግሩ።',
      
      'A website offers free software licenses if you provide your company\'s domain and number of employees. What should you do?': 'ድረ-ገጽ የኩባንያዎን ዶሜይን እና የሰራተኞች ቁጥር ካቀረቡ ነጻ የሶፍትዌር ፍቃዶችን ይሰጣል። ምን ማድረግ አለብዎት?',
      'The offer seems legitimate and the software would be useful for your team.': 'አቅርቦቱ ህጋዊ ይመስላል እና ሶፍትዌሩ ለቡድንዎ ጠቃሚ ይሆናል።',
      'Provide the information for free licenses': 'ለነጻ ፍቃዶች መረጃውን ያቅርቡ',
      'Contact the software company directly': 'የሶፍትዌር ኩባንያውን በቀጥታ ያነጋግሩ',
      'Use personal information instead': 'በምትኩ የግል መረጃ ይጠቀሙ',
      'Check with your IT department first': 'መጀመሪያ የIT ክፍልዎን ያረጋግጡ',
      '❌ This is corporate intelligence gathering. Legitimate software companies don\'t offer licenses this way.': '❌ ይህ የኮርፖሬት መረጃ መሰብሰብ ነው። ህጋዊ የሶፍትዌር ኩባንያዎች ፍቃዶችን በዚህ መንገድ አይሰጡም።',
      '✅ Reach out to the software company through official channels to verify the offer.': '✅ አቅርቦቱን ለማረጋገጥ የሶፍትዌር ኩባንያውን በኦፊሻዊ መንገዶች ያነጋግሩ።',
      '❌ Don\'t provide any company information to suspicious sources.': '❌ ለተጠራጣሪ ምንጮች ምንም የኩባንያ መረጃ አይስጡ።',
      '✅ Consult IT before providing any company information to external sources.': '✅ ለውጫዊ ምንጮች ማንኛውንም የኩባንያ መረጃ ከመስጠትዎ በፊት ITን ያማክሩ።',
      
      // Quiz Results and Interface
      '🎉 Congratulations!': '🎉 እንኳን ደስ አለዎት!',
      'You have a good understanding of quid pro quo security!': 'ስለ መለዋወጥ ደህንነት ጥሩ ግንዛቤ አለዎት!',
      '📚 Keep Learning!': '📚 መማርን ይቀጥሉ!',
      'Review the educational content below to improve your security knowledge.': 'የደህንነት እውቀትዎን ለማሻሻል ከታች ያለውን ትምህርታዊ ይዘት ይገምግሙ።',
      'PASS': 'ተሳክቷል',
      'FAIL': 'አልተሳካም',
      '🎯 Excellent Work!': '🎯 እጅግ በጣም ጥሩ ስራ!',
      'You demonstrate strong awareness of quid pro quo attacks. Keep up the good work and continue staying vigilant.': 'የመለዋወጥ ጥቃቶች ጠንካራ ግንዛቤ ያሳያሉ። ጥሩ ስራውን ይቀጥሉ እና ንቁ መሆንን ይቀጥሉ።',
      'Continue following security best practices': 'የደህንነት ጥሩ ልምዶችን መከተል ይቀጥሉ',
      'Share your knowledge with colleagues': 'እውቀትዎን ከስራ ባልደረቦች ጋር ያጋሩ',
      'Stay updated on new social engineering tactics': 'በአዲስ የማህበራዊ ምህንድስና ዘዴዎች ላይ ወቅታዊ ይሁኑ',
      '📈 Good Progress!': '📈 ጥሩ እድገት!',
      'You\'re on the right track but need to improve in some areas. Focus on these key security practices:': 'በትክክለኛው መንገድ ላይ ነዎት ግን በአንዳንድ አካባቢዎች ማሻሻል ያስፈልግዎታል። በእነዚህ ቁልፍ የደህንነት ልምዶች ላይ ያተኩሩ፡',
      'Be skeptical of "free" offers that require personal information': 'የግል መረጃ የሚፈልጉ "ነጻ" አቅርቦቶች ላይ ጥርጣሬ ያድርጉ',
      'Never trade sensitive data for rewards or services': 'ሚስጥራዊ መረጃን ለሽልማቶች ወይም አገልግሎቶች በጭራሽ አይለዋወጡ',
      'Verify offers through official channels': 'አቅርቦቶችን በኦፊሻዊ መንገዶች ያረጋግጡ',
      'When in doubt, don\'t provide any information': 'በጥርጣሬ ውስጥ ሲሆኑ ምንም መረጃ አይስጡ',
      '🚨 Needs Improvement': '🚨 ማሻሻያ ያስፈልጋል',
      'Your quid pro quo security knowledge needs significant improvement. Please review these critical security practices:': 'የመለዋወጥ ደህንነት እውቀትዎ ከፍተኛ ማሻሻያ ያስፈልገዋል። እባክዎን እነዚህን ወሳኝ የደህንነት ልምዶች ይገምግሙ፡',
      'Never provide personal information for "free" services': 'ለ"ነጻ" አገልግሎቶች የግል መረጃ በጭራሽ አይስጡ',
      'Be extremely suspicious of unsolicited offers': 'ያልተጠየቁ አቅርቦቶች ላይ እጅግ በጣም ጥርጣሬ ያድርጉ',
      'Verify all requests through official channels': 'ሁሉንም ጥያቄዎች በኦፊሻዊ መንገዶች ያረጋግጡ',
      'Remember: if it seems too good to be true, it probably is': 'ያስታውሱ፡ በጣም ጥሩ ሆኖ ከታየ፣ ምናልባት እውነት አይደለም',
      'Take additional security awareness training': 'ተጨማሪ የደህንነት ግንዛቤ ስልጠና ይውሰዱ',
      '📋 Detailed Answer Review': '📋 ዝርዝር መልስ ግምገማ',
      'Question': 'ጥያቄ',
      'Scenario:': 'ሁኔታ፡',
      'Your Answer:': 'መልስዎ፡',
      'Result:': 'ውጤት፡',
      '✅ Correct': '✅ ትክክል',
      '❌ Incorrect': '❌ ስህተት',
      'Explanation:': 'ማብራሪያ፡',
      'Back to Results': 'ወደ ውጤቶች ተመለስ',
      'Report suspicious offers to security': 'ተጠራጣሪ አቅርቦቶችን ለደህንነት ያሳውቁ'
    };
  }

  toggle() {
    this.isTranslated = !this.isTranslated;
    localStorage.setItem('amharic-mode', this.isTranslated.toString());
    this.translateAll();
  }

  translateAll() {
    this.translateElement(document.body);
    
    // Translate iframe content immediately
    const iframe = document.querySelector('#module-content iframe');
    if (iframe) {
      // Wait for iframe to load then translate
      iframe.onload = () => {
        setTimeout(() => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
              this.translateElement(iframeDoc.body);
              // Notify iframe about translation change
              iframe.contentWindow.postMessage({type: 'translate', isTranslated: this.isTranslated}, '*');
            }
          } catch (e) {
            this.injectTranslationScript(iframe);
          }
        }, 100);
      };
      
      // Also try to translate if already loaded
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc && iframeDoc.readyState === 'complete') {
          this.translateElement(iframeDoc.body);
          // Notify iframe about translation change
          iframe.contentWindow.postMessage({type: 'translate', isTranslated: this.isTranslated}, '*');
        }
      } catch (e) {
        this.injectTranslationScript(iframe);
      }
    }
  }

  translateElement(element) {
    if (!element) return;
    
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          if (['input', 'textarea', 'select', 'script', 'style'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      const text = textNode.textContent.trim();
      
      if (this.isTranslated && this.translations[text]) {
        textNode.textContent = this.translations[text];
      } else if (!this.isTranslated) {
        // Find original English text
        for (const [english, amharic] of Object.entries(this.translations)) {
          if (text === amharic) {
            textNode.textContent = english;
            break;
          }
        }
      }
    });
  }

  injectTranslationScript(iframe) {
    try {
      const script = iframe.contentDocument.createElement('script');
      script.textContent = `
        const translations = ${JSON.stringify(this.translations)};
        const isTranslated = ${this.isTranslated};
        
        function translateText() {
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tagName = parent.tagName.toLowerCase();
                if (['input', 'textarea', 'select', 'script', 'style'].includes(tagName)) {
                  return NodeFilter.FILTER_REJECT;
                }
                return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
              }
            }
          );
          
          const textNodes = [];
          let node;
          while (node = walker.nextNode()) {
            textNodes.push(node);
          }
          
          textNodes.forEach(textNode => {
            const text = textNode.textContent.trim();
            
            if (isTranslated && translations[text]) {
              textNode.textContent = translations[text];
            } else if (!isTranslated) {
              for (const [english, amharic] of Object.entries(translations)) {
                if (text === amharic) {
                  textNode.textContent = english;
                  break;
                }
              }
            }
          });
        }
        
        translateText();
        
        // Listen for translation updates
        window.addEventListener('message', function(event) {
          if (event.data.type === 'translate') {
            isTranslated = event.data.isTranslated;
            translateText();
          }
        });
      `;
      iframe.contentDocument.head.appendChild(script);
    } catch (e) {
      console.log('Cannot inject translation script');
    }
  }
}

// Initialize translator
window.simpleTranslator = new SimpleTranslator();

// Apply initial translation if enabled
if (window.simpleTranslator.isTranslated) {
  window.addEventListener('DOMContentLoaded', () => {
    window.simpleTranslator.translateAll();
  });
}

// Auto-translate when modules load
window.addEventListener('load', () => {
  if (window.simpleTranslator.isTranslated) {
    setTimeout(() => window.simpleTranslator.translateAll(), 200);
  }
});

// Monitor for iframe changes and translate new content
const observer = new MutationObserver(() => {
  if (window.simpleTranslator.isTranslated) {
    setTimeout(() => window.simpleTranslator.translateAll(), 100);
  }
});

// Start observing when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const moduleContent = document.getElementById('module-content');
  if (moduleContent) {
    observer.observe(moduleContent, { childList: true, subtree: true });
  }
});