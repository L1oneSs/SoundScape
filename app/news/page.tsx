"use client"
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import NewsContent from './components/NewsContent';
import getNews from '@/actions/getNews';

const NewsPage = () => {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const fetchedNews = await getNews();
        setNews(fetchedNews);
      } catch (error) {
        console.error('Error fetching news:', error);
        // Обработка ошибки, если не удалось загрузить новости
      }
    }
    
    fetchNews();
  }, []);

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="mt-20">
          <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold">Latest Music News</h1>
        </div>
      </Header>
      <NewsContent news={news} />
    </div>
  );
};

export default NewsPage;
