import { useState, useEffect, useCallback, memo } from 'react';
import { Github, Linkedin, Mail, ArrowRight, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import OrbitingSkills from '../components/OrbitingSkills';

// Memoized components for better performance
const SocialLink = memo(({ icon: Icon, href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="group relative p-3 glass rounded-xl hover:bg-white/10 transition-all duration-300"
  >
    <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
  </a>
));

const TechBadge = memo(({ tech }) => (
  <span className="px-4 py-2 glass rounded-full text-sm text-gray-300 hover:bg-white/10 transition-all">
    {tech}
  </span>
));

const Home = () => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const words = ['Mobile Development', 'UI/UX Enthusiast', 'Problem Solver'];
  const techStack = ['HTML', 'CSS', 'Java', 'JavaScript', 'PHP', 'C#', 'React Native', 'Kotlin', 'Flutter', 'Android'];

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const handleTyping = useCallback(() => {
    if (isTyping) {
      if (charIndex < words[wordIndex].length) {
        setText((prev) => prev + words[wordIndex][charIndex]);
        setCharIndex((prev) => prev + 1);
      } else {
        setTimeout(() => setIsTyping(false), 2000);
      }
    } else {
      if (charIndex > 0) {
        setText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      } else {
        setWordIndex((prev) => (prev + 1) % words.length);
        setIsTyping(true);
      }
    }
  }, [charIndex, isTyping, wordIndex, words]);

  useEffect(() => {
    const timeout = setTimeout(handleTyping, isTyping ? 100 : 50);
    return () => clearTimeout(timeout);
  }, [handleTyping, isTyping]);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 pt-16 relative overflow-hidden z-10"
    >
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-3xl animate-pulse-slow" 
             style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent)' }}></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full blur-3xl animate-pulse-slow" 
             style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent)', animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              <span className="px-4 py-2 glass-enhanced rounded-full text-sm font-medium inline-flex items-center gap-2"
                    style={{ color: '#A78BFA' }}>
                <Code2 className="w-4 h-4" />
                Innovation for future!
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <br />
              <span className="gradient-text">Kyaw Shein</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="h-8 flex items-center justify-center lg:justify-start"
            >
              <span className="text-xl md:text-2xl text-gray-300 font-light">
                {text}
              </span>
              <span className="w-0.5 h-6 ml-1 animate-blink" style={{ backgroundColor: '#8B5CF6' }}></span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-base md:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0"
            >
              I have completed several projects using HTML, CSS, Java, JavaScript, PHP, Reactive Native, Kotlin, C#, Flutter and Android development.
              I build mobile and web applications with a focus on clean design and real-world functionality.
              Currently specializing in Flutter and mobile development.

            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              {techStack.map((tech) => (
                <TechBadge key={tech} tech={tech} />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto"
            >
              <a href="#portfolio" className="group w-full sm:w-auto">
                <button className="relative px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
                        style={{
                          background: 'linear-gradient(135deg, #8B5CF6, #10B981)',
                          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.5), 0 4px 15px rgba(16, 185, 129, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)'}>
                  View Projects
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </a>
              <a href="#contact" className="w-full sm:w-auto">
                <button className="px-8 py-3 glass-enhanced rounded-lg font-medium transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                        style={{ border: '1px solid rgba(139, 92, 246, 0.3)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}>
                  Contact Me
                </button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex gap-4 justify-center lg:justify-start pt-4"
            >
              <SocialLink icon={Github} href="https://github.com/KyawShein-ai" label="GitHub" />
              <SocialLink icon={Linkedin} href="https://www.linkedin.com/in/kyaw-shein-324598400/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BMEzaE%2FYCRYuj0PvnB%2BtNHA%3D%3D" label="LinkedIn" />
              <SocialLink icon={Mail} href="mailto:kyawshein8844@gmail.com" label="Email" />
            </motion.div>
          </div>

          {/* Right Column - 3D Orbiting Skills Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Circular Container */}
            <div className="relative w-[700px] h-[700px] rounded-full overflow-hidden"
                 style={{
                   background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 100%)',
                   border: '2px solid rgba(139, 92, 246, 0.2)',
                   boxShadow: '0 0 60px rgba(139, 92, 246, 0.3), inset 0 0 60px rgba(16, 185, 129, 0.1)'
                 }}>
              <OrbitingSkills profileImage="/profile.jpg" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default memo(Home);
