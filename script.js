// SCROLL VIEW SMOOTH FUNCTIONNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN

function scrollToSection(sectionId) {
  var section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

window.addEventListener("scroll", function () {
  var scrollHeader = document.querySelector(".scroll-header");
  var videoSection = document.getElementById("video-section");
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > videoSection.offsetTop) {
    scrollHeader.style.display = "block";
  } else {
    scrollHeader.style.display = "none";
  }
});

// DROP DOWN LEFT MENUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU
document.addEventListener('DOMContentLoaded', function() {
  // Add click event listener to each category
  document.querySelectorAll('.left-menu-category').forEach(category => {
    category.addEventListener('click', () => {
      // Toggle clicked class to show/hide subtopics
      category.classList.toggle('clicked');

      // Toggle dropdown icon
      const icon = category.querySelector('.icon');
      if (icon) {
        icon.textContent = category.classList.contains('clicked') ? '▲' : '▼';
      }
    });
  });
});


// POPUPAR ARTICLE FUNCTIONNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN
document.addEventListener("DOMContentLoaded", function() {
  // Define articleClicks as a global variable
  let articleClicks = {};

  // Function to handle article clicks and update click count
  function handleArticleClick(articleName) {
    // Update the click count for the clicked article
    if (articleClicks.hasOwnProperty(articleName)) {
      articleClicks[articleName]++;
    } else {
      articleClicks[articleName] = 1;
    }
    
    // Send a POST request to update the click count data on the server
    fetch('/update-click-count', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ articleName, clickCount: articleClicks[articleName] })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update click count');
      }
      // Call the function to display popular articles with the updated data
      displayPopularArticles();
    })
    .catch(error => {
      console.error('Error updating click count:', error);
    });
  }

  // Function to retrieve and display popular articles
  function displayPopularArticles() {
    // Sort articles by click count in descending order
    const popularArticles = Object.entries(articleClicks)
      .sort((a, b) => b[1] - a[1]) // Sort by click count
      .slice(0, 5); // Get top 5 articles

    // Clear any existing articles
    const popularArticlesList = document.querySelector("#popular-articles-list");
    popularArticlesList.innerHTML = "";

    // Display popular articles
    popularArticles.forEach(([article, clicks]) => {
      const articleItem = document.createElement("li");
      articleItem.innerHTML = `<a href="#">${article}</a> (${clicks} clicks)`;
      popularArticlesList.appendChild(articleItem);
    });
  }

  // Attach event listeners to the article links in the left menu section
  const leftMenuLinks = document.querySelectorAll("#left-menu-new .article-link");
  leftMenuLinks.forEach(link => {
    link.addEventListener("click", function(event) {
      // Prevent the default behavior of the link
      event.preventDefault();

      // Get the article name from the link's dataset
      const articleName = link.dataset.article;
      
      // Handle the click for this article
      handleArticleClick(articleName);

      // Navigate to the linked website after updating the click count
      // You can modify this behavior as needed
      setTimeout(() => {
        window.location.href = link.href;
      }, 100); // Adjust the delay time as needed
    });
  });

  // Function to retrieve click count data from the server and display popular articles
  function loadPopularArticles() {
      fetch('/click-count-data')
          .then(response => {
              if (!response.ok) {
                  throw new Error('Failed to retrieve click count data');
              }
              return response.json();
          })
          .then(articleClicksData => {
              articleClicks = articleClicksData;
              // Call the function to display popular articles with the retrieved data
              displayPopularArticles();
          })
          .catch(error => {
              console.error('Error loading popular articles:', error);
          });
  }

  // Call the function to load popular articles when the page is loaded
  loadPopularArticles();
});

