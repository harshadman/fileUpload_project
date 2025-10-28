<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import FileManager from '$lib/components/FileManager.svelte';
  import StatsCard from '$lib/components/StatsCard.svelte';
  
  let files = [];
  let uploadKey = 0;
  let stats = { total: 0, images: 0, documents: 0, others: 0, totalSize: 0 };

  async function loadFiles() {
    try {
      const response = await fetch('http://localhost:3001/api/files');
      const data = await response.json();
      files = data.files;
      calculateStats();
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  }

  function calculateStats() {
    stats = {
      total: files.length,
      images: files.filter(f => f.category === 'images').length,
      documents: files.filter(f => f.category === 'documents').length,
      others: files.filter(f => f.category === 'others').length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0)
    };
  }

  function handleUploadSuccess() {
    loadFiles();
    uploadKey++;
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onMount(() => {
    loadFiles();
  });
</script>

<svelte:head>
  <title>File Upload Manager</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
  <!-- Header -->
  <div class="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
    <div class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              File Manager Pro
            </h1>
            <p class="text-sm text-gray-500">Upload, organize, and manage your files</p>
          </div>
        </div>
        <div class="hidden md:flex items-center space-x-4">
          <div class="text-right">
            <p class="text-sm font-medium text-gray-900">{stats.total} Files</p>
            <p class="text-xs text-gray-500">{formatBytes(stats.totalSize)} Total</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-6 py-8 max-w-7xl">
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" in:fly="{{ y: 20, duration: 600, delay: 100 }}">
      <StatsCard 
        title="Total Files" 
        value={stats.total}
        icon="📁"
        gradient="from-blue-500 to-blue-600"
      />
      <StatsCard 
        title="Images" 
        value={stats.images}
        icon="🖼️"
        gradient="from-green-500 to-emerald-600"
      />
      <StatsCard 
        title="Documents" 
        value={stats.documents}
        icon="📄"
        gradient="from-purple-500 to-purple-600"
      />
      <StatsCard 
        title="Others" 
        value={stats.others}
        icon="📦"
        gradient="from-orange-500 to-red-500"
      />
    </div>

    <!-- Upload Section -->
    <div class="mb-8" in:fly="{{ y: 20, duration: 600, delay: 200 }}">
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-white/20 rounded-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-white">Upload Files</h2>
              <p class="text-blue-100 text-sm">Drag and drop or click to select files</p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <FileUpload key={uploadKey} on:uploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>

    <!-- File Manager Section -->
    <div in:fly="{{ y: 20, duration: 600, delay: 300 }}">
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div class="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-4">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-white/10 rounded-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-white">File Library</h2>
              <p class="text-gray-300 text-sm">Browse and manage your uploaded files</p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <FileManager {files} on:fileDeleted={loadFiles} />
        </div>
      </div>
    </div>
  </div>
</div>
