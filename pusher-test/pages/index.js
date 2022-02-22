import Head from 'next/head'
import Image from 'next/image'

export default function Home({ handleLoginChange, handleLogin }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Enter Player Name..."
          onChange={handleLoginChange}
          className="jpx-2 rounded-md border-2 border-gray-500 py-2"
        />
        <button className="ml-2 rounded-md bg-purple-500 py-2 px-2 text-white">
          Submit
        </button>
      </form>
    </div>
  )
}
