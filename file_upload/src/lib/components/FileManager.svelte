<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  
  export let files = [];
  
  const dispatch = createEventDispatcher();
  
  let selectedCategory = 'all';
  let searchQuery = '';
  let viewMode = 'grid'; // 'grid' or 'list'
  let sortBy = 'date'; // 'date', 'name', 'size'
  let sortOrder = 'desc'; // 'asc' or 'desc'
  
  $: filteredFiles = files
    .filter(file => {
      const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
      const matchesSearch = file.originalFilename.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.uploadDate) - new Date(b.uploadDate);
          break;
        case 'name':
          comparison = a.originalFilename.localeCompare(b.originalFilename);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  
  $: categories = [...new Set(files.map(f => f.category))];

  async function deleteFile(file) {
    if (!confirm(`Are you sure you want to delete ${file.originalFilename}?`)) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/files/${file.category}/${file.storedFilename}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        dispatch('fileDeleted');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }

  function getFileIcon(category, mimetype) {
    if (category === 'images') return '🖼️';
    if (mimetype?.includes('pdf')) return '📄';
    if (mimetype?.includes('document') || mimetype?.includes('text')) return '📝';
    if (mimetype?.includes('video')) return '🎥';
    if (mimetype?.includes('audio')) return '🎵';
    if (mimetype?.includes('zip') || mimetype?.includes('rar')) return '📦';
    return '📁';
  }

  function getCategoryColor(category) {
    switch (category) {
      case 'images': return 'from-green-500 to-emerald-600';
      case 'documents': return 'from-purple-500 to-purple-600';
      case 'others': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  }

  function toggleSort(newSortBy) {
    if (sortBy === newSortBy) {
      sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    } else {
      sortBy = newSortBy;
      sortOrder = 'desc';
    }
  }
</script>

<div class="space-y-6">
  <!-- Enhanced Filters and Controls -->
  <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
    <!-- Search and Category Filter -->
    <div class="flex flex-col sm:flex-row gap-3 flex-1">
      <div class="relative flex-1 max-w-md">
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Search files..."
          class="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          bind:value={searchQuery}
        />
      </div>
      
      <div class="relative">
        <select
          class="appearance-none bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          bind:value={selectedCategory}
        >
          <option value="all">All Categories</option>
          {#each categories as category}
            <option value={category} class="capitalize">{category}</option>
          {/each}
        </select>
        <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </div>

    <!-- View Controls -->
    <div class="flex items-center space-x-3">
      <!-- Sort Options -->
      <div class="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-gray-200">
        <button
          class="px-3 py-2 text-sm rounded-lg transition-all duration-200 {sortBy === 'date' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}"
          on:click={() => toggleSort('date')}
        >
          Date {sortBy === 'date' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
        </button>
        <button
          class="px-3 py-2 text-sm rounded-lg transition-all duration-200 {sortBy === 'name' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}"
          on:click={() => toggleSort('name')}
        >
          Name {sortBy === 'name' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
        </button>
        <button
          class="px-3 py-2 text-sm rounded-lg transition-all duration-200 {sortBy === 'size' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}"
          on:click={() => toggleSort('size')}
        >
          Size {sortBy === 'size' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
        </button>
      </div>

      <!-- View Mode Toggle -->
      <div class="flex items-center space-x-1 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-gray-200">
        <button
          class="p-2 rounded-lg transition-all duration-200 {viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}"
          on:click={() => viewMode = 'grid'}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
        </button>
        <button
          class="p-2 rounded-lg transition-all duration-200 {viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}"
          on:click={() => viewMode = 'list'}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Files Display -->
  {#if filteredFiles.length > 0}
    {#if viewMode === 'grid'}
      <!-- Grid View -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {#each filteredFiles as file, index (file.id || file.storedFilename)}
          <div 
            class="group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            in:scale="{{ duration: 300, delay: index * 50 }}"
            animate:flip="{{ duration: 300 }}"
          >
            <!-- File Icon and Category Badge -->
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-r {getCategoryColor(file.category)} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <span class="text-2xl">{getFileIcon(file.category, file.mimetype)}</span>
              </div>
              <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full capitalize">
                {file.category}
              </span>
            </div>

            <!-- File Info -->
            <div class="space-y-2 mb-4">
              <h3 
                class="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors" 
                title={file.originalFilename}
              >
                {file.originalFilename}
              </h3>
              <div class="flex items-center space-x-2 text-sm text-gray-500">
                <span>{file.formattedSize}</span>
                <span>•</span>
                <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2">
              <a
                href={`http://localhost:3001${file.url}`}
                target="_blank"
                class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-xl transition-all duration-200 text-center transform hover:scale-105"
              >
                Open
              </a>
              <button
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                on:click={() => deleteFile(file)}
                title="Delete file"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- List View -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/80 backdrop-blur-sm">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200/50">
              {#each filteredFiles as file, index (file.id || file.storedFilename)}
                <tr 
                  class="hover:bg-gray-50/50 transition-colors duration-200"
                  in:fly="{{ x: -20, duration: 300, delay: index * 50 }}"
                  animate:flip="{{ duration: 300 }}"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center space-x-4">
                      <div class="w-10 h-10 bg-gradient-to-r {getCategoryColor(file.category)} rounded-lg flex items-center justify-center flex-shrink-0">
                        <span class="text-lg">{getFileIcon(file.category, file.mimetype)}</span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900 truncate" title={file.originalFilename}>
                          {file.originalFilename}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full capitalize">
                      {file.category}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.formattedSize}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <a
                      href={`http://localhost:3001${file.url}`}
                      target="_blank"
                      class="inline-flex items-center px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                    >
                      Open
                    </a>
                    <button
                      class="inline-flex items-center p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      on:click={() => deleteFile(file)}
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {:else}
    <!-- Empty State -->
    <div class="text-center py-16" in:fade>
      <div class="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mb-6">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
      <p class="text-gray-500">
        {searchQuery || selectedCategory !== 'all' 
          ? 'Try adjusting your search or filter criteria' 
          : 'Upload some files to get started'}
      </p>
    </div>
  {/if}
</div>
