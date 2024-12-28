<script>
  export let onResize = (width) => {};
  let isDragging = false;
  let startX;
  let startWidth;
  
  function handleMouseDown(event) {
    isDragging = true;
    startX = event.clientX;
    startWidth = document.querySelector('.middle-column').offsetWidth;
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.classList.add('resize-active');
  }
  
  function handleMouseMove(event) {
    if (!isDragging) return;
    
    const diff = event.clientX - startX;
    const newWidth = Math.max(200, Math.min(startWidth + diff, window.innerWidth - 800));
    onResize(newWidth);
  }
  
  function handleMouseUp() {
    isDragging = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    document.body.classList.remove('resize-active');
  }
</script>

<div
  class="h-full w-full group-hover:bg-gray-100 flex items-center justify-center cursor-col-resize relative"
  on:mousedown={handleMouseDown}
>
  <!-- 拖动指示器 -->
  <div class="flex space-x-0.5 items-center h-24 px-1">
    <div class="w-0.5 h-full bg-gray-300 group-hover:bg-blue-400 rounded-full transition-colors"></div>
    <div class="w-0.5 h-full bg-gray-300 group-hover:bg-blue-400 rounded-full transition-colors"></div>
  </div>

  <!-- 悬停时显示的提示 -->
  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              opacity-0 group-hover:opacity-100 transition-opacity
              whitespace-nowrap bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
    拖动调整宽度
  </div>
</div>

<style>
  :global(.resize-active) {
    cursor: col-resize !important;
    user-select: none;
  }
  
  :global(.resize-active iframe) {
    pointer-events: none;
  }

  :global(.resize-active .group-hover\:bg-gray-100) {
    background-color: rgba(59, 130, 246, 0.1);
  }

  :global(.resize-active .group-hover\:bg-blue-400) {
    background-color: rgb(59, 130, 246);
  }
</style> 