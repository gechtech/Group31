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
      'Use official apps and websites only': 'የኦፊሻዊ አፕሊኬሽኖች እና ድር-ገጾችን ብቻ ይጠቀሙ',
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