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
  let articleClicks = {};

  function handleArticleClick(articleName) {
    if (articleClicks.hasOwnProperty(articleName)) {
      articleClicks[articleName]++;
    } else {
      articleClicks[articleName] = 1;
    }
    
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
      displayPopularArticles();
    })
    .catch(error => {
      console.error('Error updating click count:', error);
    });
  }

  function displayPopularArticles() {
    const popularArticles = Object.entries(articleClicks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const popularArticlesList = document.querySelector("#popular-articles-list");
    popularArticlesList.innerHTML = "";

    popularArticles.forEach(([article, clicks]) => {
      const articleItem = document.createElement("li");

      // Find the corresponding article link in the left menu section
      const articleLink = findArticleLink(article);
      if (articleLink) {
        const linkElement = document.createElement("a");
        linkElement.href = articleLink.href;
        linkElement.textContent = article;
        articleItem.appendChild(linkElement);
        // Removed the click count display
        // articleItem.innerHTML += ` (${clicks} clicks)`;
        popularArticlesList.appendChild(articleItem);
      }
    });
  }

  function findArticleLink(articleName) {
    const leftMenuLinks = document.querySelectorAll("#left-menu-new .article-link");
    const knowledgeBaseLinks = document.querySelectorAll("#knowledge-base .article-link");
    
    const allLinks = [...leftMenuLinks, ...knowledgeBaseLinks];
    for (const link of allLinks) {
      if (link.dataset.article === articleName) {
        return link;
      }
    }
    return null;
  }

  function attachClickHandlers(selector) {
    const links = document.querySelectorAll(selector);
    links.forEach(link => {
      link.addEventListener("click", function(event) {
        event.preventDefault();
        const articleName = link.dataset.article;
        handleArticleClick(articleName);
        setTimeout(() => {
          window.location.href = link.href;
        }, 100);
      });
    });
  }

  attachClickHandlers("#left-menu-new .article-link");
  attachClickHandlers("#knowledge-base .article-link");

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
        displayPopularArticles();
      })
      .catch(error => {
        console.error('Error loading popular articles:', error);
      });
  }

  loadPopularArticles();
});



