import { BenchmarkArchiveDownloader } from '#infrastructure/filesystem/benchmark_archive_downloader'

try {
  const result = await new BenchmarkArchiveDownloader().ensureAvailable()

  if (result === 'downloaded') {
    console.info('Downloaded Imitator benchmarks from Zenodo')
  }
} catch (error) {
  console.warn('Unable to download Imitator benchmarks from Zenodo:', (error as Error).message)
}
