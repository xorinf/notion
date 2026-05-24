/**
 * @file RootLayout.jsx
 * @module RootLayout
 * @description React component for RootLayout. Handles UI rendering, local state, and event interactions.
 */

import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router'

import { pageBackground } from '../styles/common'

function RootLayout() {
  return (
    <div className={`${pageBackground} flex flex-col`}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default RootLayout