'use client';

import React, { useState, useEffect } from 'react';
import { ConferenceAPI } from '@/app/services/api';

const ConferencesPage = () => {
  const [conferences, setConferences] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  const fetchConferences = async (currentPage = page) => {
    try {
      // setLoading(true);
      const response = await ConferenceAPI.list(`?page=${currentPage}`);
      const data = response.data;
      setConferences(data.results || []);
      setNext(data.next);
      setPrevious(data.previous);
      // setLoading(false);
    } catch (err) {
      setError('Failed to load conferences.');
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchConferences(page);
  }, [page]);

  // Only keep upcoming and ongoing
  const upcoming = conferences.filter(conf => conf.status === 'upcoming');
  const ongoing = conferences.filter(conf => conf.status === 'ongoing');

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
  //         <p className="text-gray-700 text-lg font-semibold">Loading conferences...</p>
  //         <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the latest information</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-xl max-w-md p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Conferences</h3>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ConferenceCard = ({ conf }) => (
    <li className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 transform hover:-translate-y-2">
      {conf.banner && (
        <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
          <img 
            src={conf.banner} 
            alt={conf.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-4 right-4">
            <span className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-lg border border-gray-200">
              {conf.mode}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-7">
        <div className="mb-4">
          <span className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-bold px-4 py-1.5 rounded-full border border-blue-200">
            {conf.type}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
          {conf.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
          {conf.description ? `${conf.description.slice(0, 100)}...` : 'No description available'}
        </p>
        
        <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
          <div className="flex items-center text-sm text-gray-700">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-gray-900 block text-xs mb-0.5">Start Date</span>
              <span className="text-gray-600">{new Date(conf.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {conf.end_date && (
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-gray-900 block text-xs mb-0.5">End Date</span>
                <span className="text-gray-600">{new Date(conf.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-700">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-gray-900 block text-xs mb-0.5">Location</span>
              <span className="text-gray-600">{conf.location || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {conf.website && (
          <a 
            href={conf.website} 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group/btn"
          >
            <span>Visit Conference Website</span>
            <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        )}
      </div>
    </li>
  );

  const Section = ({ title, conferences, color, icon, description }) => (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className={`w-1.5 h-12 ${color} rounded-full mr-5 shadow-md`}></div>
          <div>
            <h2 className="text-4xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">{icon}</span>
              {title}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center bg-white px-5 py-2.5 rounded-full shadow-md border border-gray-200">
          <span className="text-2xl font-bold text-gray-900">{conferences.length}</span>
          <span className="text-gray-500 text-sm ml-2 font-medium">Events</span>
        </div>
      </div>

      {conferences.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {conferences.map(conf => (
            <ConferenceCard key={conf.id} conf={conf} />
          ))}
        </ul>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Conferences Available</h3>
          <p className="text-gray-500 text-base">There are no {title.toLowerCase()} at the moment. Check back soon for updates!</p>
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-6 py-2 rounded-full text-sm font-bold border border-blue-200">
              Academic Events Directory
            </span>
          </div>
          <h1 className="text-6xl font-extrabold text-gray-900 mb-5 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Academic Conferences
            </span>
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Discover and explore academic conferences, symposiums, and workshops from around the globe. Stay updated with the latest events in your field.
          </p>
        </div>

        {/* Sections */}
        <Section 
          title="Ongoing Conferences" 
          conferences={ongoing} 
          color="bg-gradient-to-b from-green-500 to-emerald-600"
          description="Currently happening events"
          icon={
            <span className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
          }
        />
        
        <Section 
          title="Upcoming Conferences" 
          conferences={upcoming} 
          color="bg-gradient-to-b from-blue-500 to-indigo-600"
          description="Events scheduled for the future"
          icon={
            <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </span>
          }
        />

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-6 mt-20">
          <button
            disabled={!previous}
            onClick={() => setPage(prev => prev - 1)}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105 
              ${previous 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="bg-white px-8 py-4 rounded-xl shadow-lg border border-gray-200">
            <span className="text-sm font-semibold text-gray-500 block mb-1">Current Page</span>
            <span className="text-3xl font-bold text-gray-900">{page}</span>
          </div>

          <button
            disabled={!next}
            onClick={() => setPage(prev => prev + 1)}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105 
              ${next 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConferencesPage;