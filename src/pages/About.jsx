import { memo, useEffect, useMemo } from 'react';
import { FileText, Code, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import DroppingPhoto from '../components/DroppingPhoto';

const StatCard = memo(({ icon: Icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="glass-enhanced rounded-2xl p-6 transition-all duration-300 group card-hover"
  >
    <div className="flex items-center justify-between mb-4">
      <Icon className="w-12 h-12 group-hover:scale-110 transition-transform" style={{ color: '#8B5CF6' }} />
      <span className="text-4xl font-bold gradient-text">{value}</span>
    </div>
    <p className="text-gray-400 text-sm uppercase tracking-wide">{label}</p>
  </motion.div>
));

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const stats = useMemo(() => {
    const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const storedCertificates = JSON.parse(localStorage.getItem('certificates') || '[]');
    const startYear = 2022;
    const currentYear = new Date().getFullYear();
    const experience = currentYear - startYear;

    return [
      { icon: Code, value: storedProjects.length || '10+', label: 'Projects Completed', delay: 0.2 },
      { icon: Award, value: storedCertificates.length || '5+', label: 'Certificates', delay: 0.3 },
      { icon: Calendar, value: experience || '3+', label: 'Years Experience', delay: 0.4 },
    ];
  }, []);

  return (
    <section id="about" className="min-h-screen py-20 px-6 sm:px-8 lg:px-12 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            About Me
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Passionate Developer Dedicated to Creating Exceptional Digital Experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Dropping Photo Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative h-96 flex items-center justify-center"
          >
            <DroppingPhoto />
          </motion.div>

          {/* About Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold text-white">
              Hello, I'm <span className="gradient-text">Kyaw Shein</span>
            </h3>
            <p className="text-gray-400 leading-relaxed">
            I'm a fourth-year Computer Science student at the University of Computer Studies (Monywa), currently in my first semester.
            I have experience building mobile and web applications using technologies such as HTML, CSS, Java, JavaScript, PHP, Reactive Native, Kotlin, C#, Flutter and Android development.
            </p>
            <p className="text-gray-400 leading-relaxed">
             Currently, I am focusing on Flutter to develop cross-platform mobile applications with clean UI and backend integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="https://drive.google.com/file/d/1_rVZ2nmf0d6CmL_i5GpI9Ich294tPsr7/view?usp=drivesdk" className="w-full lg:w-auto">
                <button className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #8B5CF6, #10B981)',
                          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)'}>
                  <FileText className="w-5 h-5" />
                  Download CV
                </button>
              </a>
              <a href="#portfolio">
                <button className="px-6 py-3 glass-enhanced rounded-lg font-medium transition-all duration-300 hover:scale-105"
                        style={{ border: '1px solid rgba(139, 92, 246, 0.3)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}>
                  View Projects
                </button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default memo(About);
