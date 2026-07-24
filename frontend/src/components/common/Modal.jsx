import React, { useState, useEffect } from 'react';
import { X, Briefcase, MapPin, DollarSign, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import { productService } from '../../services/productService';
import { getBackendUrl } from '../../services/apiSetup';

export default function JobsModal({ isOpen, onClose }) {
  const [appliedJobId, setAppliedJobId] = useState(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantResume, setApplicantResume] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [vendorJobs, setVendorJobs] = useState([]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const loadJobs = async () => {
      try {
        const res = await productService.getProducts();
        if (active && res && res.success && Array.isArray(res.products)) {
          const jobs = res.products.filter(p => p.subNavbarCategory === 'Jobs');
          setVendorJobs(jobs);
        }
      } catch (err) {
        console.warn("Failed to fetch jobs in JobsModal:", err);
      }
    };
    loadJobs();
    return () => { active = false; };
  }, [isOpen]);

  const jobsList = vendorJobs.map(j => ({
    id: j.id || j._id,
    vendorId: j.vendorId,
    vendorName: j.vendorName || j.brand || 'Partner Organization',
    title: j.jobTitle || j.title || j.name || 'Job Position',
    department: j.department || j.category || 'General',
    location: j.jobLocation || j.location || j.city || j.vendorCity || j.locationType || 'Bangalore / Remote',
    salary: j.price ? `₹${(j.price || 0).toLocaleString()} L.P.A` : (j.salary ? String(j.salary).replace(/₹/g, '').trim() : 'Competitive Salary'),
    type: j.jobType || j.type || 'Full-time',
    experience: j.experience || j.exp || j.jobExperience || '1 - 3 Years',
    skills: j.skills || j.skillsRequired || j.requiredSkills || j.tags,
    desc: j.description || j.jobDescription || j.desc || `${j.name} position.`,
    createdAt: j.createdAt || j.created_at || j.postedOn || j.postedDate
  }));

  if (!isOpen) return null;

  const handleClose = () => {
    setAppliedJobId(null);
    setSubmitSuccess(false);
    setApplicantName('');
    setApplicantEmail('');
    setApplicantResume('');
    onClose();
  };

  const selectedJob = jobsList.find(j => j.id === appliedJobId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendor_id: selectedJob?.vendorId || '3w8hhon38mqg7ni0u',
          customer_name: applicantName,
          customer_phone: '+91 98765 43210',
          customer_address: 'Koramangala, Bangalore',
          customer_latitude: 12.9498,
          customer_longitude: 77.6289,
          product_details: selectedJob?.title || 'Job Application',
          amount: 0,
          items: [{
            productId: selectedJob?.id,
            name: selectedJob?.title,
            price: 0,
            quantity: 1
          }],
          candidateEmail: applicantEmail,
          candidateResume: applicantResume
        })
      });
      if (res.ok) {
        setSubmitSuccess(true);
      } else {
        console.error('Failed to submit job application:', await res.text());
      }
    } catch (err) {
      console.error('Error submitting job application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden transition-all duration-300 transform scale-100 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors z-30 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 relative z-10 shrink-0">
          <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em]">Careers</span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1 font-sans">
            Join the Connect Circle
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Help us build India's most premium luxury and everyday convenience ecosystem.
          </p>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
          
          {appliedJobId ? (
            /* ================= APPLICATION FORM ================= */
            <div className="space-y-6">
              <button 
                onClick={() => {
                  setAppliedJobId(null);
                  setSubmitSuccess(false);
                }}
                className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-brand-gold hover:text-brand-gold-dark transition-colors uppercase tracking-widest cursor-pointer"
              >
                <span>← Back to Openings</span>
              </button>

              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-850">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Applying For</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {selectedJob?.title}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  <span className="flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{selectedJob?.department}</span>
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{selectedJob?.location}</span>
                </div>
              </div>

              {submitSuccess ? (
                <div className="text-center py-8 px-4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-5 border border-emerald-100 dark:border-emerald-900">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Application Submitted!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    Thank you for applying to the Connect App. Our talent acquisition team will review your application and reach out shortly.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold text-xs uppercase tracking-widest rounded-sm transition-all cursor-pointer shadow-md"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="e.g. Dhanush An"
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="e.g. dhanush@connect.app"
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tell Us About Yourself / Resume Link</label>
                    <textarea
                      required
                      value={applicantResume}
                      onChange={(e) => setApplicantResume(e.target.value)}
                      placeholder="Share your experience, portfolio links, or resume details..."
                      rows={5}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto px-8 py-3 bg-slate-950 hover:bg-slate-850 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Application</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ================= JOBS LISTING ================= */
            <div className="space-y-4">
              {jobsList.map((job) => (
                <div 
                  key={job.id} 
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.03)] hover:border-brand-gold/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group/job"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1.5">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover/job:text-slate-900 dark:group-hover/job:text-white transition-colors leading-tight">
                        {job.title}
                      </h3>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {job.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
                      <span className="flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-300" />{job.department}</span>
                      <span>•</span>
                      <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-300" />{job.location}</span>
                      <span>•</span>
                      <span className="text-brand-gold-dark flex items-center"><DollarSign className="w-3.5 h-3.5 mr-0.5" />{job.salary}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1.5">
                      {job.desc}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setAppliedJobId(job.id)}
                    className="md:self-center bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-sm transition-all shrink-0 shadow-sm flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Apply Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
