'use client'

import { Search, Heart, Menu, X, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ModeToggle } from '../ui/mode-toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [stars, setStars] = useState<number | null>(null)

	useEffect(() => {
		fetch('https://api.github.com/repos/ThePlator/NPMChat')
			.then((res) => res.json())
			.then((data) => setStars(data.stargazers_count))
			.catch((err) => console.error('Failed to fetch stars', err))
	}, [])

	return (
		<header className='w-full bg-background border-b-4 border-primary px-6 py-4'>
			<div className='max-w-7xl mx-auto flex items-center justify-between'>
				{/* Logo */}
				<div className='flex items-center space-x-2'>
					<div className='w-8 h-8 bg-primary rounded-sm flex items-center justify-center'>
						<span className='text-background font-bold text-sm'>
							N
						</span>
					</div>
					<span className='font-bold text-2xl tracking-tight text-primary'>
						NPMChat
					</span>
				</div>

				{/* Desktop Navigation */}
				<nav className='hidden md:flex items-center space-x-8'>
					<a
						href='#docs'
						className='font-semibold text-primary hover:text-purple-400 transition-colors'
					>
						Docs
					</a>
					<a
						href='https://github.com/ThePlator/NPMChat '
						target='_blank'
						className='font-semibold text-primary hover:text-purple-400 transition-colors'
					>
						GitHub
					</a>
					<Link
						href='/features'
						className='font-semibold text-foreground hover:text-purple-400 transition-colors'
					>
						Features
					</Link>
				</nav>

				{/* Icons */}
				<div className='hidden md:flex items-center space-x-4'>
					<Tooltip>
						<TooltipTrigger>
							<a
								href='https://github.com/ThePlator/NPMChat'
								target='_blank'
								rel='noopener noreferrer'
							>
								<div className='relative p-2 hover:bg-muted rounded-sm transition-colors mr-1'>
									<Star className='w-5 h-5 text-primary' />
									{stars !== null && (
										<span className='absolute -top-1 -right-2 text-xs bg-yellow-500 text-white px-1 rounded-sm flex place-items-center'>
											{stars}
										</span>
									)}
								</div>
							</a>
						</TooltipTrigger>
						<TooltipContent>
							<p className='font-semibold tracking-wide'>
								Give us Star
							</p>
						</TooltipContent>
					</Tooltip>
					<div>
						<ModeToggle />
					</div>
					<button className='p-2 hover:bg-muted rounded-sm transition-colors'>
						<Search className='w-5 h-5 text-primary' />
					</button>
					<button className='p-2 hover:bg-muted rounded-sm transition-colors'>
						<Heart className='w-5 h-5 text-primary' />
					</button>
				</div>

				{/* Mobile Menu Button */}
				<button
					className='md:hidden p-2 border-2 border-foreground  rounded-sm'
					onClick={() => setIsMenuOpen(!isMenuOpen)}
				>
					{isMenuOpen ? (
						<X className='w-5 h-5 text-foreground' />
					) : (
						<Menu className='w-5 h-5 text-foreground' />
					)}
				</button>
			</div>

			{/* Mobile Menu */}
			{isMenuOpen && (
				<div className='md:hidden mt-4 pb-4 border-t-2 border-foreground'>
					<nav className='flex flex-col space-y-4 pt-4'>
						<a
							href='#docs'
							className='font-semibold text-foreground hover:text-purple-400 transition-colors'
						>
							Docs
						</a>
						<a
							href='#github'
							className='font-semibold text-foreground hover:text-purple-400 transition-colors'
						>
							GitHub
						</a>
						<Link
							href='/features'
							className='font-semibold text-foreground hover:text-purple-400 transition-colors'
						>
							Features
						</Link>
					</nav>
				</div>
			)}
		</header>
	)
}
