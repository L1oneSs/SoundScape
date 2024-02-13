import React from 'react';

interface NewsItem {
  title: string;
  description: string;
  publishedAt: string;
  url: string;
}

interface NewsContentProps {
  news: NewsItem[];
}

const NewsContent: React.FC<NewsContentProps> = ({ news }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 m-2">
      {news.map((article: NewsItem, index: number) => {
        if (article.title.includes('Removed')) {
          return null;
        }
        return (
          <div key={index} className="bg-neutral-800 text-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{article.title}</h2>
            <p className="text-gray-300 mb-4">{article.description}</p>
            <p className="text-gray-400 italic">Published at: {article.publishedAt}</p>
            <a className="text-orange-500 hover:underline" href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
          </div>
        );
      })}
    </div>
  );
}

export default NewsContent;
