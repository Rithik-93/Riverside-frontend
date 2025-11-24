import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, LogIn, Sparkles, Mic, Video, Clock, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Loader } from '../components/ui/loader';
import { httpClient } from '../services/httpClient';
import { config } from '../config/env';
import { toast } from 'sonner';

interface Podcast {
  id: number;
  created_at: string;
  recordings: {
    recording_id: string;
    videos: {
      user_id: string;
      user_name: string;
      recording_id: string;
      s3_url: string;
    }[];
  }[];
}

const DashboardHomePage: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loadingPodcasts, setLoadingPodcasts] = useState(true);
  const [expandedPodcast, setExpandedPodcast] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateStudio = async () => {
    setIsCreatingRoom(true);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const apiCall = httpClient.post<{ podcast_id: string }>(
        `${config.apiBaseUrl}/podcasts/create`
      );

      const response = await Promise.race([apiCall, timeoutPromise]) as { podcast_id: string };

      navigate(`/studio/${user?.username}/${response.podcast_id}`);
    } catch (error) {
      console.error('Failed to create podcast:', error);
      toast.error('Failed to create studio. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinStudio = async () => {
    const studioId = roomId.trim();
    if (!studioId) {
      toast.warning('Please enter a Studio ID');
      return;
    }

    try {
      const response = await httpClient.get<{ exists: boolean }>(
        `${config.apiBaseUrl}/podcasts/check/${studioId}`
      );

      if (response.exists) {
        navigate(`/studio/${user?.username}/${studioId}`);
      } else {
        toast.error('Studio not found. Please check the Studio ID and try again.');
      }
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        toast.error('Studio not found. Please check the Studio ID and try again.');
      } else {
        toast.error('Failed to verify studio. Please try again.');
      }
      console.error('Failed to check studio:', error);
    }
  };

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await httpClient.get<{ podcasts: Podcast[] }>(
          `${config.apiBaseUrl}/podcasts/my-podcasts`
        );
        // Ensure recordings array exists for each podcast
        const podcastsWithDefaults = (response.podcasts || []).map(podcast => ({
          ...podcast,
          recordings: podcast.recordings || []
        }));
        setPodcasts(podcastsWithDefaults);
      } catch (error) {
        console.error('Failed to fetch podcasts:', error);
      } finally {
        setLoadingPodcasts(false);
      }
    };

    fetchPodcasts();
  }, []);

  const handleDownload = async (s3Url: string, userName: string) => {
    try {
      const response = await httpClient.post<{ download_url: string }>(
        `${config.uploadBaseUrl}/api/v1/upload/download-url`,
        { s3_url: s3Url }
      );

      // Fetch the file content using the presigned URL
      const fileResponse = await fetch(response.download_url);
      if (!fileResponse.ok) {
        throw new Error('Failed to fetch file');
      }

      // Convert response to blob
      const blob = await fileResponse.blob();

      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${userName}_recording.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download:', error);
      toast.error('Failed to download video');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#972fff]/5 via-background to-[#c58aff]/5" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-3 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            {/* Welcome Header */}
            <div className="mb-3 sm:mb-4 lg:mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-[#c58aff]/20 bg-[#972fff]/5 mb-2 sm:mb-3">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#c58aff]" />
                <span className="text-xs text-foreground/70">Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5 sm:mb-2 break-words">
                Welcome back, <span className="bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">{user?.username}</span>!
              </h1>
              <p className="text-sm sm:text-base text-foreground/60">Ready to create something amazing?</p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 lg:mb-6">
              {/* Create Studio Card */}
              <div className="group relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
                <div className="relative bg-background/80 backdrop-blur-xl rounded-xl border border-[#c58aff]/20 p-4 sm:p-5 lg:p-6 hover:border-[#c58aff]/40 transition-all">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-[#972fff] to-[#c58aff] flex items-center justify-center shadow-lg shadow-[#972fff]/25">
                      <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#972fff]/10 border border-[#972fff]/20">
                      <span className="text-xs font-semibold text-[#c58aff]">New</span>
                    </div>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">Start New Studio</h2>
                  <p className="text-xs sm:text-sm text-foreground/60 mb-3 sm:mb-4 leading-relaxed">
                    Create a new studio session and start recording your podcast in studio quality
                  </p>

                  <button
                    onClick={handleCreateStudio}
                    disabled={isCreatingRoom}
                    className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#972fff]/25 flex items-center justify-center gap-2"
                  >
                    {isCreatingRoom ? (
                      <>
                        <Loader size="sm" variant="spinner" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Create New Studio
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Join Studio Card */}
              <div className="group relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
                <div className="relative bg-background/80 backdrop-blur-xl rounded-xl border border-[#c58aff]/20 p-4 sm:p-5 lg:p-6 hover:border-[#c58aff]/40 transition-all">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-[#c58aff] to-[#ebd7ff] flex items-center justify-center shadow-lg shadow-[#c58aff]/25">
                      <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-[#0b0b0b]" />
                    </div>
                    <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#c58aff]/10 border border-[#c58aff]/20">
                      <span className="text-xs font-semibold text-[#c58aff]">Join</span>
                    </div>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">Join Studio</h2>
                  <p className="text-xs sm:text-sm text-foreground/60 mb-3 sm:mb-4 leading-relaxed">
                    Enter a studio ID to join an existing recording session
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Studio ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="flex-1 px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm bg-background/50 border border-[#c58aff]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#972fff]/50 focus:border-[#972fff] transition-all placeholder:text-foreground/40 text-foreground"
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinStudio()}
                    />
                    <button
                      onClick={handleJoinStudio}
                      disabled={!roomId.trim()}
                      className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] hover:opacity-90 text-[#0b0b0b] text-xs sm:text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#c58aff]/25"
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Podcasts Section */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff]/20 to-[#c58aff]/20 rounded-xl blur opacity-10" />
              <div className="relative bg-background/80 backdrop-blur-xl rounded-xl border border-[#c58aff]/20 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#c58aff]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-[#c58aff]" />
                    <h2 className="text-lg sm:text-xl font-bold">Recent Podcasts</h2>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#972fff]/10 border border-[#972fff]/20">
                    <Clock className="h-3 w-3 text-[#c58aff]" />
                    <span className="text-xs font-medium text-[#c58aff]">{podcasts.length}</span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {loadingPodcasts ? (
                    <div className="flex justify-center py-12">
                      <Loader size="sm" variant="spinner" />
                    </div>
                  ) : podcasts.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#972fff]/10 to-[#c58aff]/10 border border-[#c58aff]/20 mb-4">
                        <Mic className="h-8 w-8 text-[#c58aff]/50" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No podcasts yet</h3>
                      <p className="text-sm text-foreground/50 mb-6">Start recording to see your podcasts here</p>
                      <button
                        onClick={handleCreateStudio}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-[#972fff]/25 inline-flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Your First Studio
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {podcasts.map((podcast) => {
                        const totalRecordings = podcast.recordings?.reduce((acc, rec) => acc + (rec.videos?.length || 0), 0) || 0;
                        const isExpanded = expandedPodcast === podcast.id;

                        return (
                          <div
                            key={podcast.id}
                            className="group/card relative overflow-hidden rounded-lg border border-[#c58aff]/20 bg-background/50 hover:border-[#c58aff]/40 transition-all"
                          >
                            {/* Card Header */}
                            <button
                              onClick={() => setExpandedPodcast(isExpanded ? null : podcast.id)}
                              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#972fff]/5 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#972fff]/20 to-[#c58aff]/20 border border-[#c58aff]/30 flex items-center justify-center">
                                  <Mic className="h-5 w-5 text-[#c58aff]" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-semibold text-foreground">Podcast #{podcast.id}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs text-foreground/50">{new Date(podcast.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    {totalRecordings > 0 && (
                                      <>
                                        <span className="text-foreground/30">•</span>
                                        <div className="flex items-center gap-1">
                                          <Video className="h-3 w-3 text-[#c58aff]/70" />
                                          <span className="text-xs text-foreground/50">{totalRecordings} recording{totalRecordings !== 1 ? 's' : ''}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {totalRecordings > 0 && (
                                  <div className="px-2 py-1 rounded-md bg-[#972fff]/10 border border-[#972fff]/20">
                                    <span className="text-xs font-medium text-[#c58aff]">{totalRecordings}</span>
                                  </div>
                                )}
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-foreground/50" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-foreground/50" />
                                )}
                              </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="border-t border-[#c58aff]/10 bg-background/30">
                                {!podcast.recordings || podcast.recordings.length === 0 || totalRecordings === 0 ? (
                                  <div className="px-4 py-6 text-center">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#972fff]/5 border border-[#c58aff]/10 mb-2">
                                      <Video className="h-6 w-6 text-[#c58aff]/40" />
                                    </div>
                                    <p className="text-xs text-foreground/50">No recordings available</p>
                                  </div>
                                ) : (
                                  <div className="p-4">
                                    <div className="space-y-3">
                                      {podcast.recordings.map((recording, recIndex) => (
                                        recording.videos && recording.videos.length > 0 && (
                                          <div key={recording.recording_id}>
                                            {podcast.recordings.length > 1 && (
                                              <div className="flex items-center gap-2 mb-2">
                                                <div className="h-px flex-1 bg-[#c58aff]/10" />
                                                <span className="text-xs text-foreground/40 font-medium">Session {recIndex + 1}</span>
                                                <div className="h-px flex-1 bg-[#c58aff]/10" />
                                              </div>
                                            )}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                              {recording.videos.map((video) => (
                                                <div
                                                  key={video.user_id}
                                                  className="group/video flex items-center justify-between gap-3 p-3 bg-background/60 hover:bg-background/80 rounded-lg border border-[#c58aff]/10 hover:border-[#c58aff]/30 transition-all"
                                                >
                                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#972fff] to-[#c58aff] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#972fff]/20">
                                                      <span className="text-sm font-semibold text-white">
                                                        {video.user_name.charAt(0).toUpperCase()}
                                                      </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                      <p className="text-sm font-medium text-foreground truncate">{video.user_name}</p>
                                                      <p className="text-xs text-foreground/40">Video recording</p>
                                                    </div>
                                                  </div>
                                                  <button
                                                    onClick={() => handleDownload(video.s3_url, video.user_name)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 text-white text-xs font-semibold rounded-md transition-all shadow-md shadow-[#972fff]/25 hover:shadow-lg hover:shadow-[#972fff]/30 flex-shrink-0"
                                                    title={`Download ${video.user_name}'s recording`}
                                                  >
                                                    <Download className="h-3.5 w-3.5" />
                                                    <span>Download</span>
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
