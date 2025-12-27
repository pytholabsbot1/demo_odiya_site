import React, { useState, useEffect } from 'react';
import { NewsArticle, NewsCategory } from '../types';
import { DEMO_NEWS } from '../constants';
import { Calendar, ArrowUpRight, Filter } from 'lucide-react';

/* 
  --- BACKEND INTEGRATION NOTE ---
  Currently using static DEMO_NEWS.
  To integrate: Replace useEffect with fetch('/api/news') to your DB.
*/

const NewsFeed: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setArticles(DEMO_NEWS);
      setIsLoading(false);
    }, 600);
  }, []);

  const filteredArticles = activeCategory === 'All' 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  const categories: NewsCategory[] = ['All', 'Odisha', 'Politics', 'Technology', 'Sports', 'Culture'];

  return (
    <div className="h-full overflow-y-auto bg-gray-50/50 scroll-smooth">
      
      {/* Modern Hero Header */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-6 sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h5 className="text-brand-600 font-bold uppercase tracking-widest text-xs mb-2">Live Updates</h5>
              <h1 className="text-4xl font-extrabold text-gray-900 font-odia tracking-tight">
                Odisha News Daily
              </h1>
            </div>
            
            {/* Minimalist Filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeCategory === cat 
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-105' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Magazine Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <article 
                key={article.id} 
                className={`group flex flex-col bg-white rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 ring-1 ring-gray-100 ${
                   index === 0 ? 'md:col-span-2 lg:col-span-2' : '' // First article is featured
                }`}
              >
                {/* Image Container */}
                <div className={`relative overflow-hidden ${index === 0 ? 'h-96' : 'h-56'}`}>
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm border border-white/50">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <span>{article.source}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <h3 className={`font-bold text-gray-900 font-odia leading-tight group-hover:text-brand-700 transition-colors mb-3 ${
                    index === 0 ? 'text-2xl md:text-3xl' : 'text-xl'
                  }`}>
                    {article.titleOdia || article.title}
                  </h3>
                  
                  {/* Show English Title if Odia exists as subtitle */}
                  {article.titleOdia && (
                    <h4 className="text-gray-500 font-medium text-sm mb-3">
                      {article.title}
                    </h4>
                  )}

                  <p className="text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                    {article.content}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <button className="text-sm font-bold text-gray-900 flex items-center gap-1 group/btn">
                      Read Story
                      <ArrowUpRight size={16} className="text-brand-600 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        
        {!isLoading && filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">No stories found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;