/**
 * @file Contains functionality to create a tabbed interface for the user guide section of the application.
 * It uses jQuery to attach click event handlers on the tabs to show and hide content.
 */

/**
 * Sets up the click event handlers for the tabs.
 * When a tab is clicked, it becomes active and its associated content is displayed, while the other tabs and content are hidden.
 */
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab a');
  const contents = document.querySelectorAll('.tab-content > div');

  tabs.forEach(tab => {
      tab.addEventListener('click', function (e) {
          e.preventDefault();

          // Toggle active class on tabs
          tabs.forEach(t => t.parentElement.classList.remove('active-tac'));
          tab.parentElement.classList.add('active-tac');

          // Hide all content divs and show the clicked one
          const targetContent = document.querySelector(tab.getAttribute('href'));
          contents.forEach(content => content.style.display = 'none');
          targetContent.style.display = '';

      });
  });
});
