"use client"
import React from 'react';

interface NewsItemProps {
  news: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    url: string;
  };
}

const NewsItem: React.FC<NewsItemProps> = ({ news }) => {
  return (
    <div className="flex items-center gap-x-4 w-full">
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-2">{news.title}</h2>
        <p className="text-gray-600 mb-4">{news.description}</p>
        <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
          Read more
        </a>
      </div>
      {news.imageUrl && (
        <img src={news.imageUrl} alt={news.title} className="w-32 h-32 object-cover rounded-lg" />
      )}
    </div>
  );
};

export default NewsItem;
