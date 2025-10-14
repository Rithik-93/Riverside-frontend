import React from 'react';
import { useParams } from 'react-router-dom';
import { Download, Share2, Edit, Trash2, Eye, Play, Clock, Calendar, Sparkles, TrendingUp } from 'lucide-react';

const PodcastDetailsPage: React.FC = () => {
  const { username, studioId, projectId } = useParams<{ 
    username: string; 
    studioId: string; 
    projectId: string; 
  }>();

  return (
    <div className="min-h-screen bg-background">
      {/* Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#972fff]/5 via-background to-[#c58aff]/5" />
      
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c58aff]/20 bg-[#972fff]/5 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[#c58aff]" />
              <span className="text-xs text-foreground/70">Podcast Details</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Podcast <span className="bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">Details</span>
            </h1>
            <p className="text-sm text-foreground/60">
              Studio: <code className="px-2 py-0.5 rounded bg-[#972fff]/10 text-[#c58aff] text-xs font-mono">{username}-{studioId}</code> | 
              Project: <code className="px-2 py-0.5 rounded bg-[#972fff]/10 text-[#c58aff] text-xs font-mono">{projectId}</code>
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Podcast Information */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff]/20 to-[#c58aff]/20 rounded-xl blur opacity-10" />
                <div className="relative bg-background/80 backdrop-blur-xl rounded-xl border border-[#c58aff]/20 p-5">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#972fff] to-[#c58aff] flex items-center justify-center">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                    Podcast Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-[#c58aff]/10">
                      <label className="block text-xs font-semibold text-[#c58aff] mb-1.5">Title</label>
                      <p className="text-lg font-semibold text-foreground">Sample Podcast Episode</p>
                    </div>
                    <div className="pb-3 border-b border-[#c58aff]/10">
                      <label className="block text-xs font-semibold text-[#c58aff] mb-1.5">Description</label>
                      <p className="text-sm text-foreground/80 leading-relaxed">This is a sample podcast episode description. In this episode, we explore fascinating topics and engage in meaningful conversations.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-[#972fff]/5 border border-[#c58aff]/10">
                        <div className="flex items-center gap-1.5 text-[#c58aff] mb-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <label className="text-xs font-semibold">Duration</label>
                        </div>
                        <p className="text-xl font-bold text-foreground">45:30</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#972fff]/5 border border-[#c58aff]/10">
                        <div className="flex items-center gap-1.5 text-[#c58aff] mb-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <label className="text-xs font-semibold">Created</label>
                        </div>
                        <p className="text-base font-semibold text-foreground">Sep 21, 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Audio Player */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff]/20 to-[#c58aff]/20 rounded-xl blur opacity-10" />
                <div className="relative bg-background/80 backdrop-blur-xl rounded-xl border border-[#c58aff]/20 p-5">
                  <h2 className="text-xl font-bold mb-4">Audio Player</h2>
                  <div className="aspect-video rounded-lg border border-[#c58aff]/20 bg-gradient-to-br from-[#972fff]/5 to-[#c58aff]/5 flex items-center justify-center backdrop-blur-xl">
                    <div className="text-center">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#972fff]/20 to-[#c58aff]/20 border border-[#c58aff]/30 mb-3">
                        <Play className="h-8 w-8 text-[#c58aff]/70" />
                      </div>
                      <p className="text-sm text-foreground/50 font-medium">Audio player will be implemented here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-5">
              {/* Actions */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff]/20 to-[#c58aff]/20 rounded-xl blur opacity-10" />
                <div className="relative bg-background/80 backdrop-blur-xl rounded-xl border border-[#c58aff]/20 p-5">
                  <h2 className="text-lg font-bold mb-4">Actions</h2>
                  <div className="space-y-2.5">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-[#972fff]/20">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#972fff]/10 hover:bg-[#972fff]/20 border border-[#c58aff]/20 text-foreground text-sm font-semibold rounded-lg transition-all">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#972fff]/10 hover:bg-[#972fff]/20 border border-[#c58aff]/20 text-foreground text-sm font-semibold rounded-lg transition-all">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-semibold rounded-lg transition-all">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Statistics */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff]/20 to-[#c58aff]/20 rounded-xl blur opacity-10" />
                <div className="relative bg-background/80 backdrop-blur-xl rounded-xl border border-[#c58aff]/20 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-[#c58aff]" />
                    <h2 className="text-lg font-bold">Statistics</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#972fff]/5 border border-[#c58aff]/10">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#972fff]/20 to-[#c58aff]/20 flex items-center justify-center">
                          <Eye className="h-4 w-4 text-[#c58aff]" />
                        </div>
                        <span className="text-sm text-foreground/70 font-medium">Views</span>
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">1,234</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#972fff]/5 border border-[#c58aff]/10">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#972fff]/20 to-[#c58aff]/20 flex items-center justify-center">
                          <Download className="h-4 w-4 text-[#c58aff]" />
                        </div>
                        <span className="text-sm text-foreground/70 font-medium">Downloads</span>
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">567</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#972fff]/5 border border-[#c58aff]/10">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#972fff]/20 to-[#c58aff]/20 flex items-center justify-center">
                          <Share2 className="h-4 w-4 text-[#c58aff]" />
                        </div>
                        <span className="text-sm text-foreground/70 font-medium">Shares</span>
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">89</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastDetailsPage;
