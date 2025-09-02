// pages/_app.js
import '@/styles/globals.css'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'], // you can choose weights
})

export default function MyApp({ Component, pageProps }) {
  return (
    <main className={poppins.className}>
      <Component {...pageProps} />
    </main>
  )
}
