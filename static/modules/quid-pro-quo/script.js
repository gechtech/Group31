// Quid Pro Quo Security Quiz JavaScript

(function() {
  // Quiz data with 10 cybersecurity questions
  const quizQuestions = [
    {
      question: "A coffee shop offers free WiFi but requires your email and phone number. What should you do?",
      scenario: "You're working remotely and need internet access. The sign says 'Free WiFi - Just provide email and phone for security'.",
      options: [
        { text: "Provide the information to get free WiFi", correct: false, explanation: "❌ Never trade personal information for free services. This is a common data harvesting tactic." },
        { text: "Use your mobile data instead", correct: true, explanation: "✅ Use your mobile hotspot or data plan. Your personal information is more valuable than free WiFi." },
        { text: "Use a fake email and phone number", correct: false, explanation: "❌ Even fake information can be used for tracking. Avoid the service entirely." },
        { text: "Ask if there's a guest network", correct: true, explanation: "✅ Ask for a guest network that doesn't require personal information." }
      ]
    },
    {
      question: "You receive a text offering a $50 gift card in exchange for completing a 'quick security survey'. How do you respond?",
      scenario: "The text includes a link and claims to be from a major retailer you shop at regularly.",
      options: [
        { text: "Click the link and complete the survey", correct: false, explanation: "❌ This is a classic quid pro quo scam. Legitimate companies don't offer gift cards via text surveys." },
        { text: "Ignore the message completely", correct: true, explanation: "✅ Delete and ignore. Legitimate offers come through official channels, not random texts." },
        { text: "Reply asking for more details", correct: false, explanation: "❌ Don't engage with suspicious messages. This confirms your number is active." },
        { text: "Forward to the retailer's official support", correct: true, explanation: "✅ Report phishing attempts to the legitimate company through their official channels." }
      ]
    },
    {
      question: "A job recruiter offers you a high-paying position but needs your social security number for 'background verification'. What's your response?",
      scenario: "The recruiter contacted you via LinkedIn and the job seems legitimate with a well-known company name.",
      options: [
        { text: "Provide your SSN since it's for a job", correct: false, explanation: "❌ Never provide SSN via email or phone. Legitimate employers handle this through secure, official processes." },
        { text: "Ask to meet in person first", correct: true, explanation: "✅ Insist on meeting in person and verify the recruiter's identity before sharing any sensitive information." },
        { text: "Provide partial SSN (last 4 digits)", correct: false, explanation: "❌ Even partial SSN can be used for identity theft. Don't share any part of it." },
        { text: "Verify the company and recruiter independently", correct: true, explanation: "✅ Research the company and recruiter through official channels before proceeding." }
      ]
    },
    {
      question: "A software download site offers a 'premium version' if you provide your work email and company name. What should you do?",
      scenario: "You need software for a work project and the site looks professional with good reviews.",
      options: [
        { text: "Provide the information for the premium version", correct: false, explanation: "❌ This is a data harvesting technique. Legitimate software doesn't require work details for free versions." },
        { text: "Download from the official software website", correct: true, explanation: "✅ Always download software from official sources. Avoid third-party sites that ask for personal information." },
        { text: "Use a personal email instead", correct: false, explanation: "❌ Don't provide any personal information to suspicious sites. Find the official source." },
        { text: "Ask your IT department for approved software", correct: true, explanation: "✅ Check with IT for approved software sources and licensing requirements." }
      ]
    },
    {
      question: "A survey company offers $100 for completing a 'market research' survey that asks for your bank account details. How do you respond?",
      scenario: "The email looks professional and claims to be from a legitimate market research company.",
      options: [
        { text: "Complete the survey for the money", correct: false, explanation: "❌ Legitimate surveys never ask for bank account details. This is a financial scam." },
        { text: "Delete the email immediately", correct: true, explanation: "✅ Delete immediately. No legitimate survey requires bank account information." },
        { text: "Reply asking for more information", correct: false, explanation: "❌ Don't engage with suspicious emails. This confirms your email is active." },
        { text: "Report to your bank's fraud department", correct: true, explanation: "✅ Report phishing attempts to your bank and relevant authorities." }
      ]
    },
    {
      question: "A mobile app offers free premium features if you 'verify your identity' with a photo of your driver's license. What's your response?",
      scenario: "The app has good ratings and claims the verification is for 'age verification' purposes.",
      options: [
        { text: "Upload the photo for free features", correct: false, explanation: "❌ Never share government ID photos with apps. This is identity theft waiting to happen." },
        { text: "Use the free version without verification", correct: true, explanation: "✅ Use the free version or find an alternative app that doesn't require ID verification." },
        { text: "Blur out sensitive information first", correct: false, explanation: "❌ Even partially visible ID information can be used for identity theft." },
        { text: "Research the app's privacy policy first", correct: true, explanation: "✅ Check the app's privacy policy and reviews before providing any personal information." }
      ]
    },
    {
      question: "A website offers free access to premium content if you provide your work computer's IP address. What should you do?",
      scenario: "The site claims to need your IP for 'security verification' to prevent unauthorized access.",
      options: [
        { text: "Provide the IP address for access", correct: false, explanation: "❌ Never share your work IP address. This could be used for network attacks." },
        { text: "Use a VPN and provide that IP instead", correct: false, explanation: "❌ Don't provide any IP address. Legitimate sites don't require this information." },
        { text: "Find alternative content sources", correct: true, explanation: "✅ Look for legitimate sources that don't require personal network information." },
        { text: "Ask your IT department about the request", correct: true, explanation: "✅ Consult IT before sharing any network information with external sites." }
      ]
    },
    {
      question: "A social media contest offers a prize if you provide your home address and phone number for 'delivery purposes'. How do you respond?",
      scenario: "The contest is from a brand you follow and the prize is something you really want.",
      options: [
        { text: "Provide the information to win the prize", correct: false, explanation: "❌ Legitimate contests don't require home addresses upfront. This is likely a data harvesting scam." },
        { text: "Use a P.O. Box address instead", correct: false, explanation: "❌ Even P.O. Box addresses can be used for tracking and profiling." },
        { text: "Check if the contest is legitimate first", correct: true, explanation: "✅ Verify the contest through the company's official website and social media." },
        { text: "Ignore the contest completely", correct: true, explanation: "✅ When in doubt, avoid. Your personal information is more valuable than any prize." }
      ]
    },
    {
      question: "A tech support call offers to 'fix your computer for free' if you provide remote access and your password. What's your response?",
      scenario: "The caller claims to be from Microsoft and says your computer has been sending error reports.",
      options: [
        { text: "Provide access since it's free help", correct: false, explanation: "❌ This is a classic tech support scam. Microsoft never calls users unsolicited." },
        { text: "Hang up immediately", correct: true, explanation: "✅ Hang up immediately. Legitimate tech support never calls you first." },
        { text: "Ask for their employee ID number", correct: false, explanation: "❌ Don't engage with scammers. Hang up and report the call." },
        { text: "Call Microsoft directly to verify", correct: true, explanation: "✅ If concerned, contact Microsoft directly through their official support channels." }
      ]
    },
    {
      question: "A website offers free software licenses if you provide your company's domain and number of employees. What should you do?",
      scenario: "The offer seems legitimate and the software would be useful for your team.",
      options: [
        { text: "Provide the information for free licenses", correct: false, explanation: "❌ This is corporate intelligence gathering. Legitimate software companies don't offer licenses this way." },
        { text: "Contact the software company directly", correct: true, explanation: "✅ Reach out to the software company through official channels to verify the offer." },
        { text: "Use personal information instead", correct: false, explanation: "❌ Don't provide any company information to suspicious sources." },
        { text: "Check with your IT department first", correct: true, explanation: "✅ Consult IT before providing any company information to external sources." }
      ]
    }
  ];

  // DOM elements
  const introCard = document.getElementById('intro-card');
  const quizCard = document.getElementById('quiz-card');
  const resultsCard = document.getElementById('results-card');
  const startQuizBtn = document.getElementById('start-quiz');
  const nextQuestionBtn = document.getElementById('next-question');
  const finishQuizBtn = document.getElementById('finish-quiz');
  const retakeQuizBtn = document.getElementById('retake-quiz');
  const viewAnswersBtn = document.getElementById('view-answers');

  // Quiz state
  let currentQuestion = 0;
  let score = 0;
  let userAnswers = [];
  let quizStarted = false;

  // Initialize quiz
  function initQuiz() {
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    quizStarted = false;
    
    // Show intro card
    introCard.classList.remove('hidden');
    quizCard.classList.add('hidden');
    resultsCard.classList.add('hidden');
  }

  // Start quiz
  function startQuiz() {
    quizStarted = true;
    introCard.classList.add('hidden');
    quizCard.classList.remove('hidden');
    showQuestion();
  }

  // Show current question
  function showQuestion() {
    const question = quizQuestions[currentQuestion];
    const questionText = document.getElementById('question-text');
    const questionScenario = document.getElementById('question-scenario');
    const optionsContainer = document.getElementById('options-container');
    const currentQuestionSpan = document.getElementById('current-question');
    const progressFill = document.getElementById('progress-fill');

    // Update question text
    questionText.textContent = question.question;
    questionScenario.textContent = question.scenario;
    currentQuestionSpan.textContent = currentQuestion + 1;

    // Update progress bar
    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
    progressFill.style.width = `${progress}%`;

    // Clear previous options
    optionsContainer.innerHTML = '';

    // Create option buttons
    question.options.forEach((option, index) => {
      const optionBtn = document.createElement('button');
      optionBtn.className = 'option-btn';
      optionBtn.textContent = option.text;
      optionBtn.addEventListener('click', () => selectOption(option, index));
      optionsContainer.appendChild(optionBtn);
    });

    // Update navigation buttons
    nextQuestionBtn.classList.add('hidden');
    finishQuizBtn.classList.add('hidden');
  }

  // Handle option selection
  function selectOption(option, index) {
    // Disable all options
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
      btn.disabled = true;
      btn.classList.add('disabled');
    });

    // Mark selected option
    optionBtns[index].classList.add('selected');

    // Show explanation
    const explanation = document.createElement('div');
    explanation.className = 'explanation';
    explanation.innerHTML = option.explanation;
    document.getElementById('options-container').appendChild(explanation);

    // Update score
    if (option.correct) {
      score++;
    }

    // Store answer
    userAnswers.push({
      question: currentQuestion,
      selected: index,
      correct: option.correct,
      explanation: option.explanation
    });

    // Show next button
    if (currentQuestion < quizQuestions.length - 1) {
      nextQuestionBtn.classList.remove('hidden');
    } else {
      finishQuizBtn.classList.remove('hidden');
    }
  }

  // Next question
  function nextQuestion() {
    currentQuestion++;
    showQuestion();
  }

  // Finish quiz
  function finishQuiz() {
    quizCard.classList.add('hidden');
    resultsCard.classList.remove('hidden');
    showResults();
  }

  // Show results
  function showResults() {
    const accuracy = Math.round((score / quizQuestions.length) * 100);
    const passed = accuracy >= 70; // 70% pass threshold

    // Update score display
    document.getElementById('score-number').textContent = score;
    document.getElementById('correct-answers').textContent = `${score}/${quizQuestions.length}`;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    
    // Update pass/fail status
    const passFailElement = document.getElementById('pass-fail');
    if (passed) {
      passFailElement.textContent = 'PASS';
      passFailElement.className = 'score-value pass';
      document.getElementById('results-title').textContent = '🎉 Congratulations!';
      document.getElementById('results-subtitle').textContent = 'You have a good understanding of quid pro quo security!';
    } else {
      passFailElement.textContent = 'FAIL';
      passFailElement.className = 'score-value fail';
      document.getElementById('results-title').textContent = '📚 Keep Learning!';
      document.getElementById('results-subtitle').textContent = 'Review the educational content below to improve your security knowledge.';
    }

    // Update score circle color
    const scoreCircle = document.getElementById('score-circle');
    scoreCircle.className = `score-circle ${passed ? 'pass' : 'fail'}`;

    // Show recommendations
    showRecommendations(accuracy, passed);
  }

  // Show recommendations based on score
  function showRecommendations(accuracy, passed) {
    const recommendationsDiv = document.getElementById('recommendations');
    let recommendations = '';

    if (passed) {
      recommendations = `
        <div class="recommendation-section">
          <h4>🎯 Excellent Work!</h4>
          <p>You demonstrate strong awareness of quid pro quo attacks. Keep up the good work and continue staying vigilant.</p>
          <ul>
            <li>Continue following security best practices</li>
            <li>Share your knowledge with colleagues</li>
            <li>Stay updated on new social engineering tactics</li>
          </ul>
        </div>
      `;
    } else if (accuracy >= 50) {
      recommendations = `
        <div class="recommendation-section">
          <h4>📈 Good Progress!</h4>
          <p>You're on the right track but need to improve in some areas. Focus on these key security practices:</p>
          <ul>
            <li>Be skeptical of "free" offers that require personal information</li>
            <li>Never trade sensitive data for rewards or services</li>
            <li>Verify offers through official channels</li>
            <li>When in doubt, don't provide any information</li>
          </ul>
        </div>
      `;
    } else {
      recommendations = `
        <div class="recommendation-section">
          <h4>🚨 Needs Improvement</h4>
          <p>Your quid pro quo security knowledge needs significant improvement. Please review these critical security practices:</p>
          <ul>
            <li>Never provide personal information for "free" services</li>
            <li>Be extremely suspicious of unsolicited offers</li>
            <li>Verify all requests through official channels</li>
            <li>Remember: if it seems too good to be true, it probably is</li>
            <li>Take additional security awareness training</li>
          </ul>
        </div>
      `;
    }

    recommendationsDiv.innerHTML = recommendations;
  }

  // View detailed answers
  function viewAnswers() {
    let answersHtml = '<div class="detailed-answers"><h3>📋 Detailed Answer Review</h3>';
    
    quizQuestions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer.correct;
      
      answersHtml += `
        <div class="answer-item ${isCorrect ? 'correct' : 'incorrect'}">
          <h4>Question ${index + 1}: ${question.question}</h4>
          <p><strong>Scenario:</strong> ${question.scenario}</p>
          <p><strong>Your Answer:</strong> ${question.options[userAnswer.selected].text}</p>
          <p><strong>Result:</strong> ${isCorrect ? '✅ Correct' : '❌ Incorrect'}</p>
          <p><strong>Explanation:</strong> ${userAnswer.explanation}</p>
        </div>
      `;
    });
    
    answersHtml += '</div>';
    
    // Show in a modal or replace content
    const resultsContent = document.querySelector('.results-content');
    resultsContent.innerHTML = answersHtml + '<button id="back-to-results" class="btn btn-outline">Back to Results</button>';
    
    // Add back button functionality
    document.getElementById('back-to-results').addEventListener('click', () => {
      showResults();
    });
  }

  // Event listeners
  startQuizBtn.addEventListener('click', startQuiz);
  nextQuestionBtn.addEventListener('click', nextQuestion);
  finishQuizBtn.addEventListener('click', finishQuiz);
  retakeQuizBtn.addEventListener('click', initQuiz);
  viewAnswersBtn.addEventListener('click', viewAnswers);

  // Initialize quiz on load
  initQuiz();
})();
