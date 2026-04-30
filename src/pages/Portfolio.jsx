import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { ExternalLink, Github, Code, Award, Boxes, Eye, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectCard = memo(({ project, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="glass-enhanced rounded-2xl overflow-hidden transition-all duration-300 group card-hover"
  >
    <div className="aspect-video overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(16, 185, 129, 0.1))' }}>
      {project.Img ? (
        <img
          src={project.Img}
          alt={project.Title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-gray-500 text-6xl">🚀</span>
        </div>
      )}
    </div>
    <div className="p-6 space-y-4 relative z-10">
      <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all">
        {project.Title}
      </h3>
      <p className="text-gray-400 line-clamp-2">{project.Description}</p>
      
      {project.TechStack && (
        <div className="flex flex-wrap gap-2">
          {(() => {
            try {
              const techArray = typeof project.TechStack === 'string' 
                ? JSON.parse(project.TechStack) 
                : project.TechStack;
              return techArray.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full"
                >
                  {tech}
                </span>
              ));
            } catch (e) {
              // If parsing fails, try splitting by comma
              const techArray = project.TechStack.split(',').map(t => t.trim());
              return techArray.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full"
                >
                  {tech}
                </span>
              ));
            }
          })()}
        </div>
      )}
      
      <div className="flex gap-3 pt-2">
        {/* View Details Button */}
        <Link
          to={`/project/${project.id}`}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-all flex items-center justify-center gap-2 text-white"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #10B981)' }}
        >
          <Eye className="w-4 h-4" />
          View Details
        </Link>
        
        {/* Code button */}
        {project.Github && (
          <a
            href={project.Github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 glass-enhanced rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{ border: '1px solid rgba(139, 92, 246, 0.3)' }}
          >
            <Github className="w-4 h-4" />
            Code
          </a>
        )}
      </div>
    </div>
  </motion.div>
));

// Tech Stack Icons Data
const techStacks = [
  { icon: 'html.svg', language: 'HTML' },
  { icon: 'css.svg', language: 'CSS' },
  { icon: 'javascript.svg', language: 'JavaScript' },
  { icon: 'reactjs.svg', language: 'ReactJS' },
  { icon: 'bootstrap.svg', language: 'Bootstrap' },
  { icon: 'php.svg', language: 'PHP' },
  { icon: 'csharp.svg', language: 'C#' },
  { icon: 'java.svg', language: 'Java' },
  { icon: 'mysql.svg', language: 'MySQL' },
  { icon: 'xampp.svg', language: 'XAMPP' },
  { icon: 'github.svg', language: 'GitHUB' },
  { icon: 'git.svg', language: 'Git' },
  { icon: 'flutter.svg', language: 'Flutter' },
  { icon: 'kotlin.svg', language: 'Kotlin' },
];

const TechStackCard = memo(({ stack }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="glass-enhanced rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-4 group card-hover"
  >
    <div className="w-16 h-16 flex items-center justify-center">
      <img 
        src={`/${stack.icon}`} 
        alt={stack.language}
        className="w-12 h-12 object-contain"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      <span className="text-4xl hidden">🔧</span>
    </div>
    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
      {stack.language}
    </p>
  </motion.div>
));

const CertificateCard = memo(({ img, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="glass rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300"
  >
    <img
      src={img}
      alt={`Certificate ${index + 1}`}
      className="w-full h-auto object-cover"
      loading="lazy"
    />
  </motion.div>
));

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'techstack', label: 'Tech Stack', icon: Boxes },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsDropdownOpen(false);
  };

  const fetchData = useCallback(async () => {
    try {
      const [projectsResponse, certificatesResponse] = await Promise.all([
        supabase.from('projects').select('*').order('id', { ascending: false }),
        supabase.from('certificates').select('*').order('id', { ascending: false }),
      ]);

      if (projectsResponse.error) throw projectsResponse.error;
      if (certificatesResponse.error) throw certificatesResponse.error;

      setProjects(projectsResponse.data || []);
      setCertificates(certificatesResponse.data || []);
      
      localStorage.setItem('projects', JSON.stringify(projectsResponse.data || []));
      localStorage.setItem('certificates', JSON.stringify(certificatesResponse.data || []));
    } catch (error) {
      console.error('Error fetching data:', error);
      const cachedProjects = localStorage.getItem('projects');
      const cachedCertificates = localStorage.getItem('certificates');
      if (cachedProjects) setProjects(JSON.parse(cachedProjects));
      if (cachedCertificates) setCertificates(JSON.parse(cachedCertificates));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <section id="portfolio" className="min-h-screen py-20 px-6 sm:px-8 lg:px-12 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Portfolio Showcase
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Here are some of the projects I've built during my academic journey, showcasing my skills in web and software development.Each project reflects my growth, creativity, and commitment to continuous learning.
          </p>
        </motion.div>

        {/* Main Layout with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation - Desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="hidden lg:block lg:w-64 flex-shrink-0"
          >
            <div className="glass-enhanced rounded-2xl p-4 sticky top-24" style={{ border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'text-white shadow-lg border border-transparent'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(16, 185, 129, 0.15))',
                        borderColor: 'rgba(139, 92, 246, 0.4)',
                        boxShadow: '0 8px 20px rgba(139, 92, 246, 0.2)'
                      } : {}}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Dropdown Navigation - Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:hidden relative"
          >
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full glass-enhanced rounded-xl px-6 py-4 flex items-center justify-between text-white hover:bg-white/5 transition-all"
              style={{ border: '1px solid rgba(139, 92, 246, 0.2)' }}
            >
              <div className="flex items-center gap-3">
                {activeTabData && (
                  <>
                    <activeTabData.icon className="w-5 h-5" />
                    <span className="font-medium">{activeTabData.label}</span>
                  </>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 glass-enhanced rounded-xl p-2 z-50 shadow-xl"
                  style={{ border: '1px solid rgba(139, 92, 246, 0.2)' }}
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                        style={isActive ? {
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(16, 185, 129, 0.15))'
                        } : {}}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-blue-500"></div>
                    </div>
                  ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {projects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 glass-enhanced rounded-2xl" style={{ border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <p className="text-gray-400 text-lg">
                        No projects yet. Add some in your Supabase database!
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Certificates Tab */}
              {activeTab === 'certificates' && (
                <motion.div
                  key="certificates"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-blue-500"></div>
                    </div>
                  ) : certificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {certificates.map((cert, index) => (
                        <CertificateCard key={cert.id} img={cert.Img} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 glass-enhanced rounded-2xl" style={{ border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <p className="text-gray-400 text-lg">
                        No certificates yet. Add some in your Supabase database!
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tech Stack Tab */}
              {activeTab === 'techstack' && (
                <motion.div
                  key="techstack"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {techStacks.map((stack, index) => (
                      <TechStackCard key={index} stack={stack} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
