<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  
  const dispatch = createEventDispatcher();
  
  let files = [];
  let uploading = false;
  let uploadResults = [];
  let dragActive = false;
  let uploadProgress = 0;

  function handleFileSelect(event) {
    const selectedFiles = Array.from(event.target.files);
    files = [...files, ...selectedFiles];
  }

  function handleDrop(event) {
    event.preventDefault();
    dragActive = false;
    const droppedFiles = Array.from(event.dataTransfer.files);
    files = [...files, ...droppedFiles];
  }

  function handleDragOver(event) {
    event.preventDefault();
    dragActive = true;
  }

  function handleDragLeave(event) {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget)) {
      dragActive = false;
    }
  }

  function removeFile(index) {
    files = files.filter((_, i) => i !== index);
  }

  function clearAll() {
    files = [];
    uploadResults = [];
  }

  async function uploadFiles() {
    if (files.length === 0) return;
    
    uploading = true;
    uploadProgress = 0;
    uploadResults = [];

    // Simulate progress
    const progressInterval = setInterval(() => {
      uploadProgress = Math.min(uploadProgress + 10, 90);
    }, 200);

    try {
      if (files.length === 1) {
        await uploadSingleFile(files[0]);
      } else {
        await uploadMultipleFiles();
      }
    } finally {
      clearInterval(progressInterval);
      uploadProgress = 100;
      setTimeout(() => {
        uploading = false;
        uploadProgress = 0;
        files = [];
        dispatch('uploadSuccess');
      }, 500);
    }
  }

  async function uploadSingleFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/upload/single', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      uploadResults = [result];
    } catch (error) {
      uploadResults = [{ success: false, error: 'Upload failed' }];
    }
  }

  async function uploadMultipleFiles() {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      const response = await fetch('http://localhost:3001/api/upload/multiple', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      uploadResults = result.results || [];
    } catch (error) {
      uploadResults = [{ success: false, error: 'Upload failed' }];
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function getFileIcon(type) {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('document') || type.includes('text')) return '📝';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📁';
  }
</script>

<div class="space-y-6">
  <!-- Enhanced Drop Zone -->
  <div
    class="relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ease-in-out {
      dragActive 
        ? 'border-blue-400 bg-blue-50/50 scale-[1.02] shadow-lg' 
        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
    }"
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
  >
    {#if dragActive}
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-2xl animate-pulse"></div>
    {/if}
    
    <div class="relative space-y-6">
      <div class="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center transform transition-transform duration-300 {dragActive ? 'scale-110' : ''}">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
      </div>
      
      <div class="space-y-2">
        <label for="file-upload" class="cursor-pointer group">
          <span class="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            Drop files here or 
            <span class="text-blue-600 underline decoration-2 underline-offset-2">browse</span>
          </span>
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          class="hidden"
          on:change={handleFileSelect}
        />
        <p class="text-gray-500">Support for PNG, JPG, PDF, DOC and more • Up to 10MB each</p>
      </div>

      <div class="flex items-center justify-center space-x-4 text-sm text-gray-400">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Secure Upload</span>
        </div>
        <div class="w-px h-4 bg-gray-300"></div>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>Auto Organization</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Selected Files Preview -->
  {#if files.length > 0}
    <div class="space-y-4" in:fly="{{ y: 20, duration: 400 }}">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <span>📋</span>
          <span>Selected Files ({files.length})</span>
        </h3>
        <button
          type="button"
          class="text-sm text-gray-500 hover:text-red-600 transition-colors"
          on:click={clearAll}
        >
          Clear All
        </button>
      </div>
      
      <div class="grid gap-3 max-h-64 overflow-y-auto custom-scrollbar">
        {#each files as file, index (file.name + index)}
          <div 
            class="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200"
            in:scale="{{ duration: 200, delay: index * 50 }}"
          >
            <div class="flex items-center space-x-4 flex-1 min-w-0">
              <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <span class="text-lg">{getFileIcon(file.type)}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <div class="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span class="capitalize">{file.type.split('/')[0] || 'File'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              class="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              on:click={() => removeFile(index)}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Upload Button and Progress -->
  {#if files.length > 0}
    <div class="space-y-4" in:fade="{{ duration: 300 }}">
      <button
        type="button"
        class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        disabled={uploading}
        on:click={uploadFiles}
      >
        {#if uploading}
          <div class="flex items-center justify-center space-x-3">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Uploading... {uploadProgress}%</span>
          </div>
        {:else}
          <div class="flex items-center justify-center space-x-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <span>Upload {files.length} file{files.length !== 1 ? 's' : ''}</span>
          </div>
        {/if}
      </button>

      <!-- Progress Bar -->
      {#if uploading && uploadProgress > 0}
        <div class="bg-gray-200 rounded-full h-2 overflow-hidden" in:fade>
          <div 
            class="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
            style="width: {uploadProgress}%"
          ></div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Upload Results -->
  {#if uploadResults.length > 0}
    <div class="space-y-3" in:fly="{{ y: 20, duration: 400 }}">
      <h3 class="text-lg font-semibold text-gray-900">Upload Results</h3>
      {#each uploadResults as result, index}
        <div 
          class="p-4 rounded-xl border-l-4 {result.success ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}"
          in:scale="{{ duration: 200, delay: index * 100 }}"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center {result.success ? 'bg-green-500' : 'bg-red-500'}">
              {#if result.success}
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              {:else}
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              {/if}
            </div>
            <div class="flex-1">
              {#if result.success}
                <p class="font-medium text-green-800">
                  ✨ {result.file?.originalFilename || 'File'} uploaded successfully
                </p>
                <p class="text-sm text-green-600 mt-1">
                  {result.file?.formattedSize} • {result.file?.category}
                </p>
              {:else}
                <p class="font-medium text-red-800">
                  ❌ {result.filename || 'File'} failed to upload
                </p>
                {#if result.errors}
                  <ul class="text-sm text-red-600 mt-1 space-y-1">
                    {#each result.errors as error}
                      <li class="flex items-center space-x-1">
                        <span>•</span>
                        <span>{error}</span>
                      </li>
                    {/each}
                  </ul>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
</style>
