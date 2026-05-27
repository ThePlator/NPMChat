"use client"
import React, { useEffect, useState, useCallback } from "react"
import { useMessageContext, Message } from "../../app/MessageContext"
import { X, Image as ImageIcon, Download, Loader2 } from "lucide-react"

interface MediaGalleryProps {
  open: boolean
  onClose: () => void
  userId: string
}

export default function MediaGallery({
  open,
  onClose,
  userId,
}: MediaGalleryProps) {
  const { fetchMediaMessages } = useMessageContext()
  const [media, setMedia] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)

  const loadMedia = useCallback(
    async (reset = false) => {
      if (loading && !reset) return
      setLoading(true)
      const targetPage = reset ? 1 : page
      try {
        const data = await fetchMediaMessages(userId, targetPage)
        if (data && data.messages) {
          setMedia((prev) =>
            reset ? data.messages : [...prev, ...data.messages],
          )
          setHasMore(data.currentPage < data.totalPages)
          if (reset) {
            setPage(2)
          } else {
            setPage((p) => p + 1)
          }
        }
      } catch (err) {
        console.error("Failed to load media:", err)
      } finally {
        setLoading(false)
      }
    },
    [userId, page, loading, fetchMediaMessages],
  )

  useEffect(() => {
    if (open && userId) {
      setMedia([])
      setPage(1)
      setHasMore(true)
      loadMedia(true)
    }
  }, [open, userId])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-[#b39ddb]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[#b39ddb]" />
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Media Gallery
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
          {media.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
              <ImageIcon className="w-12 h-12 opacity-20" />
              <p className="font-bold">No media shared yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map((msg, i) => (
                <div
                  key={msg._id || i}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-[#39ff14] transition-all"
                >
                  <img
                    src={msg.image}
                    alt="Shared media"
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                    onClick={() => setEnlargedImage(msg.image || null)}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 text-center">
                    <span className="text-white text-[10px] font-bold">
                      {new Date(
                        msg.createdAt || msg.timestamp,
                      ).toLocaleDateString()}
                    </span>
                    <a
                      href={msg.image}
                      download={`media-${msg._id}.jpg`}
                      className="p-2 bg-white rounded-full hover:bg-[#39ff14] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-black" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && media.length > 0 && (
            <div className="mt-8 flex justify-center pb-4">
              <button
                onClick={() => loadMedia()}
                disabled={loading}
                className="px-6 py-2 bg-[#b39ddb] text-black font-bold rounded-full border-2 border-black hover:bg-[#39ff14] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}

          {loading && media.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#b39ddb]" />
            </div>
          )}
        </div>
      </div>

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in zoom-in duration-200"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={enlargedImage}
              alt="Enlarged"
              className="w-full h-full object-contain rounded-lg shadow-2xl border-2 border-[#b39ddb]"
            />
            <button
              className="absolute -top-12 -right-4 md:-right-12 text-white hover:text-[#39ff14] transition-colors p-2"
              onClick={() => setEnlargedImage(null)}
            >
              <X className="w-10 h-10" />
            </button>
            <a
              href={enlargedImage}
              download
              className="absolute -bottom-12 right-0 bg-white p-2 rounded-full hover:bg-[#39ff14] transition-colors flex items-center gap-2 px-4 font-bold text-black"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-5 h-5" /> Download
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
