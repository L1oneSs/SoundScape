import axios from 'axios';

const getMusicNews = async () => {

  const NEWS_API_KEY = 'de1c6ca593b64f6f9df6d887dc55e853'

  try {
    const musicResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        category: 'entertainment',
        q: 'music',
        apiKey: NEWS_API_KEY 
      }
    });

    const concertResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'gb',
        category: 'entertainment',
        q: 'music',
        apiKey: NEWS_API_KEY
      }
    });


    const allArticles = [...musicResponse.data.articles, ...concertResponse.data.articles];

    console.log('Response data:', allArticles);

    return allArticles;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('Failed to fetch news');
  }
};

export default getMusicNews;



