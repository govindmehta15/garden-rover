import React from 'react';
import { Github, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-100 dark:bg-black border-t border-gray-200 dark:border-white/10 py-12 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-8 md:mb-0 text-center md:text-left">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold text-2xl tracking-wider">Garden Rover</span>
                        <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">Smart Garden Brain Robot</p>
                        <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">Think, Planed and Executed by Govind Mehta</p>
                        <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">govindmehta4658@gmail.com</p>
                        <div className="mt-4 flex gap-4 justify-center md:justify-start">
                            {/* GitHub */}
                            <a
                                href="https://github.com/govindmehta"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-emerald-500 dark:hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center group"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
                            </a>

                            {/* LinkedIn */}
                            <a
                                href="https://linkedin.com/in/govindmehta"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-emerald-500 dark:hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center group"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
                            </a>

                            {/* Instagram */}
                            <a
                                href="https://instagram.com/govindmehta"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-emerald-500 dark:hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center group"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
                            </a>
                        </div>
                    </div>

                    <div className="flex space-x-8">
                        <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-white transition-colors text-sm font-medium">Privacy</a>
                        <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-white transition-colors text-sm font-medium">Terms</a>
                        <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-white transition-colors text-sm font-medium">Contact</a>
                    </div>
                </div>
                <div className="mt-12 text-center text-gray-400 dark:text-gray-600 text-xs border-t border-gray-200 dark:border-white/5 pt-8">
                    &copy; {new Date().getFullYear()} Garden Rover Inc. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
