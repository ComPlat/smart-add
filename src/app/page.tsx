import { UploadForm } from './components/UploadForm'

export default function Home() {
  return (
    <main className="flex flex-col gap-8 p-8">
      <h1 className="text-3xl">Upload</h1>
      <UploadForm />
    </main>
  )
}
