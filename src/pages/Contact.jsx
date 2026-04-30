import { useState, useEffect, memo } from 'react';
import { Mail, User, MessageSquare, Send, Github, Linkedin, Twitter, Upload, Image as ImageIcon, ExternalLink, Instagram, Youtube, Pin } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { supabase } from '../config/supabase';

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

const CommentCard = memo(({ comment, index, isPinned }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: isPinned ? 0 : index * 0.1 }}
    viewport={{ once: true }}
    className={`rounded-xl p-6 transition-all ${
      isPinned 
        ? 'bg-gradient-to-r from-emerald-500/10 via-rose-500/10 to-gold-500/10 border-2 border-emerald-500/30 hover:border-emerald-500/50' 
        : 'glass hover:bg-white/5'
    }`}
  >
    {/* Pinned Header */}
    {isPinned && (
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <Pin className="w-4 h-4 text-emerald-400" />
        <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wide">Pinned Comment</span>
      </div>
    )}

    <div className="flex items-start gap-4">
      {/* Profile Photo */}
      <div className="flex-shrink-0">
        {comment.Photo ? (
          <img
            src={comment.Photo}
            alt={comment.Name}
            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/30"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-rose-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {comment.Name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      {/* Comment Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h4 className="text-white font-semibold">{comment.Name}</h4>
          {comment.IsAdmin && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-rose-500 rounded text-xs font-bold text-white">
              Admin
            </span>
          )}
          <span className="text-gray-500 text-xs">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-gray-300 leading-relaxed">{comment.Comment}</p>
      </div>
    </div>
  </motion.div>
));

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  // Fetch comments from Supabase
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      // Add timeout to prevent function timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const fetchPromise = supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Try to load from localStorage as fallback
      const cachedComments = localStorage.getItem('comments');
      if (cachedComments) {
        setComments(JSON.parse(cachedComments));
      }
    } finally {
      setLoadingComments(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'Error!',
          text: 'Photo size must be less than 5MB',
          icon: 'error',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          title: 'Error!',
          text: 'Please upload an image file',
          icon: 'error',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      setFormData((prev) => ({ ...prev, photo: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    Swal.fire({
      title: 'Posting...',
      text: 'Please wait while we post your comment',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      let photoUrl = null;

      // Upload photo to Supabase Storage if provided (with timeout)
      if (formData.photo) {
        const fileExt = formData.photo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `comment-photos/${fileName}`;

        const uploadTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 15000)
        );

        try {
          const { data: uploadData, error: uploadError } = await Promise.race([
            supabase.storage.from('Portfolio').upload(filePath, formData.photo),
            uploadTimeout
          ]);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            // Continue without photo if upload fails
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('Portfolio')
              .getPublicUrl(filePath);
            photoUrl = urlData.publicUrl;
          }
        } catch (uploadError) {
          console.error('Upload timeout or error:', uploadError);
          // Continue without photo
        }
      }

      // Insert comment into database (with timeout)
      const insertTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 10000)
      );

      const { data, error } = await Promise.race([
        supabase
          .from('comments')
          .insert([
            {
              Name: formData.name,
              Email: formData.email,
              Comment: formData.comment,
              Photo: photoUrl,
            },
          ])
          .select(),
        insertTimeout
      ]);

      if (error) throw error;

      Swal.fire({
        title: 'Success!',
        text: 'Your comment has been posted successfully!',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 3000,
      });

      // Reset form
      setFormData({ name: '', email: '', comment: '', photo: null });
      setPhotoPreview(null);
      
      // Refresh comments
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="block text-white font-medium mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  Profile Photo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="relative cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                    <div className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 border border-blue-500/30 hover:border-blue-500/50">
                      <Upload className="w-5 h-5 text-blue-500" />
                      <span className="text-white">{formData.photo ? 'Change Photo' : 'Choose Photo'}</span>
                    </div>
                  </label>
                  
                  {photoPreview && (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, photo: null }));
                          setPhotoPreview(null);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-2">Max size: 5MB • Formats: JPG, PNG, GIF</p>
              </div>

              {/* Name Field */}
              <div className="relative group">
                <User className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full p-4 pl-12 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                />
              </div>

              {/* Email Field */}
              <div className="relative group">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full p-4 pl-12 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                />
              </div>

              {/* Comment Field */}
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <textarea
                  name="comment"
                  placeholder="Your Comment"
                  value={formData.comment}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  rows="6"
                  className="w-full p-4 pl-12 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          </motion.div>

          {/* Connect With Me */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <h3 className="text-2xl font-bold text-white">Connect With Me</h3>
              </div>

              {/* Social Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* LinkedIn - Primary (Full Width) */}
                <SocialCard
                  icon={Linkedin}
                  platform="LinkedIn"
                  username="on LinkedIn"
                  href="https://linkedin.com/in/yourprofile"
                  isPrimary={true}
                  iconColor="linkedin"
                />

                {/* Instagram */}
                <SocialCard
                  icon={Instagram}
                  platform="Instagram"
                  username="CODY Shein"
                  href="https://instagram.com/cody_shein"
                  isPrimary={false}
                  iconColor="instagram"
                />

                {/* YouTube */}
                <SocialCard
                  icon={Youtube}
                  platform="Youtube"
                  username="Kyaw Shein"
                  href="https://youtube.com/kyaw_shein"
                  isPrimary={false}
                  iconColor="youtube"
                />

                {/* GitHub */}
                <SocialCard
                  icon={Github}
                  platform="Github"
                  username="KyawShein404"
                  href="https://github.com/KyawShein404"
                  isPrimary={false}
                  iconColor="github"
                />

                {/* TikTok */}
                <SocialCard
                  icon={TikTokIcon}
                  platform="Tiktok"
                  username="@find_error3"
                  href="https://www.tiktok.com/@find_error3?_t=ZS-90gsElcDyMi&_r=1"
                  isPrimary={false}
                  iconColor="tiktok"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            <span className="gradient-text">Community Feedback</span>
          </h3>
          
          {loadingComments ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-blue-500"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {/* Pinned Comment - Full Width */}
              {comments.filter(c => c.Pinned).map((comment) => (
                <CommentCard key={comment.id} comment={comment} index={0} isPinned={true} />
              ))}

              {/* Regular Comments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comments.filter(c => !c.Pinned).map((comment, index) => (
                  <CommentCard key={comment.id} comment={comment} index={index} isPinned={false} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 glass rounded-2xl">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No comments yet. Be the first to leave feedback!</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default memo(Contact);
