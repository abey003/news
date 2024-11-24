const newsContainer = document.getElementById('news-container');
const dateElement = document.getElementById('date');

// Display current date
const today = new Date();
dateElement.innerText = `Today's News - ${today.toDateString()}`;

// Fetch and display articles
const fetchAndDisplayArticles = async (category = 'general') => {
  const apiUrl = `/api/news?category=${category}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    newsContainer.innerHTML = '';

    if (data.status === 'ok' && data.articles.length > 0) {
      data.articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.classList.add('article');

        articleElement.innerHTML = `
          <img src="${article.urlToImage || ''}" alt="News Image">
          <h2>${article.title}</h2>
          <p>${article.description || 'No description available.'}</p>
          <a href="${article.url}" target="_blank">Read more</a>
        `;

        newsContainer.appendChild(articleElement);
      });
    } else {
      newsContainer.innerHTML = '<p>No news articles available at the moment.</p>';
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    newsContainer.innerHTML = '<p>Error loading news. Please try again later.</p>';
  }
};

// Event listener for navbar clicks
document.getElementById('navbar').addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    e.preventDefault();
    const category = e.target.getAttribute('data-category');
    fetchAndDisplayArticles(category);
  }
});

// Load general news on page load
fetchAndDisplayArticles();
