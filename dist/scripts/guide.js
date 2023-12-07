/**
 * @file Contains functionality to create a tabbed interface for the user guide section of the application.
 * It uses jQuery to attach click event handlers on the tabs to show and hide content.
 */

/**
 * Sets up the click event handlers for the tabs.
 * When a tab is clicked, it becomes active and its associated content is displayed, while the other tabs and content are hidden.
 */
export function setupTabs() {
  $(".tab a").on("click", function (e) {
    e.preventDefault();

    $(this).parent().addClass("active-tac");
    $(this).parent().siblings().removeClass("active-tac");

    const target = $(this).attr("href"); // Get the href attribute

    $(".tab-content > div").not(target).hide(); // Hide other tabs' content
    $(target).fadeIn(600); // Fade in the clicked tab's content
  });
}

/**
 * Initializes the tab functionality on document ready.
 * It hides all tab content initially and then shows the first tab's content.
 * The setupTabs function is called to ensure tabs are functional after the page has loaded.
 */
$(document).ready(function () {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    console.log("No access token found.");
    window.location.href = 'https://lineup-manager.netlify.app/';
    return;
  }
  // Hide all tab content divs
  $(".tab-content > div").hide();

  // Show the first one
  $(".tab-content > div:first-child").show();

  // Run the setupTabs function
  setupTabs();
});