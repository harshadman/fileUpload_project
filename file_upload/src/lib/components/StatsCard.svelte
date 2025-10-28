<script>
  export let title = '';
  export let value = 0;
  export let icon = '📊';
  export let gradient = 'from-blue-500 to-blue-600';
  
  import { fade, scale } from 'svelte/transition';
</script>

<div 
  class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  in:scale="{{ duration: 400 }}"
>
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p class="text-2xl font-bold text-gray-900">{value}</p>
    </div>
    <div class="p-3 bg-gradient-to-r {gradient} rounded-xl">
      <span class="text-2xl">{icon}</span>
    </div>
  </div>
</div>
