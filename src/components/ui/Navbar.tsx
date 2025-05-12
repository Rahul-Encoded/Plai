import React from 'react'
import ModeToggle from './ModeToggle'

function Navbar() {
	return (
		<nav className='sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50'>
			<div className='flex items-center justify-between h-16'>
				<span className='mx-4 text-xl font-bold text-primary font-mono tracking-wider'>Pl.ai</span>
				<div className='mx-4'>
					<ModeToggle></ModeToggle>
				</div>
			</div>
		</nav>
	)
}

export default Navbar