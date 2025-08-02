'use client'
import React, { useRef, useEffect, useState } from 'react'
import { useMessageContext } from '../../app/MessageContext'
import { useAuth } from '../../app/AuthContext'
import { BASES } from '../../app/fetcher'
import EmojiPicker from 'emoji-picker-react'
import { ModeToggle } from '../ui/mode-toggle'

export default function ChatPanel({
	selectedUser,
	onBack,
}: {
	selectedUser: any
	onBack: () => void
}) {
	const {
		messages,
		sendMessage,
		markAsSeen,
		loadingMessages,
		error,
		selectedUser: contextSelectedUser,
	} = useMessageContext()
	const { user } = useAuth()
	const [input, setInput] = useState('')
	const messageEndRef = useRef<HTMLDivElement | null>(null)
	const currentUserId = user?.id
	const [showEmoji, setShowEmoji] = useState(false)
	const [image, setImage] = useState<string | null>(null)
	const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
	const [showUserDetails, setShowUserDetails] = useState(false)
	const [uploadingFile, setUploadingFile] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [uploadSuccess, setUploadSuccess] = useState(false)

	function getFileIcon(mimetype: string) {
		if (mimetype.startsWith('image/')) return '🖼️'
		if (mimetype === 'application/pdf') return '📄'
		if (mimetype.includes('word') || mimetype.includes('document')) return '📝'
		if (mimetype.includes('zip') || mimetype.includes('compressed')) return '📦'
		if (mimetype.startsWith('text/')) return '📄'
		return '📁'
	}

	function formatFileSize(bytes: number) {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	useEffect(() => {
		messageEndRef.current?.scrollIntoView({ behavior: 'auto' })
	}, [messages, selectedUser])

	useEffect(() => {
		// Mark unseen messages as seen when displayed
		messages.forEach((msg: any) => {
			if (!msg.seen && msg.receiverId === currentUserId) {
				markAsSeen(msg._id)
			}
		})
		// eslint-disable-next-line
	}, [messages, selectedUser])

	async function handleSend() {
		if ((input.trim() === '' && !image) || !selectedUser) return
		await sendMessage(selectedUser._id, input, image || undefined, undefined)
		setInput('')
		setImage(null)
	}

	function addEmoji(emoji: any) {
		setInput((prev) => prev + emoji.native)
		setShowEmoji(false)
	}

	function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (ev) => {
				setImage(ev.target?.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file || !selectedUser) {
			console.log('No file selected or no user selected')
			return
		}

		console.log('Starting file upload:', file.name, file.size, file.type)
		console.log('Selected user:', selectedUser)
		setUploadingFile(true)
		setUploadProgress(0)

		try {
			const formData = new FormData()
			formData.append('file', file)

			// Create XMLHttpRequest for progress tracking
			const xhr = new XMLHttpRequest()
			
			// Track upload progress
			xhr.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					const percentComplete = (event.loaded / event.total) * 100
					console.log('Upload progress:', percentComplete)
					setUploadProgress(percentComplete)
				}
			})

			// Handle response
			xhr.addEventListener('load', async () => {
				console.log('Upload response status:', xhr.status)
				console.log('Upload response text:', xhr.responseText)
				
				try {
					if (xhr.status === 200) {
						const response = JSON.parse(xhr.responseText)
						console.log('Parsed response:', response)
						
						if (response.success && response.file) {
							console.log('File uploaded successfully:', response.file)
							console.log('Calling sendMessage with file:', response.file)
							
							// Show success animation
							setUploadSuccess(true)
							setTimeout(() => setUploadSuccess(false), 2000)
							
							// Send file message
							await sendMessage(selectedUser._id, '', undefined, response.file)
							console.log('File message sent successfully')
						} else {
							console.error('Upload failed:', response.message || 'Unknown error')
							alert('Upload failed: ' + (response.message || 'Unknown error'))
						}
					} else {
						console.error('Upload failed with status:', xhr.status)
						alert('Upload failed with status: ' + xhr.status)
					}
				} catch (parseError) {
					console.error('Error parsing response:', parseError)
					alert('Error parsing server response')
				}
				
				setUploadingFile(false)
				setUploadProgress(0)
			})

			xhr.addEventListener('error', (error) => {
				console.error('File upload error:', error)
				alert('File upload failed')
				setUploadingFile(false)
				setUploadProgress(0)
			})

			xhr.addEventListener('timeout', () => {
				console.error('File upload timeout')
				alert('File upload timeout')
				setUploadingFile(false)
				setUploadProgress(0)
			})

			// Get auth token for request
			const token = localStorage.getItem('token')
			const uploadUrl = `${BASES.files}/upload`
			console.log('Upload URL:', uploadUrl)
			console.log('Auth token:', token ? 'Present' : 'Missing')
			
			xhr.open('POST', uploadUrl)
			if (token) {
				xhr.setRequestHeader('Authorization', `Bearer ${token}`)
			}
			xhr.timeout = 30000 // 30 second timeout
			xhr.send(formData)

		} catch (error) {
			console.error('Error uploading file:', error)
			alert('Error uploading file: ' + error)
			setUploadingFile(false)
			setUploadProgress(0)
		}
		
		// Clear the file input
		e.target.value = ''
	}

	return (
		<main className='flex flex-col flex-1 h-full bg-white'>
			{/* User Details Modal */}
			{showUserDetails && selectedUser && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
					onClick={() => setShowUserDetails(false)}
				>
					<div
						className='bg-white rounded-2xl border-2 border-sidebar-border  shadow-lg p-0 flex flex-col items-center gap-0 relative min-w-[340px] max-w-xs'
						onClick={(e) => e.stopPropagation()}
					>
						<button
							className='absolute top-2 right-2 text-2xl font-bold text-black hover:text-[#39ff14]'
							onClick={() => setShowUserDetails(false)}
							aria-label='Close'
						>
							×
						</button>
						<div className='flex flex-col items-center w-full pt-8 pb-4 px-6'>
							<img
								src={
									selectedUser.avatarUrl ||
									'/public/avatar.png'
								}
								alt={selectedUser.name}
								className='w-28 h-28 rounded-full border-4 border-[#b39ddb] object-cover shadow-md mb-3'
							/>
							<span className='text-2xl font-extrabold text-black mb-1'>
								{selectedUser.name}
							</span>
							<div className='flex items-center gap-2 mb-2'>
								<span
									className={`w-3 h-3 rounded-full border-2 border-sidebar-border  ${
										selectedUser.status === 'online'
											? 'bg-[#39ff14]'
											: 'bg-gray-400'
									}`}
								></span>
								<span
									className={`text-sm font-bold ${
										selectedUser.status === 'online'
											? 'text-[#39ff14]'
											: 'text-gray-400'
									}`}
								>
									{selectedUser.status === 'online'
										? 'Online'
										: 'Offline'}
								</span>
							</div>
							<div className='w-full border-t border-gray-200 my-2'></div>
							{selectedUser.bio && (
								<div className='w-full bg-[#f3e8ff] border border-[#b39ddb] rounded-lg px-4 py-2 text-center text-gray-700 text-base mt-2'>
									{selectedUser.bio}
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			{/* Image Modal */}
			{enlargedImage && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'
					onClick={() => setEnlargedImage(null)}
				>
					<div className='relative'>
						<img
							src={enlargedImage}
							alt='enlarged'
							className='max-w-[90vw] max-h-[80vh] rounded-lg border-4 border-white shadow-lg'
						/>
						<button
							className='absolute top-2 right-2 bg-white border border-sidebar-border  rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold'
							onClick={(e) => {
								e.stopPropagation()
								setEnlargedImage(null)
							}}
							aria-label='Close image'
						>
							×
						</button>
						<a
							href={enlargedImage}
							download='image.jpg'
							className='absolute bottom-2 right-2 bg-white border border-sidebar-border  rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold'
							onClick={(e) => e.stopPropagation()}
							aria-label='Download image'
						>
							⬇️
						</a>
					</div>
				</div>
			)}
			{/* Header */}
			<div className='flex items-center gap-3 px-4 py-3 border-b-2 border-sidebar-border bg-background sticky top-0 z-10'>
				{/* Back button for mobile */}
				<button
					className='md:hidden mr-2 p-2 rounded-full border-2 border-sidebar-border bg-[#b39ddb] hover:bg-[#39ff14] focus:outline-none'
					onClick={onBack}
					aria-label='Back to user list'
					tabIndex={-1}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={2}
						stroke='currentColor'
						className='w-6 h-6'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M15 19l-7-7 7-7'
						/>
					</svg>
				</button>
				<div
					className='w-10 h-10 rounded-full bg-[#b39ddb] flex items-center justify-center text-xl font-extrabold border-2 border-sidebar-border cursor-pointer hover:opacity-80'
					onClick={() => setShowUserDetails(true)}
					title='View profile'
				>
					{selectedUser && selectedUser.avatarUrl ? (
						<img
							src={selectedUser.avatarUrl}
							alt={selectedUser.name || 'User'}
							className='w-full h-full object-cover rounded-full'
						/>
					) : selectedUser && selectedUser.name ? (
						selectedUser.name[0]
					) : (
						'?'
					)}
				</div>
				<div className='flex justify-between w-full px-2'>
					<div className='flex flex-col'>
						<span
							className='text-lg font-extrabold text-primary cursor-pointer hover:text-[#39ff14]'
							onClick={() => setShowUserDetails(true)}
							title='View profile'
						>
							{selectedUser && selectedUser.name
								? selectedUser.name
								: 'User'}
						</span>
						<span className='text-xs font-bold text-[#39ff14]'>
							{selectedUser && selectedUser.status
								? selectedUser.status
								: ''}
						</span>
					</div>
					<ModeToggle />
				</div>
			</div>
			{/* Messages */}
			<div className='flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#f3e8ff] dark:bg-accent'>
				{messages.map((msg: any, i: number) => {
					const isMe = msg.senderId === currentUserId
					// Format time from createdAt or timestamp
					let time = ''
					const timeSource = msg.createdAt || msg.timestamp
					if (timeSource) {
						const date = new Date(timeSource)
						time = date.toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						})
					}
					return (
						<div
							key={msg._id || i}
							className={`flex w-full ${
								isMe ? 'justify-end' : 'justify-start'
							}`}
						>
							<div
								className={`relative max-w-xs md:max-w-md px-0 py-0 rounded-2xl border-2 font-medium text-base flex flex-col gap-1 shadow-sm
                ${
					isMe
						? 'bg-[#39ff14] text-black border-[#b39ddb] rounded-br-none items-end'
						: 'bg-white text-black border-[#39ff14] rounded-bl-none items-start'
				}`}
							>
								{msg.image && (
									<div className='relative group rounded-xl overflow-hidden m-2'>
										<img
											src={msg.image}
											alt='preview'
											className='w-60 h-60 object-cover rounded-xl border border-black cursor-pointer hover:opacity-90 transition'
											onClick={() =>
												setEnlargedImage(msg.image)
											}
											style={{
												boxShadow:
													'0 2px 8px rgba(0,0,0,0.10)',
											}}
										/>
										<a
											href={msg.image}
											download='image.jpg'
											className='absolute bottom-2 right-2 bg-white/80 border border-black rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold opacity-80 hover:opacity-100 transition'
											onClick={(e) => e.stopPropagation()}
											title='Download image'
										>
											⬇️
										</a>
									</div>
								)}
								{msg.file && (
									<div className='relative group rounded-2xl overflow-hidden m-2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-200 p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]'>
										<div className='flex items-center gap-4'>
											<div className='relative'>
												<div className='w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg'>
													{getFileIcon(msg.file.mimetype)}
												</div>
												<div className='absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center text-xs'>
													✓
												</div>
											</div>
											<div className='flex-1 min-w-0'>
												<p className='text-sm font-semibold text-gray-800 truncate mb-1 flex items-center gap-2'>
													📎 {msg.file.filename}
												</p>
												<div className='flex items-center gap-2'>
													<span className='text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full font-medium'>
														{formatFileSize(msg.file.size)}
													</span>
													<span className='text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium'>
														✨ Ready
													</span>
												</div>
											</div>
											<a
												href={`http://localhost:8080${msg.file.url}`}
												download={msg.file.filename}
												className='group relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110'
												title='Download file'
											>
												<span className='group-hover:animate-bounce'>⬇️</span>
												<div className='absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300'></div>
											</a>
										</div>
										
										{/* Cute decorative elements */}
										<div className='absolute top-2 right-2 text-purple-300 opacity-50 animate-pulse'>
											✨
										</div>
										<div className='absolute bottom-2 left-2 text-pink-300 opacity-30 animate-pulse' style={{ animationDelay: '1s' }}>
											💫
										</div>
									</div>
								)}
								{msg.text && (
									<span className='px-4 pb-1 pt-1 break-words text-base text-black'>
										{msg.text}
									</span>
								)}
								<span className='flex items-center gap-1 text-xs text-gray-500 mt-1 self-end pr-3 pb-1'>
									{time}
								</span>
							</div>
						</div>
					)
				})}
				<div ref={messageEndRef} />
			</div>
			{/* Upload Success Animation */}
			{uploadSuccess && (
				<div className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none'>
					<div className='bg-white rounded-3xl p-8 shadow-2xl border-4 border-green-300 animate-bounce'>
						<div className='text-center'>
							<div className='text-6xl mb-4 animate-pulse'>🎉</div>
							<div className='text-2xl font-bold text-green-600 mb-2'>Success!</div>
							<div className='text-lg text-gray-600'>File uploaded successfully!</div>
							<div className='flex justify-center gap-2 mt-4'>
								<span className='animate-bounce'>✨</span>
								<span className='animate-bounce' style={{ animationDelay: '0.1s' }}>🎯</span>
								<span className='animate-bounce' style={{ animationDelay: '0.2s' }}>✨</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Upload Progress Bar - Cute Design */}
			{uploadingFile && (
				<div className='mx-4 my-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl shadow-lg animate-pulse'>
					<div className='flex items-center gap-3 mb-3'>
						<div className='relative'>
							<div className='w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-spin'>
								📄
							</div>
							<div className='absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-bounce'></div>
						</div>
						<div className='flex-1'>
							<div className='flex items-center justify-between mb-1'>
								<span className='text-sm font-medium text-purple-700'>Uploading your file...</span>
								<span className='text-sm font-bold text-pink-600 bg-white px-2 py-1 rounded-full shadow-sm'>
									{Math.round(uploadProgress)}%
								</span>
							</div>
							<div className='text-xs text-purple-500'>Almost there! ✨</div>
						</div>
					</div>
					
					{/* Cute Progress Bar */}
					<div className='relative w-full bg-purple-100 rounded-full h-3 overflow-hidden shadow-inner'>
						<div 
							className='h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 relative overflow-hidden'
							style={{ width: `${uploadProgress}%` }}
						>
							{/* Animated shimmer effect */}
							<div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer'></div>
							
							{/* Moving sparkles */}
							<div className='absolute top-0 left-0 w-full h-full'>
								<div className='absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-75'></div>
								<div className='absolute top-1/4 left-1/2 w-1 h-1 bg-white rounded-full animate-ping opacity-50' style={{ animationDelay: '0.5s' }}></div>
								<div className='absolute top-3/4 left-3/4 w-1 h-1 bg-white rounded-full animate-ping opacity-75' style={{ animationDelay: '1s' }}></div>
							</div>
						</div>
						
						{/* Progress bar end cap with emoji */}
						{uploadProgress > 5 && (
							<div 
								className='absolute top-1/2 transform -translate-y-1/2 text-lg transition-all duration-500'
								style={{ left: `${Math.min(uploadProgress, 95)}%` }}
							>
								🚀
							</div>
						)}
					</div>
					
					{/* Cute message based on progress */}
					<div className='mt-2 text-center'>
						{uploadProgress < 25 && (
							<span className='text-xs text-purple-500'>🌟 Starting the magic...</span>
						)}
						{uploadProgress >= 25 && uploadProgress < 50 && (
							<span className='text-xs text-purple-500'>🎯 Making progress...</span>
						)}
						{uploadProgress >= 50 && uploadProgress < 75 && (
							<span className='text-xs text-purple-500'>🎨 Almost ready...</span>
						)}
						{uploadProgress >= 75 && uploadProgress < 95 && (
							<span className='text-xs text-purple-500'>🎉 Nearly there!</span>
						)}
						{uploadProgress >= 95 && (
							<span className='text-xs text-purple-500'>✨ Finishing up...</span>
						)}
					</div>
				</div>
			)}
			{/* Input */}
			<form
				className='flex items-center gap-2 border-t-2 border-sidebar-border  px-2 py-2 bg-background sticky bottom-0 z-10 relative'
				onSubmit={(e) => {
					e.preventDefault()
					handleSend()
				}}
			>
				<button
					type='button'
					className='px-2 py-2 text-xl border-2 border-sidebar-border  rounded-full bg-accent  hover:bg-[#b39ddb]'
					onClick={() => setShowEmoji((v) => !v)}
					aria-label='Add emoji'
				>
					😊
				</button>
				{showEmoji && (
					<div className='absolute bottom-14 left-0 z-50'>
						<EmojiPicker
							onEmojiClick={(emojiData) => {
								setInput((prev) => prev + emojiData.emoji)
								setShowEmoji(false)
							}}
						/>
					</div>
				)}
				<label
					className='px-2 py-2 cursor-pointer border-2 border-sidebar-border rounded-full bg-accent hover:bg-[#b39ddb] flex items-center justify-center'
					title='Attach image'
				>
					<input
						type='file'
						accept='image/*'
						className='hidden'
						onChange={handleImageChange}
					/>
					<span role='img' aria-label='Attach'>
						📎
					</span>
				</label>
				<label
					className='px-2 py-2 cursor-pointer border-2 border-sidebar-border rounded-full bg-accent hover:bg-[#b39ddb] flex items-center justify-center'
					title='Attach file'
				>
					<input
						type='file'
						accept='.pdf,.doc,.docx,.zip,.txt,.csv,.json'
						className='hidden'
						onChange={handleFileUpload}
						disabled={uploadingFile}
					/>
					<span role='img' aria-label='Attach file'>
						📄
					</span>
				</label>
				{image && (
					<div className='relative flex items-center'>
						<img
							src={image}
							alt='preview'
							className='w-12 h-12 object-cover rounded border-2 border-sidebar-border  mr-2'
						/>
						<button
							type='button'
							className='absolute top-0 right-0 bg-white border border-sidebar-border  rounded-full w-5 h-5 flex items-center justify-center text-xs'
							onClick={() => setImage(null)}
							aria-label='Remove image'
						>
							×
						</button>
					</div>
				)}
				<input
					type='text'
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder='Type a message...'
					className='flex-1 px-3 py-2 border-2 border-sidebar-border  rounded-full font-medium text-base bg-[#f3e8ff] dark:bg-accent text-primary focus:bg-white focus:outline-none focus:border-[#39ff14] placeholder:text-gray-400'
				/>
				<button
					type='submit'
					className='px-4 py-2 bg-[#39ff14] text-black text-base font-bold rounded-full border-2 border-sidebar-border  transition-all duration-100 hover:bg-[#b39ddb] hover:text-white hover:scale-105 shadow-sm'
				>
					Send
				</button>
			</form>
			{loadingMessages && (
				<div className='p-4 text-center'>Loading messages...</div>
			)}
			{error && (
				<div className='p-4 text-center text-red-500'>{error}</div>
			)}
		</main>
	)
}
