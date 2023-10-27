export function setupTabs() {

    $(".tab a").on("click", function (e) {
      e.preventDefault();
  
      $(this).parent().addClass("active-tac");
      $(this).parent().siblings().removeClass("active-tac");
  
      const target = $(this).attr("href");  // Declare target with const
  
      $(".tab-content > div").not(target).hide();
  
      $(target).fadeIn(600);
    });
  }
  
  // Initialize tabs
  $(document).ready(function() {
    // Hide all tab content divs
    $(".tab-content > div").hide();
    
    // Show the first one
    $(".tab-content > div:first-child").show();
    
    // Run the setupTabs function
    setupTabs();
  });
  