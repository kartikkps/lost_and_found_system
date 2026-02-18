import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, PlusCircle, Flag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {}
            <div className="relative overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Lost something?</span>{' '}
                                    <span className="block text-brand xl:inline">Let's find it.</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    The community-driven platform to report lost items and reunite found treasures with their owners. Simple, fast, and effective.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/report"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-brand-foreground bg-brand hover:bg-brand-hover md:py-4 md:text-lg"
                                        >
                                            Report Lost Item
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            to="/browse"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-brand bg-gray-100 hover:bg-gray-200 md:py-4 md:text-lg"
                                        >
                                            I Found Something
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-100 flex items-center justify-center">
                    {}
                    <div className="w-full h-full bg-gradient-to-br from-yellow-50 to-gray-200 flex items-center justify-center">
                        <MapPin size={120} className="text-brand animate-bounce" />
                    </div>
                </div>
            </div>

            {}
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-brand font-semibold tracking-wide uppercase">How it works</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Reuniting items made easy
                        </p>
                    </div>

                    <div className="mt-10">
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                            {[
                                {
                                    title: 'Report',
                                    description: 'Lost or found something? Submit a report with details and location.',
                                    icon: <Flag className="h-6 w-6 text-white" />,
                                },
                                {
                                    title: 'Match',
                                    description: 'Our smart search helps you find matches quickly.',
                                    icon: <Search className="h-6 w-6 text-white" />,
                                },
                                {
                                    title: 'Connect',
                                    description: 'Securely connect with the finder or owner to retrieve your item.',
                                    icon: <User className="h-6 w-6 text-white" />,
                                },
                            ].map((feature) => (
                                <div key={feature.title} className="relative">
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-brand text-brand-foreground">
                                            {feature.icon}
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
