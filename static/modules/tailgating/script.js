(function() {
  // Get all scenario buttons
  const scenarioBtns = document.querySelectorAll('.scenario-btn');

  // Add click handlers to scenario buttons
  scenarioBtns.forEach((btn, index) => {
    btn.addEventListener('click', function() {
      const scenarios = [
        {
          title: "Office Building Entry",
          message: "Scenario: You're entering your office building with your access card. A person behind you asks you to hold the door open because they forgot their card. What do you do?\n\n✅ Correct Response: Politely decline and ask them to use their own access card or contact security.\n\n❌ Wrong Response: Holding the door open for strangers compromises building security."
        },
        {
          title: "Server Room Access", 
          message: "Scenario: You're accessing the secure server room for maintenance. Someone claims to be a new IT contractor and asks to follow you in. What do you do?\n\n✅ Correct Response: Ask for proper identification and verification through your supervisor or security team.\n\n❌ Wrong Response: Allowing unauthorized access to server rooms can lead to data breaches and system compromise."
        },
        {
          title: "Delivery Access",
          message: "Scenario: A delivery person needs access to your secure facility but doesn't have proper authorization. They seem frustrated and claim it's urgent. What do you do?\n\n✅ Correct Response: Direct them to the main reception or security desk for proper authorization and escort.\n\n❌ Wrong Response: Granting access without verification can allow unauthorized individuals into restricted areas."
        }
      ];

      alert(`${scenarios[index].title}\n\n${scenarios[index].message}`);
    });
  });
})();
