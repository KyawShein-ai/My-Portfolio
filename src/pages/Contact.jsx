import { memo } from 'react';
import { Github, Linkedin, Mail, ExternalLink, Instagram, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom TikTok Icon
const TikTokIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const SocialCard = memo(({ icon: Icon, platform, username, href, isPrimary, iconColor }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`glass rounded-xl p-5 hover:bg-white/10 transition-all duration-300 group border ${
      isPrimary
        ? 'border-emerald-500/50 hover:border-emerald-500 lg:col-span-2'
        : 'border-rose-500/20 hover:border-rose-500/50'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${
          iconColor === 'linkedin' ? 'bg-blue-500/20' :
          iconColor === 'instagram' ? 'bg-pink-500/20' :
          iconColor === 'youtube' ? 'bg-red-500/20' :
          iconColor === 'github' ? 'bg-gray-500/20' :
          iconColor === 'tiktok' ? 'bg-black/40' : 'bg-purple-500/20'
        }`}>
          <Icon className={`w-6 h-6 ${
            iconColor === 'linkedin' ? 'text-blue-400' :
            iconColor === 'instagram' ? 'text-pink-400' :
            iconColor === 'youtube' ? 'text-red-400' :
            iconColor === 'github' ? 'text-gray-300' :
            iconColor === 'tiktok' ? 'text-white' : 'text-purple-400'
          } group-hover:scale-110 transition-transform`} />
        </div>
        <div>
          <div className="text-white font-semibold text-lg">
            {isPrimary ? "Let's Connect" : platform}
          </div>
          <div className="text-gray-400 text-sm">
            {isPrimary ? 'on LinkedIn' : username}
          </div>
        </div>
      </div>
      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
    </div>
  </a>
));

const Contact = () => {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'kyawshein8844@gmail.com';

  return (
    <section id="contact" className="min-h-screen py-20 px-6 sm:px-8 lg:px-12 bg-dark-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Get In Touch
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a project in mind? Let's work together to bring your ideas to life
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h3 className="text-2xl font-bold text-white">Connect With Me</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SocialCard
              icon={Mail}
              platform="Email"
              username={contactEmail}
              href={`mailto:${contactEmail}`}
              isPrimary={false}
              iconColor="email"
            />

            <SocialCard
              icon={Linkedin}
              platform="LinkedIn"
              username="KYAW SHEIN"
              href="https://www.linkedin.com/in/kyaw-shein-324598400/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BtqpIyBWuTtyUZi5x91VNuw%3D%3D"
              isPrimary={true}
              iconColor="linkedin"
            />

            <SocialCard
              icon={Instagram}
              platform="Instagram"
              username="CODY Shein"
              href="https://www.instagram.com/codyshein404?igsh=MWFiazQ1OW0wNHM4aw=="
              isPrimary={false}
              iconColor="instagram"
            />

            <SocialCard
              icon={Youtube}
              platform="Youtube"
              username="Kyaw Shein"
              href="https://youtube.com/@kyawshein-xp5vk?si=sVznxf717eFRRVx_"
              isPrimary={false}
              iconColor="youtube"
            />

            <SocialCard
              icon={Github}
              platform="Github"
              username="KyawShein-ai"
              href="https://github.com/KyawShein-ai"
              isPrimary={false}
              iconColor="github"
            />

            <SocialCard
              icon={TikTokIcon}
              platform="Tiktok"
              username="@find_error3"
              href="https://www.tiktok.com/@find_error3?_t=ZS-90gsElcDyMi&_r=1"
              isPrimary={false}
              iconColor="tiktok"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default memo(Contact);
